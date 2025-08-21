// app/cat/[id].tsx
import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Pencil } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { FontSizes } from '@/constants/Fonts';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';

const { width } = Dimensions.get('window');

function formatDate(iso?: string) {
  if (!iso) return 'unknown date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'unknown date';
  return d
    .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    .toLowerCase();
}

export default function CatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await CatStorage.getCatById(id);
        if (alive) {
          setCat(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading cat:', error);
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleEdit = () => {
    if (!cat) return;
    router.push({ pathname: '/add-cat', params: { catId: cat.id } });
  };

  // Collect all photos once
  const allPhotos = useMemo(() => {
    if (!cat) return [] as string[];
    if (cat.photoUris && Array.isArray(cat.photoUris) && cat.photoUris.length > 0) {
      return cat.photoUris.filter((uri) => uri && uri.trim());
    }
    if (cat.photoUri && cat.photoUri.trim()) {
      return [cat.photoUri];
    }
    return [];
  }, [cat]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={Colors.primary.text} />
        <Text style={styles.loadingText}>Loading kitty...</Text>
      </SafeAreaView>
    );
  }

  if (!cat) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Cat not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const catName = cat.name || 'Unknown Cat';

  // Layout math for a compact grid that keeps details visible in the same scroll
  const GRID_COLUMNS = 3;
  const H_PADDING = 20; // matches detailsContainer horizontal padding
  const GAP = 8;
  const thumbSize =
    (width - H_PADDING * 2 - GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.primary.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{catName}</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
          <Pencil size={20} color={Colors.primary.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Grid - shows every image at once */}
        <View style={styles.galleryContainer}>
          <Text style={styles.galleryTitle}>photos</Text>

          {allPhotos.length > 0 ? (
            <View style={[styles.grid, { gap: GAP }]}>
              {allPhotos.map((uri, idx) => (
                <View
                  key={`${uri}-${idx}`}
                  style={[styles.gridItem, { width: thumbSize, height: thumbSize }]}
                >
                  <Image
                    source={{ uri }}
                    style={styles.gridImage}
                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.gridPlaceholder, { height: thumbSize }]}>
              <Text style={styles.placeholderText}>No Photos</Text>
            </View>
          )}

          {/* lightweight info line keeps context visible */}
          <Text style={styles.photoMeta}>
            {allPhotos.length} photo{allPhotos.length === 1 ? '' : 's'}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          {/* Cat Name */}
          <Text style={styles.catName}>{catName}</Text>
          <Text style={styles.lastUpdated}>
            last updated: {formatDate(cat.lastUpdated || cat.dateAdded)}
          </Text>

          {/* Location */}
          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.primary.text} />
            <Text style={styles.locationText}>
              {cat.location?.address && cat.location.address.trim()
                ? cat.location.address
                : 'Location not specified'}
            </Text>
          </View>

          {/* Facts */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{catName} is...</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  • a {cat.breed && cat.breed.trim() && cat.breed !== 'Unknown'
                    ? cat.breed.toLowerCase()
                    : 'mystery'}{' '}
                  cat
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  • {cat.age && cat.age.trim() && cat.age !== 'Unknown'
                    ? cat.age.toLowerCase()
                    : 'age unknown'}
                </Text>
              </View>
            </View>
          </View>

          {/* Personality */}
          <View style={styles.personalitySection}>
            <Text style={styles.sectionTitle}>personality</Text>
            <View style={styles.personalityContainer}>
              {Array.isArray(cat.personality) && cat.personality.length > 0 ? (
                cat.personality.map((trait, index) => (
                  <View key={`${trait}-${index}`} style={styles.personalityChip}>
                    <Text style={styles.personalityText}>{trait}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No personality traits specified</Text>
              )}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>
                {cat.notes && cat.notes.trim() ? cat.notes : 'No notes added yet'}
              </Text>
            </View>
          </View>

          {/* Debug */}
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>ID: {cat.id}</Text>
            <Text style={styles.debugText}>Name: {cat.name || 'No name'}</Text>
            <Text style={styles.debugText}>Breed: {cat.breed || 'No breed'}</Text>
            <Text style={styles.debugText}>Age: {cat.age || 'No age'}</Text>
            <Text style={styles.debugText}>Personality: {cat.personality?.length || 0} traits</Text>
            <Text style={styles.debugText}>Notes: {cat.notes ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>PhotoUri: {cat.photoUri ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>PhotoUris: {cat.photoUris?.length || 0} photos</Text>
          </View>

          {/* Edit button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>edit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, b