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
      <View style={styles.center}>
        <Text style={styles.loading}>loading kitties...</Text>
      </View>
    );
  }

  if (cats.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>no cats yet. tap + to add one</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
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
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgb(255, 253, 245)' },
  loading: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text },
  empty: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text },
  list: { padding: 16, gap: 16 },
  card: { flex: 1, margin: 8, backgroundColor: Colors.card.background, borderRadius: 12, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 1, backgroundColor: 'rgba(56,48,41,0.1)' },
  name: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text, paddingTop: 8, paddingHorizontal: 8, textAlign: 'center' },
  date: { fontFamily: 'Jua-Regular', fontSize: FontSizes.caption, color: Colors.primary.text, opacity: 0.7, paddingBottom: 8, textAlign: 'center' },
});