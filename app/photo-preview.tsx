import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
export default function PhotoPreviewScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const handleRetake = () => {
    router.back();
  };
  const handleUsePhoto = () => {
    router.push({
      pathname: '/add-cat',
      params: { photoUri }
    });
  };
  return (
    <View style={styles.container}>
      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.image} />
      )}

      <SafeAreaView style={styles.controls}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRetake}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleUsePhoto}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Use Photo
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  image: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 20,
    gap: 20,
  },
  button: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.button.primary,
  },
  buttonText: {
    fontFamily: 'Jua-Regular',
    fontSize: 16,
    color: Colors.white,
  },
  primaryButtonText: {
    color: Colors.button.primaryText,
  },
}); 