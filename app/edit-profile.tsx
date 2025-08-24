import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, FontSizes } from '@/constants';
import { Profile } from '@/types/profile';
import { ProfileStorage } from '@/utils/profileStorage';

const PROFILE_COLORS = [
  '#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', 
  '#FFA07A', '#20B2AA', '#FF69B4', '#32CD32', '#FF6347'
];

const PROFILE_EMOJIS = ['😸', '😺', '😻', '😽', '🙀', '😿', '😾', '🐱', '🐈', '🐈‍⬛'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profiles = await ProfileStorage.getAllProfiles();
      const currentProfile = profiles.find(p => p.id === profileId);
      
      if (currentProfile) {
        setProfile(currentProfile);
        setDisplayName(currentProfile.displayName);
        setSelectedColor(currentProfile.profileColor);
        setSelectedEmoji(currentProfile.profileEmoji);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('error', 'failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !displayName.trim()) {
      Alert.alert('oops!', 'please enter a display name');
      return;
    }

    setSaving(true);
    try {
      await ProfileStorage.updateProfile(profile.id, {
        displayName: displayName.trim(),
        profileColor: selectedColor,
        profileEmoji: selectedEmoji,
      });
      
      Alert.alert('success!', 'profile updated successfully', [
        { text: 'ok', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('error', 'failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.patternContainer} pointerEvents="none">
          <Image source={require('@/assets/images/background.png')} style={styles.bgPattern} resizeMode="cover" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.text} />
          <Text style={styles.loadingText}>loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>profile not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.patternContainer} pointerEvents="none">
        <Image source={require('@/assets/images/background.png')} style={styles.bgPattern} resizeMode="cover" />
      </View>

      <View style={styles.contentLayer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.primary.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>edit profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Preview */}
          <View style={styles.previewContainer}>
            <View style={[styles.previewAvatar, { backgroundColor: selectedColor }]}>
              <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
            </View>
            <Text style={styles.previewName}>{displayName || 'display name'}</Text>
            <Text style={styles.previewUsername}>@{profile.username}</Text>
          </View>

          {/* Display Name */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>display name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="enter display name"
              placeholderTextColor={Colors.primary.textInactive}
            />
          </View>

          {/* Profile Color */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>profile color</Text>
            <View style={styles.colorGrid}>
              {PROFILE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          {/* Profile Emoji */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>profile emoji</Text>
            <View style={styles.emojiGrid}>
              {PROFILE_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiOption,
                    selectedEmoji === emoji && styles.selectedEmojiOption
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, (!displayName.trim() || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!displayName.trim() || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.button.primaryText} />
            ) : (
              <Text style={styles.saveButtonText}>save changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
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
    ...FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginBottom: 20,
  },

  // Preview
  previewContainer: {
    alignItems: 'center',
    backgroundColor: Colors.input.background,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.input.border,
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewEmoji: {
    fontSize: 36,
  },
  previewName: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    marginBottom: 4,
  },
  previewUsername: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.textInactive,
  },

  // Form
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.input.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.input.border,
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },

  // Color Grid
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: Colors.primary.text,
  },

  // Emoji Grid
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.input.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmojiOption: {
    borderColor: Colors.primary.text,
    backgroundColor: Colors.inputAlt.background,
  },
  emojiText: {
    fontSize: 24,
  },

  // Save Button
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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

  bottomSpacer: {
    height: 20,
  },
});