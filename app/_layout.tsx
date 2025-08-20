// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import * as SplashScreen from 'expo-splash-screen';
import LoadingScreen from '@/components/LoadingScreen';

// Keep the OS/native splash visible until we say otherwise.
SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_LOADER_MS = 900;   // <- minimum time your animated loader is shown
const MAX_FAILSAFE_MS = 4000; // <- hard cap so you never get stuck

export default function RootLayout() {
  // Only gate on fonts so we avoid any “flash of wrong font”.
  const [fontsLoaded, fontError] = useFonts({ 'Jua-Regular': Jua_400Regular });
  const fontReady = fontsLoaded || !!fontError;

  // Whether to render the animated boot screen
  const [showBoot, setShowBoot] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let minTimer: NodeJS.Timeout | undefined;
    let failTimer: NodeJS.Timeout | undefined;

    // Don’t render *anything* (not even the animated loader) until the font is ready.
    // While fontReady is false, we just keep the native splash on screen by returning null.
    if (fontReady) {
      (async () => {
        // Hide native splash so our animated loader can show with the correct font.
        await SplashScreen.hideAsync().catch(() => {});
        // Show animated loader now that the font is ready.
        setShowBoot(true);

        // Minimum duration
        minTimer = setTimeout(() => {
          if (!cancelled) setShowBoot(false);
        }, MIN_LOADER_MS);

        // Hard failsafe (in case something else delays state updates)
        failTimer = setTimeout(() => {
          if (!cancelled) setShowBoot(false);
        }, MAX_FAILSAFE_MS);
      })();
    }

    return () => {
      cancelled = true;
      if (minTimer) clearTimeout(minTimer);
      if (failTimer) clearTimeout(failTimer);
    };
  }, [fontReady]);

  // While the font isn’t ready, render nothing (keeps native splash visible).
  if (!fontReady) {
    return null;
  }

  // Show animated boot screen for at least MIN_LOADER_MS, then continue.
  if (showBoot) {
    return <LoadingScreen />;
  }

  // Your app
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
