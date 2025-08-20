// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import * as SplashScreen from 'expo-splash-screen';
import LoadingScreen from '@/components/LoadingScreen';

// Keep the OS splash visible until we're ready to show the animated one
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // Load the Jua font used by the loader text
  const [fontsLoaded, fontError] = useFonts({
    'Jua-Regular': Jua_400Regular,
  });
  
  // Control the animated loader (boot-only)
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load
        if (!fontsLoaded && !fontError) {
          return;
        }

        // Hide the native splash so our animated loader shows
        await SplashScreen.hideAsync();
        
        // Keep the animated loader up briefly (adjust duration as desired)
        const timer = setTimeout(() => {
          setShowBoot(false);
        }, 1500);
        
        return () => clearTimeout(timer);
        
      } catch (error) {
        console.warn('Error during app preparation:', error);
        // Fallback: hide loading screen even if there's an error
        setShowBoot(false);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  // Show the animated loading page during boot
  if (!fontsLoaded || showBoot) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Explicitly define key routes to ensure they exist */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-cat" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="photo-preview" options={{ headerShown: false }} />
        <Stack.Screen name="cat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}