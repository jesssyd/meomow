// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoadingScreen from '@/components/LoadingScreen';

// Keep the OS/native splash visible until we say otherwise.
SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_LOADER_MS = 2000;    // minimum time the animated loader shows
const MAX_FAILSAFE_MS = 4000; // hard cap to avoid getting stuck

export default function RootLayout() {
  // Gate on fonts to avoid any flash of wrong font
  const [fontsLoaded, fontError] = useFonts({ 'Jua-Regular': Jua_400Regular });
  const fontReady = fontsLoaded || !!fontError;

  // Controls showing the animated boot screen
  const [showBoot, setShowBoot] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let minTimer: ReturnType<typeof setTimeout> | undefined;
    let failTimer: ReturnType<typeof setTimeout> | undefined;

    // Do not render the animated loader until the font is ready.
    if (fontReady) {
      (async () => {
        // Hide native splash so our animated loader can render with the correct font
        await SplashScreen.hideAsync().catch(() => {});
        setShowBoot(true);

        // Minimum duration
        minTimer = setTimeout(() => {
          if (!cancelled) setShowBoot(false);
        }, MIN_LOADER_MS);

        // Failsafe
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

  // While the font is not ready, render nothing (native splash stays up)
  if (!fontReady) return null;

  // Show animated boot screen for at least MIN_LOADER_MS
  if (showBoot) return <LoadingScreen />;

  // App shell
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false // Disable swipe-to-go-back for all screens
        }} 
        initialRouteName="(tabs)"
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-cat" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="cat/[id]" />
        <Stack.Screen name="profile-setup" />
        <Stack.Screen name="profile-selection" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="photo-preview" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}