import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'react-native-uuid';

import { Colors, FontSizes } from '@/constants/Colors';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';
import { LocationService } from '@/utils/location';
import { PersonalityChip } from '@/components/PersonalityChip';

const PERSONALITY_OPTIONS = [
  'shy', 'silly', 'sweet', 'moody', 'loud', 
  'friendly', 'playful', 'sleepy', 'energetic'
];

export default function AddCatScreen() {
  const router = useRouter();
  const { photoUri, catId } = useLocalSearchParams<{ photoUri?: string; catId?: string }>();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(photoUri || null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Getting location...');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [selectedPersonalities, setSelectedPersonalities] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (catId) {
      setIsEditing(true);
      loadCatData();
    } else {
      getCurrentLocation();
    }
  }, [catId]);

  const loadCatData = async () => {
    if (!catId) return;
    
    const cat = await CatStorage.getCatById(catId);
    if (cat) {
      setName(cat.name);
      setSelectedPhoto(cat.photoUri);
      setLocation(cat.location.address);
      setBreed(cat.breed);
      setAge(cat.age);
      setSelectedPersonalities(cat.personality);
      setNotes(cat.notes || '');
    }
  };

  const getCurrentLocation = async () => {
    const locationData = await LocationService.getCurrentLocation();
    if (locationData) {
      setLocation(locationData.address);
    } else {
      setLocation('Location unavailable');
    }
  };

  const handleTakePhoto = () => {
    router.push('/camera');
  };

  const handleChoosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedPhoto(result.assets[0].uri);
    }
  };

  const handlePersonalityToggle = (personality: string) => {
    setSelectedPersonalities(prev => 
      prev.includes(personality)
        ? prev.filter(p => p !== personality)
        : [...prev, personality]
    );
  };

  const handleSave = async () => {
    if (!selectedPhoto) {
      Alert.alert('Photo Required', 'Please take or choose a photo of the cat.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter the cat\'s name.');
      return;
    }

    setLoading(true);

    try {
      const now = new Date().toISOString();
      const cat: Cat = {
        id: catId || uuidv4(),
        name: name.trim(),
        photoUri: selectedPhoto,
        location: {
          address: location,
        },
        breed: breed.trim() || 'Unknown',
        age: age.trim() || 'Unknown',
        personality: selectedPersonalities,
        notes: notes.trim(),
        dateAdded: catId ? (await CatStorage.getCatById(catId))?.dateAdded || now : now,
        lastUpdated: now,
      };

      const success = await CatStorage.saveCat(cat);
      
      if (success) {
        Alert.alert(
          isEditing ? 'Cat Updated' : 'Cat Saved',
          isEditing 
            ? `${name} has been updated in your catalog!`
            : `${name} has been added to your catalog!`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (isEditing) {
                  router.back();
                } else {
                  router.push('/(tabs)/');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save cat. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSave = selectedPhoto && name.trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.primary.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'edit cat!' : 'new cat!'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>photos/videos</Text>
          <View style={styles.photoSection}>
            {selectedPhoto ? (
              <TouchableOpacity onPress={handleTakePhoto} activeOpacity={0.8}>
                <Image source={{ uri: selectedPhoto }} style={styles.photoPreview} />
              </TouchableOpacity>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity 
                  style={styles.photoButton} 
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <Camera size={24} color={Colors.primary.text} />
                  <Text style={styles.photoButtonText}>take photo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.photoButton} 
                  onPress={handleChoosePhoto}
                  activeOpacity={0.8}
                >
                  <Plus size={24} color={Colors.primary.text} />
                  <Text style={styles.photoButtonText}>choose photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>what's their name?</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="add name"
            placeholderTextColor="rgba(56, 48, 41, 0.5)"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>where did you find them?</Text>
          <TouchableOpacity style={styles.locationInput}>
            <Text style={styles.locationText}>{location}</Text>
          </TouchableOpacity>
          <Text style={styles.locationHelp}>choose on the map</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>what kind of cat?</Text>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
            placeholder="choose"
            placeholderTextColor="rgba(56, 48, 41, 0.5)"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>how old are they?</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="choose"
            placeholderTextColor="rgba(56, 48, 41, 0.5)"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>personality</Text>
          <View style={styles.personalityContainer}>
            {PERSONALITY_OPTIONS.map((personality) => (
              <PersonalityChip
                key={personality}
                label={personality}
                selected={selectedPersonalities.includes(personality)}
                onPress={handlePersonalityToggle}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="add notes"
            placeholderTextColor="rgba(56, 48, 41, 0.5)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.button.primaryText} />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'update in catalog' : 'save to catalog'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
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
    fontSize: FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'Jua-Regular',
    fontSize: 16,
    color: Colors.primary.text,
    marginBottom: 12,
  },
  sectionHeading: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.heading,
    color: Colors.primary.text,
    marginBottom: 12,
  },
  photoSection: {
    alignItems: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    width: 120,
    height: 120,
    backgroundColor: Colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoButtonText: {
    fontFamily: 'Jua-Regular',
    fontSize: 14,
    color: Colors.primary.text,
    marginTop: 8,
  },
  photoPreview: {
    width: 160,
    height: 160,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 48, 41, 0.1)',
  },
  inputLabel: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    minHeight: 48,
  },
  locationInput: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  locationText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
  },
  locationHelp: {
    fontFamily: 'Jua-Regular',
    fontSize: 14,
    color: 'rgba(56, 48, 41, 0.6)',
    marginTop: 4,
  },
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  saveButton: {
    backgroundColor: Colors.button.primary,
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.heading,
    color: Colors.button.primaryText,
  },
});