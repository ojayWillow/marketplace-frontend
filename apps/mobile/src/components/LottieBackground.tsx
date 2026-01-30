import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

export function LottieBackground() {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      <LottieView
        ref={animationRef}
        source={require('../../assets/animations/particles.json')}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
