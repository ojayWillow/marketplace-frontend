import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useAuthStore } from '@marketplace/shared';

const { width: screenWidth } = Dimensions.get('window');

interface TipSlide {
  icon: string;
  title: string;
  description: string;
}

const tips: TipSlide[] = [
  {
    icon: '📝',
    title: 'Post or Find Jobs',
    description: 'Need something done? Post a job. Looking for work? Browse opportunities and apply instantly.',
  },
  {
    icon: '💬',
    title: 'Communicate Safely',
    description: 'Chat with others through our secure messaging. All conversations are monitored for safety.',
  },
  {
    icon: '✅',
    title: 'Complete & Review',
    description: 'Finish the job, confirm completion, and leave honest reviews to build your reputation.',
  },
  {
    icon: '⭐',
    title: 'Build Your Profile',
    description: 'A great profile with reviews and completed jobs helps you get hired faster and earn trust.',
  },
];

export default function TutorialScreen() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<any>(null);
  const { updateUser } = useAuthStore();

  const isLastSlide = currentIndex === tips.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      handleFinish();
    } else {
      carouselRef.current?.next();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    // Mark onboarding as completed
    await updateUser({ onboarding_completed: true });
    // Navigate to main app
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item }: { item: TipSlide }) => {
    return (
      <View style={[styles.slide, { backgroundColor: themeColors.background }]}>
        <Text style={styles.slideIcon}>{item.icon}</Text>
        <Text style={[styles.slideTitle, { color: themeColors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.slideDescription, { color: themeColors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    content: {
      flex: 1,
    },
    carouselContainer: {
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
    },
    slideDescription: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 20,
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
      backgroundColor: themeColors.border,
    },
    dotActive: {
      width: 24,
      backgroundColor: themeColors.primaryAccent,
    },
    buttonContainer: {
      padding: 24,
      paddingBottom: 32,
      gap: 12,
    },
    nextButton: {
      borderRadius: 12,
      backgroundColor: themeColors.primaryAccent,
    },
    skipButton: {
      borderRadius: 12,
    },
    buttonContent: {
      paddingVertical: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <Carousel
            ref={carouselRef}
            width={screenWidth}
            height={500}
            data={tips}
            renderItem={renderSlide}
            onSnapToItem={(index) => setCurrentIndex(index)}
            loop={false}
          />
        </View>

        {/* Pagination Dots */}
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

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
            contentStyle={styles.buttonContent}
          >
            {isLastSlide ? 'Get Started' : 'Next'}
          </Button>
          {!isLastSlide && (
            <Button
              mode="text"
              onPress={handleSkip}
              style={styles.skipButton}
              contentStyle={styles.buttonContent}
              textColor={themeColors.textSecondary}
            >
              Skip Tutorial
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
