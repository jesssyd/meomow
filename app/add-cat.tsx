// app/add-cat.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,      
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, MapPin, RefreshCw } from 'lucide-react-native';
import uuid from 'react-native-uuid';

import { Colors, FontSizes } from '@/constants';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';
import { LocationService } from '@/utils/location';
import { PersonalityChip } from '@/components/PersonalityChip';
import Select from '@/components/Select';

const PERSONALITY_OPTIONS = [
  'shy', 'silly', 'sweet', 'moody', 'loud', 'friendly',
  'playful', 'sleepy', 'energetic',
];

const BREEDS = ['tabby', 'calico', 'siamese', 'persian', 'maine coon', 'bengal', 'ragdoll', 'sphynx', 'british shorthair', 'other']; ;
const AGES = ['kitten (0-1 year)', 'young (1-3 years)', 'adult (3-7 years)', 'senior (7+ years)']

const initialForm = {
  name: '',
  location: { address: 'Getting location...', coordinates: undefined as undefined | { latitude: number; longitude: number } },
  breed: '',
  age: '',
  personality: [] as string[],
  notes: '',
  photoUri: '',
};

export default function AddCatScreen() {
  const router = useRouter();
  const { photoUri, catId } = useLocalSearchParams<{ photoUri?: string; catId?: string }>();

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    ...initialForm,
    photoUri: photoUri || '',
  });

  const isEditing = !!catId;

  useEffect(() => {
    if (isEditing && catId) {
      loadExistingCat();
    } else {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catId]);

  const loadExistingCat = async () => {
    if (!catId) return;

    setLoading(true);
    try {
      const cat = await CatStorage.getCatById(catId);
      if (cat) {
        setFormData({
          name: cat.name ?? '',
          location: cat.location ?? { address: 'Unknown location' },
          breed: cat.breed ?? '',
          age: cat.age ?? '',
          personality: Array.isArray(cat.personality) ? cat.personality : [],
          notes: cat.notes ?? '',
          photoUri: cat.photoUri,
        });
      }
    } catch (error) {
      console.error('Error loading cat:', error);
      Alert.alert('Error', 'Failed to load cat data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const locationData = await LocationService.getCurrentLocation();
      setFormData((prev) => ({
        ...prev,
        location: locationData,
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      setFormData((prev) => ({
        ...prev,
        location: { address: 'Unable to get location' },
      }));
    } finally {
      setLocationLoading(false);
    }
  };

  const resetForm = async () => {
    setFormData({ ...initialForm });
    await getCurrentLocation();
  };

  const handleTakePhoto = () => {
    router.push('/camera');
  };

  const handlePersonalityToggle = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter((p) => p !== trait)
        : [...prev.personality, trait],
    }));
  };

  const canSave = formData.photoUri.trim() !== '' && !loading;

  const handleSave = async () => {
    if (!formData.photoUri.trim()) {
      Alert.alert('Missing photo', 'Please add at least one photo of the cat.');
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const existing = isEditing && catId ? await CatStorage.getCatById(catId) : null;

      const cat: Cat = {
        id: catId || (uuid.v4() as string),
        name: formData.name.trim() || '???',
        photoUri: formData.photoUri,
        location:
          formData.location?.address?.toLowerCase().includes('getting location')
            ? { address: 'unknown location' }
            : formData.location,
        breed: formData.breed.trim() || 'Unknown',
        age: formData.age.trim() || 'Unknown',
        personality: formData.personality,
        notes: formData.notes.trim(),
        dateAdded: existing?.dateAdded ?? now,
        lastUpdated: now,
      };

      await CatStorage.saveCat(cat);
      await resetForm();

      Alert.alert('Success!', `${cat.name} has been ${isEditing ? 'updated' : 'added to'} your catalog!`, [
        {
          text: 'OK',
          onPress: () => {
            if (isEditing) {
              router.back();
            } else {
              router.push('/(tabs)/');
            }
          },
        },
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
          <Text style={styles.sectionLabel}>photos/videos</Text>
          <View style={styles.photoSection}>
            {formData.photoUri ? (
              <TouchableOpacity style={styles.photoContainer} onPress={handleTakePhoto}>
                <Image source={{ uri: formData.photoUri }} style={styles.photo} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                <Camera size={32} color={Colors.primary.text} />
                <Text style={styles.photoButtonText}>take photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
  <Text style={styles.sectionLabel}>what's their name?</Text>
  <TextInput
    style={styles.textInput}
    value={formData.name}
    onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
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
          <Select
            value={formData.breed}
            options={BREEDS}
            placeholder="choose"
            onChange={(v) => setFormData((p) => ({ ...p, breed: v }))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>how old are they?</Text>
          <Select
            value={formData.age}
            options={AGES}
            placeholder="choose"
            onChange={(v) => setFormData((p) => ({ ...p, age: v }))}
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
          <View style={[styles.textLikeBox, styles.notesInput]}>
            <Text
              style={{
                fontFamily: 'Jua-Regular',
                fontSize: FontSizes.body,
                color: Colors.primary.text,
                opacity: formData.notes ? 1 : 0.6,
              }}
              onPress={() => {}}
            >
              {formData.notes || 'add notes'}
            </Text>
          </View>
          {/* If you want a real multiline TextInput, you can restore it here */}
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
  photoSection: { alignItems: 'center' },
  photoContainer: { width: 160, height: 160, borderRadius: 8, overflow: 'hidden' },
  photo: { width: '100%', height: '100%', backgroundColor: 'rgba(56, 48, 41, 0.1)' },
  photoButton: {
    width: 160, height: 160, backgroundColor: 'rgba(56, 48, 41, 0.05)',
    borderRadius: 8, borderWidth: 2, borderColor: 'rgba(56, 48, 41, 0.2)', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  photoButtonText: { fontFamily: 'Jua-Regular', fontSize: 14, color: Colors.primary.text, marginTop: 8 },
  textLikeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  locationText: {
    flex: 1, fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text,
    marginLeft: 8, marginRight: 8,
  },
  personalityContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bottomSpacer: { height: 100 },
  saveButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: Colors.primary.background },
  saveButton: { backgroundColor: Colors.button.primary, paddingVertical: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minHeight: 56 },
  saveButtonDisabled: { backgroundColor: 'rgba(59, 64, 89, 0.5)' },
  saveButtonText: { fontFamily: 'Jua-Regular', fontSize: FontSizes.heading, color: Colors.button.primaryText },
});
