import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSizes } from '@/constants/Colors';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {/* Placeholder for cat illustration */}
        <View style={styles.catPlaceholder} />
      </View>
      <Text style={styles.title}>meomow</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 249,
    height: 249,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(56, 48, 41, 0.1)',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Colors.primary.text,
    borderStyle: 'dashed',
  },
  title: {
    fontFamily: 'Jua-Regular',
    fontSize: FontSizes.splash,
    color: Colors.primary.splash,
    letterSpacing: 0.96,
    textAlign: 'center',
  },
});