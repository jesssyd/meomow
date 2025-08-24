import { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, FontSizes } from '@/constants';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Grid layout
const H_PADDING = 16;
const GUTTER = 16;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GUTTER) / 2;
const FRAME_W = 172;
const FRAME_H = 204;
const CUTOUT_W = 135;
const CUTOUT_H = 121;
const CUTOUT_TOP = 20;

// Scale all inner measurements to our card width
const SCALE = CARD_WIDTH / FRAME_W;
const CARD_HEIGHT = FRAME_H * SCALE;

// Scaled cutout rect and text box
const PHOTO_W = CUTOUT_W * SCALE;
const PHOTO_H = CUTOUT_H * SCALE;
const PHOTO_TOP = CUTOUT_TOP * SCALE;
const TEXT_W = 160 * SCALE;
const TEXT_H = 57 * SCALE;

function formatDate(iso?: string) {
  if (!iso) return 'unknown date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'unknown date';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase();
}

export default function CatalogScreen() {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await CatStorage.getAllCats();
    all.sort((a, b) => {
      const ad = new Date(a.lastUpdated || a.dateAdded || 0).getTime();
      const bd = new Date(b.lastUpdated || b.dateAdded || 0).getTime();
      return bd - ad;
    });
    setCats(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>catalog</Text>
              <Text style={styles.subtitle}>...</Text>
            </View>
            <Image 
              source={require('@/assets/images/meomow-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
        <View style={styles.center}>
          <Text style={styles.loading}>loading kitties...</Text>
        </View>
      </View>
    );
  }

  if (cats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>catalog</Text>
              <Text style={styles.subtitle}>0 kitties found</Text>
            </View>
            <Image 
              source={require('@/assets/images/meomow-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyHeading}>meow! no cats here...</Text>
          <Text style={styles.emptyBody}>tap + to add your first kitty</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>catalog</Text>
            <Text style={styles.subtitle}>
              {cats.length} {cats.length === 1 ? 'kitty' : 'kitties'} found
            </Text>
          </View>
          <Image 
            source={require('@/assets/images/meomow-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        data={cats}
        keyExtractor={(c) => c.id}
        numColumns={2}
        renderItem={({ item }) => {
          const latestPhoto =
            item.photoUris && item.photoUris.length > 0
              ? item.photoUris[item.photoUris.length - 1]
              : item.photoUri;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/cat/${item.id}`)}
              style={styles.cardTap}
            >
              <View style={styles.frameBox}>
                {/* Photo sits BEHIND the frame, positioned to the cutout */}
                {latestPhoto ? (
                  <Image
                    source={{ uri: latestPhoto }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.photo, { backgroundColor: 'rgba(56,48,41,0.1)' }]} />
                )}

                {/* Frame overlay fills the card */}
                <Image
                  source={require('@/assets/images/framePink.png')}
                  style={styles.frameOverlay}
                  resizeMode="stretch"
                />

                {/* Bottom text box, centered */}
                <View style={styles.textBox}>
                  <Text style={styles.date}>{formatDate(item.lastUpdated || item.dateAdded)}</Text>
                  <Text style={styles.name}>{item.name || '???'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  header: {
    paddingHorizontal: H_PADDING,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    height: 50,
    width: 50,
  },
  title: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
  },
  subtitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.textInactive,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.backgroundAlt,
  },
  loading: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },
  emptyBody: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyHeading: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },

  list: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 16,
    paddingTop: 8,
    rowGap: 16,
  },

  // Two column card
  cardTap: {
    width: CARD_WIDTH,
  },

  // Root of a single framed card
  frameBox: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },

  // Scaled photo positioned to the cutout window
  photo: {
    position: 'absolute',
    width: PHOTO_W,
    height: PHOTO_H,
    top: PHOTO_TOP,
    left: (CARD_WIDTH - PHOTO_W) / 2, // center horizontally in the window
  },

  // Frame image overlay across the whole card
  frameOverlay: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    left: 0,
    top: 0,
  },
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, MapPin, RefreshCw, X as XIcon } from 'lucide-react-native';
import uuid from 'react-native-uuid';

import { Colors } from '@/constants/Colors';
import { FontSizes } from '@/constants/Fonts';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';
import { LocationService } from '@/utils/location';
import { PersonalityChip } from '@/components/PersonalityChip';
import Select from '@/components/Select';
import { PhotoInbox } from '@/utils/photoInbox';

const PERSONALITY_OPTIONS = [
  'shy','silly','sweet','moody','vocal','friendly','playful','sleepy','energetic', 'mean', 'scared', 'curious', 'affectionate', 'boring', 'grumpy'
];

const BREEDS = ['tabby','calico','siamese','persian','maine coon','bengal','ragdoll','sphynx','british shorthair','other'];
const AGES = ['kitten (0-1 year)','young (1-3 years)','adult (3-7 years)','senior (7+ years)'];

const initialForm = {
  name: '',
  location: { address: 'getting location...', coordinates: undefined as undefined | { latitude: number; longitude: number } },
  breed: '',
  age: '',
  personality: [] as string[],
  notes: '',
  photoUris: [] as string[],
};

export default function AddCatScreen() {
  const router = useRouter();
  const { catId } = useLocalSearchParams<{ catId?: string }>();

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({ ...initialForm });

  const isEditing = !!catId;

  // Pick up any newly confirmed photos when you return from the camera/preview
  useFocusEffect(
    useCallback(() => {
      const newOnes = PhotoInbox.consumeAll();
      
      if (newOnes.length) {
        setFormData(prev => {
          const combined = [...prev.photoUris, ...newOnes];
          const capped = combined.slice(0, 3); // cap at 3
          
          return {
            ...prev,
            photoUris: capped,
          };
        });
      }
    }, []) // Remove formData dependency to avoid stale closure
  );

  useEffect(() => {
    if (isEditing && catId) {
      (async () => {
        setLoading(true);
        try {
          const cat = await CatStorage.getCatById(catId);
          
          if (cat) {
            // Ensure we're using the photoUris array properly
            const photoUris = cat.photoUris && cat.photoUris.length > 0 
              ? cat.photoUris 
              : cat.photoUri 
                ? [cat.photoUri] 
                : [];
            
            setFormData({
              name: cat.name ?? '',
              location: cat.location ?? { address: 'Unknown location' },
              breed: cat.breed ?? '',
              age: cat.age ?? '',
              personality: Array.isArray(cat.personality) ? cat.personality : [],
              notes: cat.notes ?? '',
              photoUris: photoUris,
            });
          }
        } finally {
          setLoading(false);
        }
      })();
    } else {
      getCurrentLocation();
    }
  }, [catId]);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const locationData = await LocationService.getCurrentLocation();
      setFormData(prev => ({ ...prev, location: locationData }));
    } catch {
      setFormData(prev => ({ ...prev, location: { address: 'unable to get location' } }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleTakePhoto = () => {
    // push camera (add-cat stays mounted under it)
    router.push('/camera');
  };

  const handleDeletePhoto = (index: number) => {
    Alert.alert('delete photo', 'are you sure you want to delete this photo?', [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'delete',
        style: 'destructive',
        onPress: () => {
          setFormData(prev => {
            const next = [...prev.photoUris]; // Create a new array
            next.splice(index, 1);
            return { ...prev, photoUris: next };
          });
        },
      },
    ]);
  };

  const handlePersonalityToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(p => p !== trait)
        : [...prev.personality, trait],
    }));
  };

  const canSave = formData.photoUris.length > 0 && !loading;

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('missing photo', 'please add at least one photo of the cat.');
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const existing = isEditing && catId ? await CatStorage.getCatById(catId) : null;

      const photos = formData.photoUris.slice(0, 3);
      const latest = photos[photos.length - 1];

      const cat: Cat = {
        id: catId || (uuid.v4() as string),
        name: formData.name.trim() || '???',
        // keep both fields for compatibility
        photoUri: latest,
        photoUris: photos,
        location: formData.location,
        breed: formData.breed.trim() || 'unknown',
        age: formData.age.trim() || 'unknown',
        personality: formData.personality,
        notes: formData.notes.trim(),
        dateAdded: existing?.dateAdded ?? now,
        lastUpdated: now,
      };

      await CatStorage.saveCat(cat);

      // Reset for next add
      if (!isEditing) {
        setFormData({ ...initialForm });
        await getCurrentLocation();
      }

      Alert.alert('success!', `${cat.name} has been ${isEditing ? 'updated' : 'added to'} your catalog!`, [
        { text: 'okie', onPress: () => (isEditing ? router.back() : router.push('/(tabs)/')) },
      ]);
    } catch (error) {
      console.error('error saving cat:', error);
      Alert.alert('error', 'failed to save cat. please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.text} />
          <Text style={styles.loadingText}>loading cat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canAddMore = formData.photoUris.length < 3;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.primary.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'edit cat!' : 'new cat!'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>photos ({formData.photoUris.length}/3)</Text>

          {/* Photo grid */}
          <View style={styles.grid}>
            {formData.photoUris.map((uri, idx) => (
              <View key={`${uri}-${idx}`} style={styles.tile}>
                <Image source={{ uri }} style={styles.tileImg} />
                <TouchableOpacity style={styles.deleteBadge} onPress={() => handleDeletePhoto(idx)}>
                  <XIcon size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}

            {canAddMore && (
              <TouchableOpacity style={[styles.tile, styles.addTile]} onPress={handleTakePhoto}>
                <Camera size={28} color={Colors.primary.text} />
                <Text style={styles.addTileText}>add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>what's their name?</Text>
          <TextInput
            style={styles.inputField}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="add name"
            placeholderTextColor={Colors.primary.textInactive}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>where did you find them?</Text>
          <TouchableOpacity style={styles.inputField} onPress={getCurrentLocation} disabled={locationLoading}>
            <MapPin size={16} color={Colors.primary.text} />
            <Text style={styles.inputFieldText}>
              {locationLoading ? 'getting location...' : formData.location.address}
            </Text>
            {locationLoading ? <ActivityIndicator size="small" color={Colors.primary.text} /> : <RefreshCw size={16} color={Colors.primary.text} />}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>what kind of cat?</Text>
          <Select value={formData.breed} options={BREEDS} placeholder="choose" onChange={(v) => setFormData(p => ({ ...p, breed: v }))} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>how old are they?</Text>
          <Select value={formData.age} options={AGES} placeholder="choose" onChange={(v) => setFormData(p => ({ ...p, age: v }))} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>personality</Text>
          <View style={styles.personalityContainer}>
            {PERSONALITY_OPTIONS.map((trait) => (
              <PersonalityChip
                key={trait}
                label={trait}
                selected={formData.personality.includes(trait)}
                onPress={handlePersonalityToggle}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>notes</Text>
          <TextInput
            style={[styles.inputField, styles.notesInput]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="add notes"
            placeholderTextColor={Colors.primary.textInactive}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.button.primaryText} />
          ) : (
            <Text style={styles.saveButtonText}>{isEditing ? 'update cat' : 'save to catalog'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const TILE_HEIGHT = 112;

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginTop: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },

  // Section labels
  sectionLabel: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginBottom: 12,
  },

  // Input fields (consistent styling)
  inputField: {
    backgroundColor: Colors.input.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.input.border,
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFieldText: {
    flex: 1,
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginLeft: 8,
    marginRight: 8,
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  // Photo grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: TILE_HEIGHT,
    height: TILE_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(56,48,41,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileImg: {
    width: '100%',
    height: '100%',
  },
  addTile: {
    backgroundColor: Colors.inputAlt.background,
    borderWidth: 2,
    borderColor: Colors.inputAlt.border,
    borderStyle: 'dashed',
  },
  addTileText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.text,
    marginTop: 4,
  },
  deleteBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.error.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Personality
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Save button
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.primary.background,
  },
  saveButton: {
    backgroundColor: Colors.button.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.button.disabled,
  },
  saveButtonText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.button.primaryText,
  },

  // Spacing
  bottomSpacer: {
    height: 100,
  },
}); 

can you add the background image to this page as well like you did for:
// Catalog screen with white frame card
import { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, FontSizes } from '@/constants';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Grid layout
const H_PADDING = 16;
const GUTTER = 16;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GUTTER) / 2;

// Frame geometry
const FRAME_W = 172;
const FRAME_H = 204;
const CUTOUT_W = 135;
const CUTOUT_H = 121;
const CUTOUT_TOP = 20;

// Text box geometry
const TEXT_W_RAW = 160;
const TEXT_H_RAW = 57;

// Scale to device width
const SCALE = CARD_WIDTH / FRAME_W;
const CARD_HEIGHT = FRAME_H * SCALE;
const PHOTO_W = CUTOUT_W * SCALE;
const PHOTO_H = CUTOUT_H * SCALE;
const PHOTO_TOP = CUTOUT_TOP * SCALE;
const TEXT_W = TEXT_W_RAW * SCALE;
const TEXT_H = TEXT_H_RAW * SCALE;

function formatDate(iso?: string) {
  if (!iso) return 'unknown date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'unknown date';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase();
}

export default function CatalogScreen() {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await CatStorage.getAllCats();
    all.sort((a, b) => {
      const ad = new Date(a.lastUpdated || a.dateAdded || 0).getTime();
      const bd = new Date(b.lastUpdated || b.dateAdded || 0).getTime();
      return bd - ad;
    });
    setCats(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>catalog</Text>
          <Text style={styles.subtitle}>...</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.loading}>loading kitties...</Text>
        </View>
      </View>
    );
  }

  if (cats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>catalog</Text>
          <Text style={styles.subtitle}>0 kitties found</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyHeading}>meow! no cats here...</Text>
          <Text style={styles.emptyBody}>tap + to add your first kitty</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>catalog</Text>
        <Text style={styles.subtitle}>
          {cats.length} {cats.length === 1 ? 'kitty' : 'kitties'} found
        </Text>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        data={cats}
        keyExtractor={(c) => c.id}
        numColumns={2}
        renderItem={({ item }) => {
          const latestPhoto =
            item.photoUris && item.photoUris.length > 0
              ? item.photoUris[item.photoUris.length - 1]
              : item.photoUri;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/cat/${item.id}`)}
              style={styles.cardTap}
            >
              <View style={styles.frameBox}>
                {/* Photo behind the white frame */}
                {latestPhoto ? (
                  <Image
                    source={{ uri: latestPhoto }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.photo, { backgroundColor: 'rgba(56,48,41,0.1)' }]} />
                )}

                {/* White frame overlay */}
                <Image
                  source={require('@/assets/images/frameWhite.png')}
                  style={styles.frameOverlay}
                  resizeMode="stretch"
                />

                {/* Bottom text box, centered inside */}
                <View style={styles.textBox}>
                  <Text style={styles.date}>{formatDate(item.lastUpdated || item.dateAdded)}</Text>
                  <Text style={styles.name}>{item.name || '???'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  header: {
    paddingHorizontal: H_PADDING,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  title: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
  },
  subtitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.textInactive,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.backgroundAlt,
  },
  loading: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },
  emptyBody: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyHeading: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },

  list: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 16,
    paddingTop: 8,
    rowGap: 16,
  },

  // Two column card
  cardTap: {
    width: CARD_WIDTH,
  },

  // Frame root
  frameBox: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },

  // Photo positioned to the cutout window
  photo: {
    position: 'absolute',
    width: PHOTO_W,
    height: PHOTO_H,
    top: PHOTO_TOP,
    left: (CARD_WIDTH - PHOTO_W) / 2,
    borderRadius: 6,
  },

  // Frame overlay
  frameOverlay: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    left: 0,
    top: 0,
  },

  // Text box 160x57 scaled, centered and pinned to bottom
  textBox: {
    position: 'absolute',
    width: TEXT_W,
    height: TEXT_H,
    left: (CARD_WIDTH - TEXT_W) / 2,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  date: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.text,
    opacity: 0.7,
    textTransform: 'lowercase',
  },
  name: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },
});

please don't make any text capitalized where it is lower caseimport { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, MapPin, RefreshCw, X as XIcon } from 'lucide-react-native';
import uuid from 'react-native-uuid';

import { Colors } from '@/constants/Colors';
import { FontSizes } from '@/constants/Fonts';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';
import { LocationService } from '@/utils/location';
import { PersonalityChip } from '@/components/PersonalityChip';
import Select from '@/components/Select';
import { PhotoInbox } from '@/utils/photoInbox';

const PERSONALITY_OPTIONS = [
  'shy','silly','sweet','moody','vocal','friendly','playful','sleepy','energetic', 'mean', 'scared', 'curious', 'affectionate', 'boring', 'grumpy'
];

const BREEDS = ['tabby','calico','siamese','persian','maine coon','bengal','ragdoll','sphynx','british shorthair','other'];
const AGES = ['kitten (0-1 year)','young (1-3 years)','adult (3-7 years)','senior (7+ years)'];

const initialForm = {
  name: '',
  location: { address: 'getting location...', coordinates: undefined as undefined | { latitude: number; longitude: number } },
  breed: '',
  age: '',
  personality: [] as string[],
  notes: '',
  photoUris: [] as string[],
};

export default function AddCatScreen() {
  const router = useRouter();
  const { catId } = useLocalSearchParams<{ catId?: string }>();

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({ ...initialForm });

  const isEditing = !!catId;

  // Pick up any newly confirmed photos when you return from the camera/preview
  useFocusEffect(
    useCallback(() => {
      const newOnes = PhotoInbox.consumeAll();
      
      if (newOnes.length) {
        setFormData(prev => {
          const combined = [...prev.photoUris, ...newOnes];
          const capped = combined.slice(0, 3); // cap at 3
          
          return {
            ...prev,
            photoUris: capped,
          };
        });
      }
    }, []) // Remove formData dependency to avoid stale closure
  );

  useEffect(() => {
    if (isEditing && catId) {
      (async () => {
        setLoading(true);
        try {
          const cat = await CatStorage.getCatById(catId);
          
          if (cat) {
            // Ensure we're using the photoUris array properly
            const photoUris = cat.photoUris && cat.photoUris.length > 0 
              ? cat.photoUris 
              : cat.photoUri 
                ? [cat.photoUri] 
                : [];
            
            setFormData({
              name: cat.name ?? '',
              location: cat.location ?? { address: 'Unknown location' },
              breed: cat.breed ?? '',
              age: cat.age ?? '',
              personality: Array.isArray(cat.personality) ? cat.personality : [],
              notes: cat.notes ?? '',
              photoUris: photoUris,
            });
          }
        } finally {
          setLoading(false);
        }
      })();
    } else {
      getCurrentLocation();
    }
  }, [catId]);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const locationData = await LocationService.getCurrentLocation();
      setFormData(prev => ({ ...prev, location: locationData }));
    } catch {
      setFormData(prev => ({ ...prev, location: { address: 'unable to get location' } }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleTakePhoto = () => {
    // push camera (add-cat stays mounted under it)
    router.push('/camera');
  };

  const handleDeletePhoto = (index: number) => {
    Alert.alert('delete photo', 'are you sure you want to delete this photo?', [
      { text: 'cancel', style: 'cancel' },
      {
        text: 'delete',
        style: 'destructive',
        onPress: () => {
          setFormData(prev => {
            const next = [...prev.photoUris]; // Create a new array
            next.splice(index, 1);
            return { ...prev, photoUris: next };
          });
        },
      },
    ]);
  };

  const handlePersonalityToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(p => p !== trait)
        : [...prev.personality, trait],
    }));
  };

  const canSave = formData.photoUris.length > 0 && !loading;

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('missing photo', 'please add at least one photo of the cat.');
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const existing = isEditing && catId ? await CatStorage.getCatById(catId) : null;

      const photos = formData.photoUris.slice(0, 3);
      const latest = photos[photos.length - 1];

      const cat: Cat = {
        id: catId || (uuid.v4() as string),
        name: formData.name.trim() || '???',
        // keep both fields for compatibility
        photoUri: latest,
        photoUris: photos,
        location: formData.location,
        breed: formData.breed.trim() || 'unknown',
        age: formData.age.trim() || 'unknown',
        personality: formData.personality,
        notes: formData.notes.trim(),
        dateAdded: existing?.dateAdded ?? now,
        lastUpdated: now,
      };

      await CatStorage.saveCat(cat);

      // Reset for next add
      if (!isEditing) {
        setFormData({ ...initialForm });
        await getCurrentLocation();
      }

      Alert.alert('success!', `${cat.name} has been ${isEditing ? 'updated' : 'added to'} your catalog!`, [
        { text: 'okie', onPress: () => (isEditing ? router.back() : router.push('/(tabs)/')) },
      ]);
    } catch (error) {
      console.error('error saving cat:', error);
      Alert.alert('error', 'failed to save cat. please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.text} />
          <Text style={styles.loadingText}>loading cat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canAddMore = formData.photoUris.length < 3;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.primary.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'edit cat!' : 'new cat!'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>photos ({formData.photoUris.length}/3)</Text>

          {/* Photo grid */}
          <View style={styles.grid}>
            {formData.photoUris.map((uri, idx) => (
              <View key={`${uri}-${idx}`} style={styles.tile}>
                <Image source={{ uri }} style={styles.tileImg} />
                <TouchableOpacity style={styles.deleteBadge} onPress={() => handleDeletePhoto(idx)}>
                  <XIcon size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}

            {canAddMore && (
              <TouchableOpacity style={[styles.tile, styles.addTile]} onPress={handleTakePhoto}>
                <Camera size={28} color={Colors.primary.text} />
                <Text style={styles.addTileText}>add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>what's their name?</Text>
          <TextInput
            style={styles.inputField}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="add name"
            placeholderTextColor={Colors.primary.textInactive}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>where did you find them?</Text>
          <TouchableOpacity style={styles.inputField} onPress={getCurrentLocation} disabled={locationLoading}>
            <MapPin size={16} color={Colors.primary.text} />
            <Text style={styles.inputFieldText}>
              {locationLoading ? 'getting location...' : formData.location.address}
            </Text>
            {locationLoading ? <ActivityIndicator size="small" color={Colors.primary.text} /> : <RefreshCw size={16} color={Colors.primary.text} />}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>what kind of cat?</Text>
          <Select value={formData.breed} options={BREEDS} placeholder="choose" onChange={(v) => setFormData(p => ({ ...p, breed: v }))} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>how old are they?</Text>
          <Select value={formData.age} options={AGES} placeholder="choose" onChange={(v) => setFormData(p => ({ ...p, age: v }))} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>personality</Text>
          <View style={styles.personalityContainer}>
            {PERSONALITY_OPTIONS.map((trait) => (
              <PersonalityChip
                key={trait}
                label={trait}
                selected={formData.personality.includes(trait)}
                onPress={handlePersonalityToggle}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>notes</Text>
          <TextInput
            style={[styles.inputField, styles.notesInput]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="add notes"
            placeholderTextColor={Colors.primary.textInactive}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.button.primaryText} />
          ) : (
            <Text style={styles.saveButtonText}>{isEditing ? 'update cat' : 'save to catalog'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const TILE_HEIGHT = 112;

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginTop: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },

  // Section labels
  sectionLabel: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginBottom: 12,
  },

  // Input fields (consistent styling)
  inputField: {
    backgroundColor: Colors.input.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.input.border,
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFieldText: {
    flex: 1,
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginLeft: 8,
    marginRight: 8,
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  // Photo grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: TILE_HEIGHT,
    height: TILE_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(56,48,41,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileImg: {
    width: '100%',
    height: '100%',
  },
  addTile: {
    backgroundColor: Colors.inputAlt.background,
    borderWidth: 2,
    borderColor: Colors.inputAlt.border,
    borderStyle: 'dashed',
  },
  addTileText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.text,
    marginTop: 4,
  },
  deleteBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.error.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Personality
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Save button
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.primary.background,
  },
  saveButton: {
    backgroundColor: Colors.button.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.button.disabled,
  },
  saveButtonText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.button.primaryText,
  },

  // Spacing
  bottomSpacer: {
    height: 100,
  },
}); 

can you add the background image to this page as well like you did for:
// Catalog screen with white frame card
import { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, FontSizes } from '@/constants';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Grid layout
const H_PADDING = 16;
const GUTTER = 16;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GUTTER) / 2;

// Frame geometry
const FRAME_W = 172;
const FRAME_H = 204;
const CUTOUT_W = 135;
const CUTOUT_H = 121;
const CUTOUT_TOP = 20;

// Text box geometry
const TEXT_W_RAW = 160;
const TEXT_H_RAW = 57;

// Scale to device width
const SCALE = CARD_WIDTH / FRAME_W;
const CARD_HEIGHT = FRAME_H * SCALE;
const PHOTO_W = CUTOUT_W * SCALE;
const PHOTO_H = CUTOUT_H * SCALE;
const PHOTO_TOP = CUTOUT_TOP * SCALE;
const TEXT_W = TEXT_W_RAW * SCALE;
const TEXT_H = TEXT_H_RAW * SCALE;

function formatDate(iso?: string) {
  if (!iso) return 'unknown date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'unknown date';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase();
}

export default function CatalogScreen() {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await CatStorage.getAllCats();
    all.sort((a, b) => {
      const ad = new Date(a.lastUpdated || a.dateAdded || 0).getTime();
      const bd = new Date(b.lastUpdated || b.dateAdded || 0).getTime();
      return bd - ad;
    });
    setCats(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>catalog</Text>
          <Text style={styles.subtitle}>...</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.loading}>loading kitties...</Text>
        </View>
      </View>
    );
  }

  if (cats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>catalog</Text>
          <Text style={styles.subtitle}>0 kitties found</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyHeading}>meow! no cats here...</Text>
          <Text style={styles.emptyBody}>tap + to add your first kitty</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>catalog</Text>
        <Text style={styles.subtitle}>
          {cats.length} {cats.length === 1 ? 'kitty' : 'kitties'} found
        </Text>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        data={cats}
        keyExtractor={(c) => c.id}
        numColumns={2}
        renderItem={({ item }) => {
          const latestPhoto =
            item.photoUris && item.photoUris.length > 0
              ? item.photoUris[item.photoUris.length - 1]
              : item.photoUri;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/cat/${item.id}`)}
              style={styles.cardTap}
            >
              <View style={styles.frameBox}>
                {/* Photo behind the white frame */}
                {latestPhoto ? (
                  <Image
                    source={{ uri: latestPhoto }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.photo, { backgroundColor: 'rgba(56,48,41,0.1)' }]} />
                )}

                {/* White frame overlay */}
                <Image
                  source={require('@/assets/images/frameWhite.png')}
                  style={styles.frameOverlay}
                  resizeMode="stretch"
                />

                {/* Bottom text box, centered inside */}
                <View style={styles.textBox}>
                  <Text style={styles.date}>{formatDate(item.lastUpdated || item.dateAdded)}</Text>
                  <Text style={styles.name}>{item.name || '???'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  header: {
    paddingHorizontal: H_PADDING,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  title: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
  },
  subtitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.textInactive,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.backgroundAlt,
  },
  loading: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },
  emptyBody: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyHeading: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },

  list: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 16,
    paddingTop: 8,
    rowGap: 16,
  },

  // Two column card
  cardTap: {
    width: CARD_WIDTH,
  },

  // Frame root
  frameBox: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },

  // Photo positioned to the cutout window
  photo: {
    position: 'absolute',
    width: PHOTO_W,
    height: PHOTO_H,
    top: PHOTO_TOP,
    left: (CARD_WIDTH - PHOTO_W) / 2,
    borderRadius: 6,
  },

  // Frame overlay
  frameOverlay: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    left: 0,
    top: 0,
  },

  // Text box 160x57 scaled, centered and pinned to bottom
  textBox: {
    position: 'absolute',
    width: TEXT_W,
    height: TEXT_H,
    left: (CARD_WIDTH - TEXT_W) / 2,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  date: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.text,
    opacity: 0.7,
    textTransform: 'lowercase',
  },
  name: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },
});

please don't make any text capitalized where it is lower case
  // Bottom text box: 160×57 scaled, centered, pinned to bottom
  textBox: {
    position: 'absolute',
    width: TEXT_W,
    height: TEXT_H,
    left: (CARD_WIDTH - TEXT_W) / 2,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  date: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.text,
    opacity: 0.7,
    textTransform: 'lowercase',
  },
  name: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },
});