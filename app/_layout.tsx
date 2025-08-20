// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import * as SplashScreen from 'expo-splash-screen';
import LoadingScreen from '@/components/LoadingScreen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Keep the OS splash until we’re ready to show our animated loader
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const frameworkReady = useFrameworkReady();

  // Load the Jua font used by the loader text
  const [fontsLoaded] = useFonts({ 'Jua-Regular': Jua_400Regular });

  // Single flag that controls the boot animation visibility
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      // Wait until both are ready
      if (!frameworkReady || !fontsLoaded) return;

      // Hide native splash so our LoadingScreen becomes visible
      await SplashScreen.hideAsync();

      // Show the animated loader for a short, fixed time (avoid flicker)
      const MIN_DISPLAY_MS = 700;
      const t = setTimeout(() => {
        if (!cancelled) setShowBoot(false);
      }, MIN_DISPLAY_MS);

      return () => clearTimeout(t);
    }

    const cleanup = boot();
    return () => {
      cancelled = true;
      // cleanup may be a promise; ignore if not set
      // @ts-ignore
      if (typeof cleanup === 'function') cleanup();
    };
  }, [frameworkReady, fontsLoaded]);

  // During boot, render your animated loading screen
  if (showBoot) {
    return <LoadingScreen />;
  }

  // App content
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-cat" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="photo-preview" />
        <Stack.Screen name="cat/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
