import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, CreditCard as Edit } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { FontSizes, FontWeights } from '@/constants/Fonts';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';
import { Colors, FontSizes } from '@/constants';
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCat();
      try {
        const cats = await CatStorage.getAllCats();
        setCatCount(cats.length);
      } catch (error) {
        console.error('Error loading cat count:', error);
      }
  const loadCat = async () => {
    if (!id) return;
    
    setLoading(true);
    const catData = await CatStorage.getCatById(id);
    setCat(catData);
    setLoading(false);
  };

  const handleEdit = () => {
    if (cat) {
      router.push({
        pathname: '/add-cat',
        params: { catId: cat.id }
      });
    }
  };

  const handleDelete = () => {
    if (!cat) return;

    Alert.alert(
      'Delete Cat',
      `Are you sure you want to delete ${cat.name} from your catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await CatStorage.deleteCat(cat.id);
            if (success) {
              router.back();
            } else {
              Alert.alert('Error', 'Failed to delete cat. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!cat) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Cat not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.primary.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{cat.name}</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEdit}
        >
          <Edit size={20} color={Colors.primary.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: cat.photoUri }} style={styles.catImage} />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.catName}>{cat.name}</Text>
          <Text style={styles.lastUpdated}>
            last updated: {new Date(cat.lastUpdated).toLocaleDateString()}
          </Text>

          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.primary.text} />
            <Text style={styles.locationText}>{cat.location.address}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{cat.name} is...</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>• a {cat.breed} cat</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>• {cat.age}</Text>
              </View>
            </View>
          </View>

          {cat.personality.length > 0 && (
            <View style={styles.personalitySection}>
              <View style={styles.personalityContainer}>
                {cat.personality.map((trait, index) => (
                  <View key={trait} style={styles.personalityChip}>
                    <Text style={styles.personalityText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {cat.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>notes</Text>
              <Text style={styles.notesText}>{cat.notes}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Cat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary.background,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },
  editButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: Colors.primary.background,
    paddingBottom: 20,
    alignItems: 'center',
  },
  catImage: {
    width: 280,
    height: 280,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 48, 41, 0.1)',
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  catName: {
    fontFamily: 'Jua-Regular',
    fontSize: 32,
    color: Colors.primary.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    fontFamily: 'Jua-Regular',
    fontSize: 14,
    color: Colors.primary.text,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    marginLeft: 8,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.heading,
    color: Colors.primary.text,
    marginBottom: 12,
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
  },
  personalitySection: {
    marginBottom: 20,
  },
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personalityChip: {
    backgroundColor: Colors.personality.selected.background,
    borderColor: Colors.personality.selected.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  personalityText: {
    fontFamily: 'Jua-Regular',
    fontSize: 14,
    color: Colors.personality.selected.text,
  },
  notesSection: {
    marginBottom: 40,
  },
  notesText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  deleteButtonText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: '#FF3B30',
  },
  loadingText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    textAlign: 'center',
    marginTop: 50,
  },
});