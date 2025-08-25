// index.tsx

import { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { Colors, FontSizes } from '@/constants';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';
import { ProfileStorage } from '@/utils/profileStorage';
import { Profile } from '@/types/profile';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Grid layout
const H_PADDING = 16;
const GUTTER = 16;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GUTTER) / 2;
const FRAME_W = 172;
const FRAME_H = 204;
const CUTOUT_W = 135;
const CUTOUT_H = 121;
const CUTOUT_TOP = 20;

// Scale all inner measurements to our card width
const SCALE = CARD_WIDTH / FRAME_W;
const CARD_HEIGHT = FRAME_H * SCALE;

// Scaled cutout rect and text box
const PHOTO_W = CUTOUT_W * SCALE;
const PHOTO_H = CUTOUT_H * SCALE;
const PHOTO_TOP = CUTOUT_TOP * SCALE;
const TEXT_W = 160 * SCALE;
const TEXT_H = 57 * SCALE;

function formatDate(iso?: string) {
  if (!iso) return 'unknown date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'unknown date';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase();
}

export default function CatalogScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [cats, setCats] = useState<Cat[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    
    try {
      const currentProfile = await ProfileStorage.getCurrentProfile();
      
      if (!currentProfile) {
        // No profile selected, redirect to profile setup
        router.replace('/profile-setup');
        return;
      }

      setProfile(currentProfile);
      
      const all = await CatStorage.getAllCats(currentProfile.id);
      all.sort((a, b) => {
        const ad = new Date(a.lastUpdated || a.dateAdded || 0).getTime();
        const bd = new Date(b.lastUpdated || b.dateAdded || 0).getTime();
        return bd - ad;
      });
      setCats(all);
    } catch (error) {
      console.error('Error loading catalog:', error);
    }
    
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.patternContainer} pointerEvents="none">
          <Image source={require('@/assets/images/background.png')} style={styles.bgPattern} resizeMode="cover" />
        </View>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>catalog</Text>
              <Text style={styles.subtitle}>...</Text>
            </View>
            <Image 
              source={require('@/assets/images/meomow-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
        <View style={styles.center}>
          <Text style={styles.loading}>loading kitties...</Text>
        </View>
      </View>
    );
  }

  if (cats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.patternContainer} pointerEvents="none">
          <Image source={require('@/assets/images/background.png')} style={styles.bgPattern} resizeMode="cover" />
        </View>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}> {profile?.displayName ? `${profile.displayName}'s catalog` : 'catalog'}</Text>
              <Text style={styles.subtitle}>
                0 kitties found
              </Text>
            </View>
            <Image 
              source={require('@/assets/images/meomow-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyHeading}>meow! no cats here...</Text>
          <Text style={styles.emptyBody}>tap + to add your first kitty</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.patternContainer} pointerEvents="none">
        <Image source={require('@/assets/images/background.png')} style={styles.bgPattern} resizeMode="cover" />
      </View>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>{profile?.displayName ? `${profile.displayName}'s catalog` : 'catalog'}</Text>
            <Text style={styles.subtitle}>
              `${cats.length} ${cats.length === 1 ? 'kitty' : 'kitties'} found`
            </Text>
          </View>
          <Image 
            source={require('@/assets/images/meomow-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        data={cats}
        keyExtractor={(c) => c.id}
        numColumns={2}
        renderItem={({ item }) => {
          const latestPhoto =
            item.photoUris && item.photoUris.length > 0
              ? item.photoUris[item.photoUris.length - 1]
              : item.photoUri;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/cat/${item.id}`)}
              style={styles.cardTap}
            >
              <View style={styles.frameBox}>
                {/* Photo sits BEHIND the frame, positioned to the cutout */}
                {latestPhoto ? (
                  <Image
                    source={{ uri: latestPhoto }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.photo, { backgroundColor: 'rgba(56,48,41,0.1)' }]} />
                )}

                {/* Frame overlay fills the card */}
                <Image
                  source={require('@/assets/images/framePink.png')}
                  style={styles.frameOverlay}
                  resizeMode="stretch"
                />

                {/* Bottom text box, centered */}
                <View style={styles.textBox}>
                  <Text style={styles.date}>{formatDate(item.lastUpdated || item.dateAdded)}</Text>
                  <Text style={styles.name}>{item.name || '???'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
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
  header: {
    paddingHorizontal: H_PADDING,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    height: 50,
    width: 50,
  },
  title: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
  },
  subtitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.textInactive,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.backgroundAlt,
  },
  loading: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },
  emptyBody: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyHeading: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },

  list: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 16,
    paddingTop: 8,
    rowGap: 16,
  },

  // Two column card
  cardTap: {
    width: CARD_WIDTH,
  },

  // Root of a single framed card
  frameBox: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },

  // Scaled photo positioned to the cutout window
  photo: {
    position: 'absolute',
    width: PHOTO_W,
    height: PHOTO_H,
    top: PHOTO_TOP,
    left: (CARD_WIDTH - PHOTO_W) / 2, // center horizontally in the window
  },

  // Frame image overlay across the whole card
  frameOverlay: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    left: 0,
    top: 0,
  },

  // Bottom text box: 160×57 scaled, centered, pinned to bottom
  textBox: {
    position: 'absolute',
    width: TEXT_W,
    height: TEXT_H,
    left: (CARD_WIDTH - TEXT_W) / 2,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  date: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.text,
    opacity: 0.7,
    textTransform: 'lowercase',
  },
  name: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
  },
});