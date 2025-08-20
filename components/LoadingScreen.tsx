import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ImageSourcePropType } from 'react-native';
import { Colors } from '@/constants';

type Props = {
  backgroundColor?: string;
  // if you ever want to pass a different image or label
  source?: ImageSourcePropType;
  label?: string;
};

export default function LoadingScreen({
  backgroundColor = Colors.primary.background,
  source = require('@/assets/images/meomow-logo.png'),
  label = 'meomow',
}: Props) {
  const bob = useRef(new Animated.Value(0)).current;      // vertical float
  const fade = useRef(new Animated.Value(1)).current;     // subtle opacity pulse

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(bob, {
            toValue: -6,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bob, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(fade, {
            toValue: 0.92,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fade, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, [bob, fade]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.Image
        source={source}
        style={[
          styles.logo,
          {
            transform: [{ translateY: bob }],
            opacity: fade,
          },
        ]}
        resizeMode="contain"
      />
      <Text style={styles.wordmark}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 250 x 250, centered
  logo: {
    width: 250,
    height: 250,
  },
  // Jua Regular, 48, color #302B27, no spacing from image
  wordmark: {
    fontFamily: 'Jua-Regular',
    fontSize: 48,
    color: '#302B27',
    marginTop: 0,
  },
});
