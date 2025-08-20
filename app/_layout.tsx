// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import * as SplashScreen from 'expo-splash-screen';
import LoadingScreen from '@/components/LoadingScreen';

// Keep the OS splash until we decide to hide it
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // 1) Only wait for fonts (simpler & reliable). If the font fails, proceed.
  const [fontsLoaded, fontError] = useFonts({ 'Jua-Regular': Jua_400Regular });
  const ready = fontsLoaded || !!fontError;

  // 2) One piece of state that controls our animated boot screen
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Hard fallback: never allow boot screen to persist beyond X seconds
    const MAX_BOOT_MS = 3500;
    const hardTimeout = setTimeout(() => {
      if (!cancelled) setShowBoot(false);
      SplashScreen.hideAsync().catch(() => {});
    }, MAX_BOOT_MS);

    // Normal path: when ready, hide OS splash and show our loader briefly
    if (ready) {
      (async () => {
        await SplashScreen.hideAsync().catch(() => {});
        const MIN_DISPLAY_MS = 700; // short & consistent
        setTimeout(() => {
          if (!cancelled) setShowBoot(false);
        }, MIN_DISPLAY_MS);
      })();
    }

    return () => {
      cancelled = true;
      clearTimeout(hardTimeout);
    };
  }, [ready]);

  // 3) While booting, render your animated loader
  if (showBoot) {
    return <LoadingScreen />;
  }

  // 4) App content
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
