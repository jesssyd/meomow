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
import { LogOut, Edit3, Calendar, Heart, TrendingUp, Users } from 'lucide-react-native';
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

      // Calculate stats
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
        discoveryStreak: cats.length, // simplified for now
        averageCatsPerMonth: Math.round((cats.length / monthsDiff) * 10) / 10,
      };

      setStats(profileStats);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(loadProfileData);

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

  if (!profile || !stats) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.patternContainer} pointerEvents="none">
        <Image source={require('@/assets/images/background.png')} style={styles.bgPattern} resizeMode="cover" />
      </View>

      <View style={styles.contentLayer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>profile</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleEditProfile}>
            <Edit3 size={20} color={Colors.primary.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={[styles.profileAvatar, { backgroundColor: profile.profileColor }]}>
              <Text style={styles.profileEmoji}>{profile.profileEmoji}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
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

  // Profile Card
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.input.background,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.input.border,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileEmoji: {
    fontSize: 36,
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