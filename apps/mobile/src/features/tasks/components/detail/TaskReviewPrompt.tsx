import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { styles } from '../../styles/taskDetailStyles';

interface TaskReviewPromptProps {
  taskId: number;
  onSkip: () => void;
}

export function TaskReviewPrompt({ taskId, onSkip }: TaskReviewPromptProps) {
  const handleReview = () => {
    onSkip();
    router.push(`/task/${taskId}/review`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Completed' }} />
      <View style={styles.centered}>
        <Text style={styles.celebrateIcon}>🎉</Text>
        <Text style={styles.celebrateTitle}>Task Completed!</Text>
        <Text style={styles.celebrateText}>Leave a review?</Text>
        <View style={styles.celebrateButtons}>
          <Button onPress={onSkip} textColor="#6b7280">
            Later
          </Button>
          <Button mode="contained" onPress={handleReview}>
            Review
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
