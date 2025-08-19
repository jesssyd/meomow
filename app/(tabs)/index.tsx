import { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  Dimensions 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';
import { Colors, FontSizes } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 16px margins + 16px gap

export default function CatalogScreen() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadCats = async () => {
    const loadedCats = await CatStorage.getAllCats();
    // Sort by most recent first
    const sortedCats = loadedCats.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
    setCats(sortedCats);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCats();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCats();
    }, [])
  );

  const handleCatPress = (catId: string) => {
    router.push(`/cat-detail?id=${catId}`);
  };

  const renderCatCard = ({ item }: { item: Cat }) => (
    <TouchableOpacity 
      style={[styles.catCard, { width: cardWidth }]} 
      onPress={() => handleCatPress(item.id)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.photoUri }} style={styles.catImage} />
      <View style={styles.catInfo}>
        <Text style={styles.catName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.catDate} numberOfLines={1}>
          {new Date(item.dateAdded).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>meow! no cats here...</Text>
      <Text style={styles.emptySubtitle}>tap the + button to add your first kitty</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>cat blog</Text>
        {cats.length > 0 && (
          <Text style={styles.catCount}>
            {cats.length} {cats.length === 1 ? 'kitty' : 'kitties'} discovered
          </Text>
        )}
      </View>

      <FlatList
        data={cats}
        renderItem={renderCatCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={cats.length > 0 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary.text}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },
  catCount: {
    fontFamily: 'Jua-Regular',
    fontSize: 14,
    color: Colors.primary.text,
    opacity: 0.7,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  catCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 12,
    padding: 8,
    shadowColor: Colors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  catImage: {
    width: '100%',
    height: cardWidth - 60,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 48, 41, 0.1)',
  },
  catInfo: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    height: 50,
    justifyContent: 'center',
  },
  catName: {
    fontFamily: 'Jua-Regular',
    fontSize: 16,
    color: Colors.primary.text,
    textAlign: 'center',
  },
  catDate: {
    fontFamily: 'Jua-Regular',
    fontSize: 12,
    color: Colors.primary.text,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 37,
    minHeight: 400,
  },
  emptyTitle: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.heading,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.black,
    textAlign: 'center',
  },
});