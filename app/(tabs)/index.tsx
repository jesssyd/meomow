// app/(tabs)/index.tsx
import { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, FontSizes } from '@/constants';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';

export default function CatalogScreen() {
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await CatStorage.getAllCats();
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
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/cat/${item.id}`)}
        >
          <Image source={{ uri: item.photoUri }} style={styles.photo} />
          <Text style={styles.name}>{item.name || '???'}</Text>
          <Text style={styles.date}>
  {new Date(item.lastUpdated || item.dateAdded).toLocaleDateString()}
</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary.background },
  loading: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text },
  empty: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text },
  list: { padding: 16, gap: 16 },
  card: { flex: 1, margin: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 1, backgroundColor: 'rgba(56,48,41,0.1)' },
  name: { fontFamily: 'Jua-Regular', fontSize: FontSizes.body, color: Colors.primary.text, padding: 8, textAlign: 'center' },
});
