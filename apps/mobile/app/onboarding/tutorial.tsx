import { View, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@marketplace/shared';
import { AnimatedGradient } from '../../src/components/AnimatedGradient';

const { width: screenWidth } = Dimensions.get('window');

interface TipSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const tips: TipSlide[] = [
  {
    id: '1',
    icon: '📝',
    title: 'Post or Find Jobs',
    description: 'Need something done? Post a job. Looking for work? Browse opportunities and apply instantly.',
  },
  {
    id: '2',
    icon: '💬',
    title: 'Communicate Safely',
    description: 'Chat with others through our secure messaging. All conversations are monitored for safety.',
  },
  {
    id: '3',
    icon: '✅',
    title: 'Complete & Review',
    description: 'Finish the job, confirm completion, and leave honest reviews to build your reputation.',
  },
  {
    id: '4',
    icon: '⭐',
    title: 'Build Your Profile',
    description: 'A great profile with reviews and completed jobs helps you get hired faster and earn trust.',
  },
];

export default function TutorialScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { updateUser } = useAuthStore();

  const isLastSlide = currentIndex === tips.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      handleFinish();
    } else {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      await updateUser({ onboarding_completed: true });
    } catch (error) {
      console.error('Failed to update onboarding status:', error);
    }
    router.replace('/(tabs)');
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setCurrentIndex(index);
  };

  const renderSlide = ({ item }: { item: TipSlide }) => {
    return (
      <View style={[styles.slide, { width: screenWidth }]}>
        <Text style={styles.slideIcon}>{item.icon}</Text>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedGradient />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.flatListContainer}>
            <FlatList
              ref={flatListRef}
              data={tips}
              renderItem={renderSlide}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              bounces={false}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              snapToAlignment="center"
            />
          </View>

          <View style={styles.pagination}>
            {tips.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.nextButton}
              contentStyle={styles.buttonContent}
              buttonColor="#22c55e"
              textColor="#ffffff"
            >
              {isLastSlide ? 'Get Started' : 'Next'}
            </Button>
            {!isLastSlide && (
              <Button
                mode="text"
                onPress={handleSkip}
                style={styles.skipButton}
                contentStyle={styles.buttonContent}
                textColor="rgba(255, 255, 255, 0.7)"
              >
                Skip Tutorial
              </Button>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  flatListContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideIcon: {
    fontSize: 96,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#ffffff',
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: 32,
  },
  nextButton: {
    borderRadius: 12,
    marginBottom: 12,
  },
  skipButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 10,
  },
});
