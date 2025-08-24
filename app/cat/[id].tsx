// app/cat/[id].tsx
import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Pencil } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { FontSizes } from '@/constants/Fonts';
import { Cat } from '@/types/cat';
import { CatStorage } from '@/utils/storage';

const { width } = Dimensions.get('window');

// ...formatDate and component state/effects unchanged...

export default function CatDetailScreen() {
  // ...hooks and helpers unchanged...

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background pattern above color, below content */}
      <View style={styles.patternContainer} pointerEvents="none">
        <Image
          source={require('@/assets/images/pawprint.png')}
          style={styles.bgPattern}
        />
      </View>

      {/* Foreground content */}
      <View style={styles.contentLayer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.primary.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{catName}</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Pencil size={20} color={Colors.primary.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* ...everything else unchanged (lastUpdated, gallery, location, details, notes) ... */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.backgroundGreen },

  // New: pattern layer
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bgPattern: {
    position: 'absolute',
    right: 0,
    top: '14%',          // Figma Y = 14%
    width: '47%',        // Figma scale = 47%
    aspectRatio: 1,      // paw image is square
    opacity: 0.05,       // overall pattern opacity = 5%
    resizeMode: 'contain',
  },

  // Wrap all foreground UI so it sits above the pattern
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },

  center: { justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary.backgroundGreen,
  },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    fontFamily: 'Jua-Regular',
    ...FontSizes.heading,
    color: Colors.primary.text,
    textAlign: 'center',
  },

  content: { flex: 1 },

  // Gallery and the rest of your existing styles remain as you have them...
});
