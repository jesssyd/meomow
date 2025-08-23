import { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, FontSizes } from '@/constants';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';

function formatDate(iso?: string) {
  if (!iso) return 'unknown date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'unknown date';
  return d
    .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    .toLowerCase();
}

export default function CatalogScreen() {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await CatStorage.getAllCats();
    // Sort newest first by lastUpdated or dateAdded
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
        <Text style={styles.subtitle}>{cats.length } {cats.length == 1 ? kitty : kitties } found</Text>
      </View>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
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
              style={styles.card}
              onPress={() => router.push(`/cat/${item.id}`)}
            >
              {latestPhoto ? (
                <Image source={{ uri: latestPhoto }} style={styles.photo} />
              ) : (
                <View style={styles.photo} />
              )}
              <Text style={styles.name}>{item.name || '???'}</Text>
              <Text style={styles.date}>{formatDate(item.lastUpdated || item.dateAdded)}</Text>
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
    backgroundColor: Colors.primary.backgroundAlt 
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60, // Account for status bar
    paddingBottom: 16,
    backgroundColor: Colors.primary.backgroundAlt
  },
  title: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text
  },
  subtitle: {
    fontFamily: 'Jua-Regular',
    ...FontSizes.body,
    color: Colors.primary.textInactive,
    marginTop: 4
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: Colors.primary.backgroundAlt 
  },
  loading: { 
    fontFamily: 'Jua-Regular', 
    ...FontSizes.body,
    color: Colors.primary.text 
  },
  emptyBody: { 
    fontFamily: 'Jua-Regular', 
    ...FontSizes.body,
    color: Colors.primary.text,
    textAlign: 'center',
    marginTop: 8
  },
  emptyHeading: { 
    fontFamily: 'Jua-Regular', 
    ...FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center'
  },
  list: { 
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  listContent: { 
    padding: 16, 
    gap: 16 
  },
  card: { 
    flex: 1, 
    margin: 8, 
    backgroundColor: Colors.card.background, 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  photo: { 
    width: '100%', 
    aspectRatio: 1, 
    backgroundColor: 'rgba(56,48,41,0.1)' 
  },
  name: { 
    fontFamily: 'Jua-Regular', 
    ...FontSizes.body,
    color: Colors.primary.text, 
    paddingTop: 8, 
    paddingHorizontal: 8, 
    textAlign: 'center' 
  },
  date: { 
    fontFamily: 'Jua-Regular', 
    ...FontSizes.caption,
    color: Colors.primary.text, 
    opacity: 0.7, 
    paddingBottom: 8, 
    textAlign: 'center' 
  },
});