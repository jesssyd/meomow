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
        if (alive) setLoading(false);
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

  const GRID_COLUMNS = 3;
  const H_PADDING = 20;
  const GAP = 8;
  const thumbSize =
    (width - H_PADDING * 2 - GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  const hasNotes = !!(cat.notes && cat.notes.trim());

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background image fills entire screen, centered, above color and below content */}
      <View style={styles.patternContainer} pointerEvents="none">
        <Image
          source={require('@/assets/images/background.png')}
          style={styles.bgPattern}
          resizeMode="cover"
        />
      </View>

      {/* Foreground content layer */}
      <View style={styles.contentLayer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.primary.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{catName}</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Pencil size={20} color={Colors.primary.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Last Updated above photos, left aligned */}
          <Text style={styles.lastUpdated}>
            last updated: {formatDate(cat.lastUpdated || cat.dateAdded)}
          </Text>

          {/* Photo Grid with green background */}
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
                      onError={(e) =>
                        console.log('Image load error:', e.nativeEvent.error)
                      }
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.gridPlaceholder, { height: thumbSize }]}>
                <Text style={styles.placeholderText}>no photos</Text>
              </View>
            )}
          </View>

          {/* Location below photos, left aligned */}
          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.primary.text} strokeWidth={2.5} />
            <Text style={styles.locationText}>
              {cat.location?.address && cat.location.address.trim()
                ? cat.location.address
                : 'Location not specified'}
            </Text>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            {/* Facts */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>{catName} is...</Text>
              <View style={styles.infoGrid}>
                <Text style={styles.infoLabel}>
                  • a {cat.breed && cat.breed.trim() && cat.breed !== 'Unknown'
                    ? cat.breed.toLowerCase()
                    : 'mystery'} cat
                </Text>
                <Text style={styles.infoLabel}>
                  • {cat.age && cat.age.trim() && cat.age !== 'Unknown'
                    ? cat.age.toLowerCase()
                    : 'age unknown'}
                </Text>
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
                  <Text style={[styles.noDataText, styles.inactiveText]}>
                    no personality traits specified
                  </Text>
                )}
              </View>
            </View>

            {/* Notes without box or border, aligned to header */}
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>notes</Text>
              <Text style={[styles.notesText, !hasNotes && styles.inactiveText]}>
                {hasNotes ? cat.notes : 'no notes added yet'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Base
  container: { flex: 1, backgroundColor: Colors.primary.backgroundGreen },
  center: { justifyContent: 'center', alignItems: 'center' },

  // Background image layer
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject, // fill whole screen
    opacity: 0.05,                    // keep it subtle on top of color
  },

  // Foreground content layer
  contentLayer: { flex: 1, zIndex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary.backgroundGreen,
  },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },

  content: { flex: 1 },

  // Last updated
  lastUpdated: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginLeft: 20,
    marginTop: 12,
  },

  // Gallery
  galleryContainer: {
    backgroundColor: Colors.backgroundGreen,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  galleryTitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    marginBottom: 12,
    textTransform: 'lowercase',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(56, 48, 41, 0.1)',
  },
  gridImage: { width: '100%', height: '100%' },
  gridPlaceholder: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 48, 41, 0.1)',
  },
  placeholderText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    opacity: 0.5,
  },

  // Location
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginVertical: 12,
  },
  locationText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginLeft: 8,
  },

  // Details
  detailsContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  infoSection: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    marginBottom: 12,
    textTransform: 'lowercase',
  },
  infoGrid: { gap: 8 },
  infoLabel: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },

  // Personality
  personalitySection: { marginBottom: 20 },
  personalityContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  personalityChip: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    backgroundColor: Colors.personality.unselected.background,
    borderColor: Colors.personality.unselected.border,
  },
  personalityText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.personality.unselected.text,
    textAlign: 'center',
  },

  // Notes
  notesSection: { marginBottom: 20 },
  notesText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    lineHeight: 22,
  },

  // Empty states etc.
  noDataText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    fontStyle: 'italic',
  },
  inactiveText: { color: Colors.primary.textInactive },

  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.button.primary,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.button.primaryText,
  },

  loadingText: { fontFamily: 'Jua-Regular', ...FontSizes.body, color: Colors.primary.text, marginTop: 12 },
  errorText: { fontFamily: 'Jua-Regular', ...FontSizes.body, color: Colors.primary.text },
});
