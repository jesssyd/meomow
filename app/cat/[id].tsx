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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await CatStorage.getCatById(id);
        console.log('Loaded cat data:', data); // Debug log
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
  
  // Get ALL photos - try multiple approaches to ensure we get them
  let allPhotos: string[] = [];
  
  // First try photoUris (new format)
  if (cat.photoUris && Array.isArray(cat.photoUris) && cat.photoUris.length > 0) {
    allPhotos = cat.photoUris.filter(uri => uri && uri.trim()); // Remove empty strings
  }
  // Fallback to single photoUri (old format)
  else if (cat.photoUri && cat.photoUri.trim()) {
    allPhotos = [cat.photoUri];
  }

  console.log('All photos for cat:', allPhotos); // Debug log

  const currentPhoto = allPhotos.length > 0 ? allPhotos[currentPhotoIndex] || allPhotos[0] : null;

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
        {/* Photo Gallery - ALWAYS SHOW THIS SECTION */}
        <View style={styles.imageContainer}>
          {currentPhoto ? (
            <Image 
              source={{ uri: currentPhoto }} 
              style={styles.catImage}
              onError={(error) => console.log('Image load error:', error)}
            />
          ) : (
            <View style={[styles.catImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}
          
          {/* Photo indicators and navigation - show if multiple photos */}
          {allPhotos.length > 1 && (
            <View style={styles.photoNavigation}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoThumbnails}
              >
                {allPhotos.map((photo, index) => (
                  <TouchableOpacity
                    key={`${photo}-${index}`}
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
          
          {/* Always show photo count for debugging */}
          <Text style={styles.debugText}>
            Photos found: {allPhotos.length}
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          {/* Cat Name - ALWAYS SHOW */}
          <Text style={styles.catName}>{catName}</Text>
          <Text style={styles.lastUpdated}>
            last updated: {formatDate(cat.lastUpdated || cat.dateAdded)}
          </Text>

          {/* Location - ALWAYS SHOW SECTION */}
          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.primary.text} />
            <Text style={styles.locationText}>
              {(cat.location?.address && cat.location.address.trim()) 
                ? cat.location.address 
                : 'Location not specified'
              }
            </Text>
          </View>

          {/* Facts section - ALWAYS SHOW */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{catName} is...</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  • a {(cat.breed && cat.breed.trim() && cat.breed !== 'Unknown') 
                      ? cat.breed.toLowerCase() 
                      : 'mystery'} cat
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  • {(cat.age && cat.age.trim() && cat.age !== 'Unknown') 
                      ? cat.age.toLowerCase() 
                      : 'age unknown'}
                </Text>
              </View>
            </View>
          </View>

          {/* Personality - ALWAYS SHOW SECTION */}
          <View style={styles.personalitySection}>
            <Text style={styles.sectionTitle}>personality</Text>
            <View style={styles.personalityContainer}>
              {(Array.isArray(cat.personality) && cat.personality.length > 0) ? (
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

          {/* Notes - ALWAYS SHOW SECTION */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>
                {(cat.notes && cat.notes.trim()) 
                  ? cat.notes 
                  : 'No notes added yet'
                }
              </Text>
            </View>
          </View>

          {/* Debug info - remove this after testing */}
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
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    opacity: 0.5,
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

  notesSection: { marginBottom: 20 },
  notesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 48, 41, 0.1)',
  },
  notesText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    lineHeight: 22,
  },

  noDataText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    opacity: 0.6,
    fontStyle: 'italic',
  },

  editButton: {
    backgroundColor: Colors.button.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  editButtonText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.heading,
    color: Colors.button.primaryText,
  },

  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.button.primary,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.button.primaryText,
  },

  // Debug styles - remove these after testing
  debugSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
  },
  debugTitle: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontFamily: 'Jua-Regular',
    fontSize: 12,
    color: Colors.primary.text,
    opacity: 0.8,
    marginBottom: 4,
  },

  loadingText: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text, marginTop: 12 },
  errorText: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text },
});