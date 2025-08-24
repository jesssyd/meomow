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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes } from '@/constants';
import { ProfileStorage } from '@/utils/profileStorage';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('oops!', 'please enter a username');
      return;
    }

    setLoading(true);
    try {
      await ProfileStorage.createProfile(username, displayName || username);
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

          <View style={styles.form}>
            <View style={styles.inputSection}>
              <Text style={styles.label}>choose a username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="catfinder123"
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
                placeholder="cat enthusiast"
                placeholderTextColor={Colors.primary.textInactive}
              />
            </View>

            <TouchableOpacity
              style={[styles.createButton, !username.trim() && styles.createButtonDisabled]}
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
    marginBottom: 60,
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