// app/cat/[id].tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
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

export default function CatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      const data = await CatStorage.getCatById(id);
      if (alive) {
        setCat(data);
        setLoading(false);
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

  const handleDelete = () => {
    if (!cat) return;
    Alert.alert(
      'Delete Cat',
      `Are you sure you want to delete ${cat.name || 'this cat'} from your catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ok = await CatStorage.deleteCat(cat.id);
            if (ok) router.back();
            else Alert.alert('Error', 'Failed to delete cat. Please try again.');
          },
        },
      ],
    );
  };

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
      </SafeAreaView>
    );
  }

  const catName = cat.name || '???';
  const lastUpdated = new Date(cat.lastUpdated).toLocaleDateString();
  
  // Get all photos (prioritize photoUris, fallback to photoUri)
  const allPhotos = cat.photoUris && cat.photoUris.length > 0 
    ? cat.photoUris 
    : cat.photoUri 
    ? [cat.photoUri] 
    : [];

  const currentPhoto = allPhotos[currentPhotoIndex] || allPhotos[0];

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
        {/* Photo Gallery */}
        <View style={styles.imageContainer}>
          {currentPhoto ? (
            <Image source={{ uri: currentPhoto }} style={styles.catImage} />
          ) : (
            <View style={styles.catImage} />
          )}
          
          {/* Photo indicators and navigation */}
          {allPhotos.length > 1 && (
            <View style={styles.photoNavigation}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoThumbnails}
              >
                {allPhotos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.thumbnail,
                      index === currentPhotoIndex && styles.activeThumbnail
                    ]}
                    onPress={() => setCurrentPhotoIndex(index)}
                  >
                    <Image source={{ uri: photo }} style={styles.thumbnailImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <Text style={styles.photoCounter}>
                {currentPhotoIndex + 1} of {allPhotos.length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.catName}>{catName}</Text>
          <Text style={styles.lastUpdated}>last updated: {lastUpdated}</Text>

          {/* Location */}
          {cat.location?.address ? (
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.primary.text} />
              <Text style={styles.locationText}>{cat.location.address}</Text>
            </View>
          ) : null}

          {/* Facts */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{catName} is...</Text>
            <View style={styles.infoGrid}>
              {!!cat.breed && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>• a {cat.breed} cat</Text>
                </View>
              )}
              {!!cat.age && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>• {cat.age}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Personality */}
          {Array.isArray(cat.personality) && cat.personality.length > 0 ? (
            <View style={styles.personalitySection}>
              <View style={styles.personalityContainer}>
                {cat.personality.map((trait) => (
                  <View key={trait} style={styles.personalityChip}>
                    <Text style={styles.personalityText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Notes */}
          {!!cat.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>notes</Text>
              <Text style={styles.notesText}>{cat.notes}</Text>
            </View>
          )}

          {/* Delete */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Cat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.backgroundAlt },
  center: { justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary.background,
  },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },

  content: { flex: 1 },

  imageContainer: {
    backgroundColor: Colors.primary.background,
    paddingBottom: 20,
    alignItems: 'center',
  },
  catImage: {
    width: 280,
    height: 280,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 48, 41, 0.1)',
  },

  // Photo navigation
  photoNavigation: {
    marginTop: 16,
    alignItems: 'center',
  },
  photoThumbnails: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: Colors.primary.text,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  photoCounter: {
    fontFamily: 'Jua-Regular',
    fontSize: 12,
    color: Colors.primary.text,
    opacity: 0.7,
    marginTop: 8,
  },

  detailsContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  catName: {
    fontFamily: 'Jua-Regular',
    fontSize: 32,
    color: Colors.primary.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    fontFamily: 'Jua-Regular',
    fontSize: 14,
    color: Colors.primary.text,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 20,
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    marginLeft: 8,
  },

  infoSection: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.heading,
    color: Colors.primary.text,
    marginBottom: 12,
  },
  infoGrid: { gap: 8 },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
  },

  personalitySection: { marginBottom: 20 },
  personalityContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  personalityChip: {
    backgroundColor: Colors.personality.selected.background,
    borderColor: Colors.personality.selected.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  personalityText: { fontFamily: 'Jua-Regular', fontSize: 14, color: Colors.personality.selected.text },

  notesSection: { marginBottom: 40 },
  notesText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    lineHeight: 22,
  },

  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  deleteButtonText: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: '#FF3B30' },

  loadingText: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text, marginTop: 12 },
  errorText: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text },
});