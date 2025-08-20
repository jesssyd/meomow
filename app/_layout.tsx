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
  useFrameworkReady();

  // Load the Jua font used by the loader text
  const [fontsLoaded, fontError] = useFonts({
    'Jua-Regular': Jua_400Regular,
  });

  // Control the animated loader (boot-only)
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    // Hide the native splash so our animated loader shows
    SplashScreen.hideAsync().catch(() => {});

    // Keep the animated loader up briefly (adjust duration as desired)
    const t = setTimeout(() => setShowBoot(false), 1500);
    return () => clearTimeout(t);
  }, [fontsLoaded, fontError]);

  // Show the animated loading page during boot
  if (!fontsLoaded || showBoot) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Expo Router auto-registers routes in /app — no need to list each one.
          Remove the "splash" route; the animated loader replaces it. */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Optional: keep +not-found support */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
