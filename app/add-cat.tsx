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

import { Colors, FontSizes } from '@/constants';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';
import { LocationService } from '@/utils/location';
import { PersonalityChip } from '@/components/PersonalityChip';
import Select from '@/components/Select';
import { PhotoInbox } from '@/utils/photoInbox';

const PERSONALITY_OPTIONS = [
  'shy','silly','sweet','moody','loud','friendly','playful','sleepy','energetic'
];

const BREEDS = ['tabby','calico','siamese','persian','maine coon','bengal','ragdoll','sphynx','british shorthair','other'];
const AGES = ['kitten (0-1 year)','young (1-3 years)','adult (3-7 years)','senior (7+ years)'];

const initialForm = {
  name: '',
  location: { address: 'Getting location...', coordinates: undefined as undefined | { latitude: number; longitude: number } },
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

  // DEBUG: Add console logs to track photo state changes
  useEffect(() => {
    console.log('🔍 DEBUG: formData.photoUris changed:', formData.photoUris);
    console.log('🔍 DEBUG: formData.photoUris.length:', formData.photoUris.length);
  }, [formData.photoUris]);

  // Pick up any newly confirmed photos when you return from the camera/preview
  useFocusEffect(
    useCallback(() => {
      console.log('🎯 DEBUG: useFocusEffect triggered');
      const newOnes = PhotoInbox.consumeAll();
      console.log('🎯 DEBUG: PhotoInbox.consumeAll() returned:', newOnes);
      console.log('🎯 DEBUG: newOnes.length:', newOnes.length);
      
      if (newOnes.length) {
        console.log('🎯 DEBUG: Before adding new photos, current photoUris:', formData.photoUris);
        
        setFormData(prev => {
          const combined = [...prev.photoUris, ...newOnes];
          const capped = combined.slice(0, 3); // cap at 3
          
          console.log('🎯 DEBUG: prev.photoUris:', prev.photoUris);
          console.log('🎯 DEBUG: combined photos:', combined);
          console.log('🎯 DEBUG: capped photos:', capped);
          
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
          console.log('🔍 DEBUG: Loaded cat for editing:', cat);
          console.log('🔍 DEBUG: cat.photoUris:', cat?.photoUris);
          console.log('🔍 DEBUG: cat.photoUri:', cat?.photoUri);
          
          if (cat) {
            // Ensure we're using the photoUris array properly
            const photoUris = cat.photoUris && cat.photoUris.length > 0 
              ? cat.photoUris 
              : cat.photoUri 
                ? [cat.photoUri] 
                : [];
                
            console.log('🔍 DEBUG: Final photoUris for form:', photoUris);
            
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
      setFormData(prev => ({ ...prev, location: { address: 'Unable to get location' } }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleTakePhoto = () => {
    console.log('📸 DEBUG: handleTakePhoto called, current photoUris:', formData.photoUris);
    // push camera (add-cat stays mounted under it)
    router.push('/camera');
  };

  const handleDeletePhoto = (index: number) => {
    console.log('🗑️ DEBUG: handleDeletePhoto called for index:', index);
    console.log('🗑️ DEBUG: Current photoUris:', formData.photoUris);
    
    Alert.alert('Delete photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setFormData(prev => {
            const next = [...prev.photoUris]; // Create a new array
            next.splice(index, 1);
            console.log('🗑️ DEBUG: After deletion, photoUris:', next);
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
      Alert.alert('Missing photo', 'Please add at least one photo of the cat.');
      return;
    }

    console.log('💾 DEBUG: handleSave called');
    console.log('💾 DEBUG: formData.photoUris:', formData.photoUris);
    
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const existing = isEditing && catId ? await CatStorage.getCatById(catId) : null;

      const photos = formData.photoUris.slice(0, 3);
      const latest = photos[photos.length - 1];

      console.log('💾 DEBUG: photos to save:', photos);
      console.log('💾 DEBUG: latest photo:', latest);

      const cat: Cat = {
        id: catId || (uuid.v4() as string),
        name: formData.name.trim() || '???',
        // keep both fields for compatibility
        photoUri: latest,
        photoUris: photos,
        location: formData.location,
        breed: formData.breed.trim() || 'Unknown',
        age: formData.age.trim() || 'Unknown',
        personality: formData.personality,
        notes: formData.notes.trim(),
        dateAdded: existing?.dateAdded ?? now,
        lastUpdated: now,
      };

      console.log('💾 DEBUG: Final cat object:', cat);
      console.log('💾 DEBUG: cat.photoUris:', cat.photoUris);

      const savedCat = await CatStorage.saveCat(cat);
      console.log('💾 DEBUG: Saved cat returned:', savedCat);

      // Reset for next add
      if (!isEditing) {
        setFormData({ ...initialForm });
        await getCurrentLocation();
      }

      Alert.alert('Success!', `${cat.name} has been ${isEditing ? 'updated' : 'added to'} your catalog!`, [
        { text: 'OK', onPress: () => (isEditing ? router.back() : router.push('/(tabs)/')) },
      ]);
    } catch (error) {
      console.error('Error saving cat:', error);
      Alert.alert('Error', 'Failed to save cat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.text} />
          <Text style={styles.loadingText}>Loading cat data...</Text>
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
        {/* DEBUG INFO SECTION - Remove this after debugging */}
        <View style={[styles.section, { backgroundColor: 'rgba(255,0,0,0.1)', padding: 10, marginBottom: 10 }]}>
          <Text style={[styles.sectionLabel, { color: 'red' }]}>DEBUG INFO (Remove after fixing)</Text>
          <Text style={{ fontSize: 12, color: 'red' }}>
            PhotoUris count: {formData.photoUris.length}
          </Text>
          <Text style={{ fontSize: 12, color: 'red' }}>
            PhotoUris: {JSON.stringify(formData.photoUris, null, 2)}
          </Text>
          <Text style={{ fontSize: 12, color: 'red' }}>
            Can add more: {canAddMore ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>photos/videos ({formData.photoUris.length}/3)</Text>

          {/* Photo grid */}
          <View style={styles.grid}>
            {formData.photoUris.map((uri, idx) => (
              <View key={`${uri}-${idx}`} style={styles.tile}>
                <Image source={{ uri }} style={styles.tileImg} />
                <TouchableOpacity style={styles.deleteBadge} onPress={() => handleDeletePhoto(idx)}>
                  <XIcon size={16} color="#fff" />
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
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="add name"
            placeholderTextColor="rgba(56, 48, 41, 0.5)"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>where did you find them?</Text>
          <TouchableOpacity style={styles.locationContainer} onPress={getCurrentLocation} disabled={locationLoading}>
            <MapPin size={16} color={Colors.primary.text} />
            <Text style={styles.locationText}>
              {locationLoading ? 'Getting location...' : formData.location.address}
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
            style={[styles.textInput, styles.notesInput]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="add notes"
            placeholderTextColor="rgba(56, 48, 41, 0.5)"
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

const TILE = 100;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text, marginTop: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontFamily: 'Jua-Regular', fontSize: FontSizes.heading, color: Colors.primary.text, textAlign: 'center' },
  headerSpacer: { width: 44 },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginBottom: 20 },
  sectionLabel: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text, marginBottom: 12 },

  // photo grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: TILE, height: TILE, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(56,48,41,0.07)', justifyContent: 'center', alignItems: 'center' },
  tileImg: { width: '100%', height: '100%' },
  addTile: { borderWidth: 2, borderColor: 'rgba(56, 48, 41, 0.2)', borderStyle: 'dashed' },
  addTileText: { fontFamily: 'Jua-Regular', fontSize: 12, color: Colors.primary.text, marginTop: 4 },
  deleteBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(255,59,48,0.9)', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  textInput: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    borderWidth: 1,
    borderColor: 'rgba(56, 48, 41, 0.1)',
  },
  notesInput: { height: 100, paddingTop: 12 },

  locationContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(56, 48, 41, 0.1)',
  },
  locationText: { flex: 1, fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text, marginLeft: 8, marginRight: 8 },

  personalityContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bottomSpacer: { height: 100 },
  saveButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: Colors.primary.background },
  saveButton: { backgroundColor: Colors.button.primary, paddingVertical: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minHeight: 56 },
  saveButtonDisabled: { backgroundColor: 'rgba(59, 64, 89, 0.5)' },
  saveButtonText: { fontFamily: 'Jua-Regular', fontSize: FontSizes.heading, color: Colors.button.primaryText },
});