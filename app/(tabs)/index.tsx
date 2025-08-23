import { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, FontSizes } from '@/constants';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Layout constants for 2-col grid
const H_PADDING = 16;          // screen horizontal padding (matches header/listContent)
const GUTTER = 16;             // space between columns
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GUTTER) / 2;
const FRAME_ASPECT = 172 / 204; // width / height of frame image

// Inner layout of content inside the frame
const FRAME_INSET_X = 12;      // left/right inset inside the frame for inner content
const PHOTO_TOP = 12;          // top offset of photo inside frame
const TEXT_GAP = 8;            // gap between photo -> date, date -> name

function formatDate(iso?: string) {
  if (!iso) return 'unknown date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'unknown date';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase();
}

export default function CatalogScreen() {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await CatStorage.getAllCats();
    all.sort((a, b) => {
      const ad = new Date(a.lastUpdated || a.dateAdded || 0).getTime();
      const bd = new Date(b.lastUpdated || b.dateAdded || 0).getTime();
      return bd - ad;
    });
    setCats(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>catalog</Text>
          <Text style={styles.subtitle}>...</Text>
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
        <View style={styles.header}>
          <Text style={styles.title}>catalog</Text>
          <Text style={styles.subtitle}>0 kitties found</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>catalog</Text>
        <Text style={styles.subtitle}>
          {cats.length} {cats.length === 1 ? 'kitty' : 'kitties'} found
        </Text>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{ justifyContent: 'space-between' }} // clean 2-col alignment
        data={cats}
        keyExtractor={(c) => c.id}
        numColumns={2}
        renderItem={({ item }) => {
          const latestPhoto =
            item.photoUris && item.photoUris.length > 0
              ? item.photoUris[item.photoUris.length - 1]
              : item.photoUri;

          const innerPhotoSize = CARD_WIDTH - FRAME_INSET_X * 2; // square photo inside frame

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/cat/${item.id}`)}
              style={styles.cardTap}
            >
              <ImageBackground
                source={require('@/assets/images/framePink.png')}
                style={styles.frame}
                imageStyle={styles.frameImage}
              >
                {/* Photo area */}
                {latestPhoto ? (
                  <Image
                    source={{ uri: latestPhoto }}
                    style={[
                      styles.photoInFrame,
                      {
                        width: innerPhotoSize,
                        height: innerPhotoSize,
                        marginTop: PHOTO_TOP,
                      },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.photoInFrame,
                      {
                        width: innerPhotoSize,
                        height: innerPhotoSize,
                        marginTop: PHOTO_TOP,
                      },
                    ]}
                  />
                )}

                {/* Date */}
                <Text style={[styles.date, { marginTop: TEXT_GAP }]}>
                  {formatDate(item.lastUpdated || item.dateAdded)}
                </Text>

                {/* Name */}
                <Text style={[styles.name, { marginTop: 4 }]}>
                  {item.name || '???'}
                </Text>
              </ImageBackground>
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
  header: {
    paddingHorizontal: H_PADDING,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.primary.backgroundAlt,
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

  // Card tap target (no flex here; fixed width via frame)
  cardTap: {
    width: CARD_WIDTH,
  },

  // Frame container uses fixed width and the frame's aspect ratio
  frame: {
    width: CARD_WIDTH,
    aspectRatio: FRAME_ASPECT,
    alignItems: 'center',
  },
  frameImage: {
    resizeMode: 'stretch', // stretch so the PNG frame scales cleanly to our width
  },

  // Photo area that sits inside the frame borders
  photoInFrame: {
    backgroundColor: 'rgba(56,48,41,0.1)',
    borderRadius: 8,
  },

  // Text inside the frame
  date: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.caption,
    color: Colors.primary.text,
    opacity: 0.7,
    alignSelf: 'flex-start',
    marginLeft: FRAME_INSET_X,
    textTransform: 'lowercase',
  },
  name: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.text,
    alignSelf: 'flex-start',
    marginLeft: FRAME_INSET_X,
  },
});
