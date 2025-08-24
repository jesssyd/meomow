// app/profile-setup.tsx
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes } from '@/constants';
import { ProfileStorage } from '@/utils/profileStorage';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('permission needed', 'please enable photo library access to upload an image.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
      selectionLimit: 1,
    });

    if (!res.canceled && res.assets?.length) {
      setProfileImageUri(res.assets[0].uri);
    }
  };

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('oops!', 'please enter a username');
      return;
    }

    setLoading(true);
    try {
      await ProfileStorage.createProfile(username, displayName || username, profileImageUri);
      router.replace('/(tabs)/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'failed to create profile';
      Alert.alert('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* background image layer */}
      <View style={styles.patternContainer} pointerEvents="none">
        <Image source={require('@/assets/images/background.png')} style={styles.bgPattern} resizeMode="cover" />
      </View>

      <View style={styles.contentLayer}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/meomow-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>meomow</Text>
            <Text style={styles.subtitle}>create your cat catalog profile</Text>
          </View>

          {/* avatar pick and preview */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarEmpty}>
                  <Text style={styles.avatarEmptyText}>no photo</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              <Text style={styles.uploadBtnText}>{profileImageUri ? 'change photo' : 'upload photo'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputSection}>
              <Text style={styles.label}>choose a username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="meomow"
                placeholderTextColor={Colors.primary.textInactive}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>display name (optional)</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="expert cat finder"
                placeholderTextColor={Colors.primary.textInactive}
              />
            </View>

            <TouchableOpacity
              style={[styles.createButton, (!username.trim() || loading) && styles.createButtonDisabled]}
              onPress={handleCreateProfile}
              disabled={!username.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.button.primaryText} />
              ) : (
                <Text style={styles.createButtonText}>start cataloging cats!</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 112;

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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Jua-Regular',
    fontSize: 36,
    color: Colors.primary.splash,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.textInactive,
    textAlign: 'center',
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: Colors.inputAlt.background,
    borderWidth: 1,
    borderColor: Colors.input.border,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmptyText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.textInactive,
  },
  uploadBtn: {
    marginTop: 12,
    backgroundColor: Colors.button.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadBtnText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.button.primaryText,
  },

  form: {
    gap: 24,
  },
  inputSection: {
    gap: 8,
  },
  label: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
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
  createButton: {
    backgroundColor: Colors.button.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: Colors.button.disabled,
  },
  createButtonText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.button.primaryText,
  },
});
