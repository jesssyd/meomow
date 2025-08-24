import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2 } from 'lucide-react-native';
import { Colors, FontSizes } from '@/constants';
import { Profile } from '@/types/profile';
import { ProfileStorage } from '@/utils/profileStorage';

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }).toLowerCase();
}

export default function ProfileSelectionScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const allProfiles = await ProfileStorage.getAllProfiles();
      setProfiles(allProfiles);
    } catch (error) {
      console.error('error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profile: Profile) => {
    try {
      await ProfileStorage.setCurrentProfile(profile.id);
      router.replace('/(tabs)/');
    } catch (error) {
      Alert.alert('error', 'failed to select profile');
    }
  };

  const handleCreateNew = () => {
    router.push('/profile-setup');
  };

  const handleDeleteProfile = (profile: Profile) => {
    Alert.alert(
      'delete profile',
      `are you sure you want to delete ${profile.displayName}'s profile? this will also delete all their cat data.`,
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProfileStorage.deleteProfile(profile.id);
              await loadProfiles();
            } catch (error) {
              Alert.alert('error', 'failed to delete profile');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.patternContainer} pointerEvents="none">
          <Image source={require('@/assets/images/background.png')} style={styles.bgPattern} resizeMode="cover" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.text} />
          <Text style={styles.loadingText}>loading profiles...</Text>
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
          <Image 
            source={require('@/assets/images/meomow-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>choose your profile</Text>
          <Text style={styles.subtitle}>select a profile to continue cataloging cats</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {profiles.map((profile) => (
            <TouchableOpacity
              key={profile.id}
              style={styles.profileCard}
              onPress={() => handleSelectProfile(profile)}
              activeOpacity={0.8}
            >
              <View style={styles.profileInfo}>
                <View style={[styles.avatar, { backgroundColor: profile.profileColor }]}>
                  <Text style={styles.emoji}>{profile.profileEmoji}</Text>
                </View>
                <View style={styles.profileText}>
                  <Text style={styles.profileName}>{profile.displayName}</Text>
                  <Text style={styles.profileUsername}>@{profile.username}</Text>
                  <Text style={styles.profileStats}>
                    {profile.totalCatsFound} cats • last active {formatDate(profile.lastActive)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteProfile(profile)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={18} color={Colors.error.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Create New Profile Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
            <Plus size={24} color={Colors.primary.text} />
            <Text style={styles.createButtonText}>create new profile</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Jua-Regular',
    fontSize: 28,
    color: Colors.primary.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.textInactive,
    textAlign: 'center',
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

  // Profile Cards
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.input.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.input.border,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 24,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginBottom: 2,
  },
  profileUsername: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.textInactive,
    marginBottom: 4,
  },
  profileStats: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.textInactive,
  },
  deleteButton: {
    padding: 8,
  },

  // Create Button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inputAlt.background,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: Colors.inputAlt.border,
    borderStyle: 'dashed',
  },
  createButtonText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginLeft: 8,
  },

  bottomSpacer: {
    height: 40,
  },
});