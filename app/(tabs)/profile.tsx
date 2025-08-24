// app/profile.tsx
import { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Menu as Edit3, Calendar, Heart, TrendingUp, Users } from 'lucide-react-native';
import { Colors, FontSizes } from '@/constants';
import { Profile, ProfileStats } from '@/types/profile';
import { ProfileStorage } from '@/utils/profileStorage';
import { CatStorage } from '@/utils/storage';

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).toLowerCase();
}

function getTopPersonalityTraits(cats: any[]): string[] {
  const traitCounts: Record<string, number> = {};
  
  cats.forEach(cat => {
    if (Array.isArray(cat.personality)) {
      cat.personality.forEach(trait => {
        traitCounts[trait] = (traitCounts[trait] || 0) + 1;
      });
    }
  });

  return Object.entries(traitCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([trait]) => trait);
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const currentProfile = await ProfileStorage.getCurrentProfile();
      
      if (!currentProfile) {
        router.replace('/profile-setup');
        return;
      }

      setProfile(currentProfile);

      const cats = await CatStorage.getAllCats(currentProfile.id);
      const topTraits = getTopPersonalityTraits(cats);
      
      const now = new Date();
      const createdDate = new Date(currentProfile.dateCreated);
      const monthsDiff = Math.max(1, (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      const profileStats: ProfileStats = {
        totalCats: cats.length,
        mostRecentDiscovery: cats.length > 0 
          ? cats.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())[0]?.dateAdded
          : undefined,
        favoritePersonalityTraits: topTraits,
        discoveryStreak: cats.length,
        averageCatsPerMonth: Math.round((cats.length / monthsDiff) * 10) / 10,
      };

      setStats(profileStats);
    } catch (error) {
      console.error('error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
  useCallback(() => {
    loadProfileData();
  }, [loadProfileData])
);

  const handleSwitchProfile = () => {
    Alert.alert(
      'switch profile',
      'this will take you back to profile selection',
      [
        { text: 'cancel', style: 'cancel' },
        { 
          text: 'switch', 
          onPress: () => router.replace('/profile-selection')
        }
      ]
    );
  };

  const handleEditProfile = () => {
    if (profile) {
      router.push({
        pathname: '/edit-profile',
        params: { profileId: profile.id }
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.patternContainer} pointerEvents="none" />
        <View style={styles.headerAligned}>
          <Text style={styles.headerTitle}>profile</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.text} />
          <Text style={styles.loadingText}>loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile || !stats) {
    return null;
  }

  // optional new field for image-based avatar
  const profileImageUri = (profile as any).profileImageUri as string | undefined;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.patternContainer} pointerEvents="none" />

      {/* header aligned to index.tsx height and padding */}
      <View style={styles.headerAligned}>
        <Text style={styles.headerTitle}>profile</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleEditProfile}>
          <Edit3 size={20} color={Colors.primary.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentLayer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.profileAvatarImg} />
              ) : (
                <>
                  <View style={[styles.profileAvatarFallback]} />
                  <Text style={styles.profileAvatarFallbackText}>no photo</Text>
                </>
              )}
            </View>
            <Text style={styles.displayName}>{profile.displayName}</Text>
            <Text style={styles.username}>@{profile.username}</Text>
            <Text style={styles.memberSince}>
              member since {formatDate(profile.dateCreated)}
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>discovery stats</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Heart size={24} color={Colors.primary.text} />
                <Text style={styles.statNumber}>{stats.totalCats}</Text>
                <Text style={styles.statLabel}>cats found</Text>
              </View>

              <View style={styles.statCard}>
                <TrendingUp size={24} color={Colors.primary.text} />
                <Text style={styles.statNumber}>{stats.averageCatsPerMonth}</Text>
                <Text style={styles.statLabel}>per month</Text>
              </View>

              <View style={styles.statCard}>
                <Calendar size={24} color={Colors.primary.text} />
                <Text style={styles.statNumber}>{stats.discoveryStreak}</Text>
                <Text style={styles.statLabel}>streak</Text>
              </View>
            </View>
          </View>

          {/* Favorite Traits */}
          {stats.favoritePersonalityTraits.length > 0 && (
            <View style={styles.traitsContainer}>
              <Text style={styles.sectionTitle}>favorite cat personalities</Text>
              <View style={styles.traitsGrid}>
                {stats.favoritePersonalityTraits.map((trait, index) => (
                  <View key={trait} style={styles.traitChip}>
                    <Text style={styles.traitText}>#{index + 1} {trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Most Recent Discovery */}
          {stats.mostRecentDiscovery && (
            <View style={styles.recentContainer}>
              <Text style={styles.sectionTitle}>most recent discovery</Text>
              <Text style={styles.recentDate}>
                {formatDate(stats.mostRecentDiscovery)}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSwitchProfile}>
              <Users size={20} color={Colors.primary.text} />
              <Text style={styles.actionText}>switch profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 88;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
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

  // header aligned with index.tsx: same paddings and background
  headerAligned: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.primary.backgroundAlt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginTop: 16,
  },

  // Profile Card
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.input.background,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.input.border,
  },
  profileAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: Colors.inputAlt.background,
    borderWidth: 1,
    borderColor: Colors.input.border,
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
  },
  profileAvatarFallback: {
    ...StyleSheet.absoluteFillObject,
  },
  profileAvatarFallbackText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.textInactive,
  },
  displayName: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    marginBottom: 4,
  },
  username: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.textInactive,
    marginBottom: 8,
  },
  memberSince: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.textInactive,
  },

  // Stats
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.input.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.input.border,
  },
  statNumber: {
    fontFamily: 'Jua-Regular',
    fontSize: 24,
    color: Colors.primary.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.textInactive,
    textAlign: 'center',
  },

  // Traits
  traitsContainer: {
    marginBottom: 24,
  },
  traitsGrid: {
    gap: 8,
  },
  traitChip: {
    backgroundColor: Colors.personality.selected.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.personality.selected.border,
    alignSelf: 'flex-start',
  },
  traitText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.personality.selected.text,
  },

  // Recent
  recentContainer: {
    marginBottom: 24,
  },
  recentDate: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },

  // Actions
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.input.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.input.border,
  },
  actionText: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    marginLeft: 12,
  },

  bottomSpacer: {
    height: 40,
  },
});