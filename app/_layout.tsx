// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import * as SplashScreen from 'expo-splash-screen';
import LoadingScreen from '@/components/LoadingScreen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Keep the OS splash visible until we're ready to show the animated one
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const isFrameworkReady = useFrameworkReady();
  
  // Load the Jua font used by the loader text
  const [fontsLoaded, fontError] = useFonts({
    'Jua-Regular': Jua_400Regular,
  });
  
  // Control the animated loader (boot-only)
  const [showBoot, setShowBoot] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for both fonts and framework to be ready
        if (!fontsLoaded || fontError || !isFrameworkReady) {
          return;
        }

        // Hide the native splash so our animated loader shows
        await SplashScreen.hideAsync();
        
        // Mark app as ready after a brief delay
        setTimeout(() => {
          setAppReady(true);
        }, 100);
        
        // Keep the animated loader up briefly (adjust duration as desired)
        setTimeout(() => {
          setShowBoot(false);
        }, 1800); // Slightly longer timeout
        
      } catch (error) {
        console.warn('Error during app preparation:', error);
        // Fallback: hide loading screen even if there's an error
        setAppReady(true);
        setShowBoot(false);
      }
    }

    prepare();
  }, [fontsLoaded, fontError, isFrameworkReady]);

  // Show the animated loading page during boot or if not ready
  if (!fontsLoaded || !appReady || showBoot) {
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