import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { CatStorage } from '@/utils/storage';
import { Colors, FontSizes } from '@/constants/Colors';

export default function ProfileScreen() {
  const [catCount, setCatCount] = useState(0);

  useEffect(() => {
    const loadCatCount = async () => {
      const cats = await CatStorage.getAllCats();
      setCatCount(cats.length);
    };
    loadCatCount();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileImageText}>🐱</Text>
          </View>
        </View>
        
        <Text style={styles.username}>cat explorer</Text>
        <Text style={styles.catCount}>
          {catCount} {catCount === 1 ? 'kitty' : 'kitties'} discovered
        </Text>
        
        <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
          <Text style={styles.editButtonText}>edit profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.backgroundAlt,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 60,
  },
  username: {
    fontFamily: 'Jua-Regular',
    fontSize: 32,
    color: Colors.primary.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  catCount: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 40,
  },
  editButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primary.text,
    borderRadius: 24,
  },
  editButtonText: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.body,
    color: Colors.primary.text,
    textAlign: 'center',
  },
});