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

  useFocusEffect(
    useCallback(() => {
      const newOnes = PhotoInbox.consumeAll();
      if (newOnes.length) {
        setFormData(prev => {
          const combined = [...prev.photoUris, ...newOnes];
          const capped = combined.slice(0, 3);
          return { ...prev, photoUris: capped };
        });
      }
    }, [])
  );

  useEffect(() => {
    if (isEditing && catId) {
      (async () => {
        setLoading(true);
        try {
          const cat = await CatStorage.getCatById(catId);
          if (cat) {
            const photoUris = cat.photoUris && cat.photoUris.length > 0
              ? cat.photoUris
              : cat.photoUri
                ? [cat.photoUri]
                : [];
            setFormData({
              name: cat.name ?? '',
              location: cat.location ?? { address: 'unknown location' },
              breed: cat.breed ?? '',
              age: cat.age ?? '',
              personality: Array.isArray(cat.personality) ? cat.personality : [],
              notes: cat.notes ?? '',
              photoUris,
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
            const next = [...prev.photoUris];
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
        {/* background image layer */}
        <View style={styles.patternContainer} pointerEvents="none">
          <Image source={require('@/assets/images/background.png')} style={styles.bgPattern} resizeMode="cover" />
        </View>

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
      {/* background image layer */}
      <View style={styles.patternContainer} pointerEvents="none">
        <Image source={require('@/assets/images/background.png')} style={styles.bgPattern} resizeMode="cover" />
      </View>

      {/* foreground content */}
      <View style={styles.contentLayer}>
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
              {locationLoading ? (
                <ActivityIndicator size="small" color={Colors.primary.text} />
              ) : (
                <RefreshCw size={16} color={Colors.primary.text} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>what kind of cat?</Text>
            <Select
              value={formData.breed}
              options={BREEDS}
              placeholder="choose"
              onChange={(v) => setFormData(p => ({ ...p, breed: v }))}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>how old are they?</Text>
            <Select
              value={formData.age}
              options={AGES}
              placeholder="choose"
              onChange={(v) => setFormData(p => ({ ...p, age: v }))}
            />
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
      </View>
    </SafeAreaView>
  );
}

const TILE_HEIGHT = 112;

const styles = StyleSheet.create({
  // base
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },

  // background image layer
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },

  // foreground wrapper
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },

  // loading
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

  // header
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

  // section labels
  sectionLabel: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginBottom: 12,
  },

  // inputs
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

  // photo grid
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

  // personality
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // save button
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '',
  },
  saveButton: {
    backgroundColor: '',
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

  // spacing
  bottomSpacer: {
    height: 100,
  },
});
