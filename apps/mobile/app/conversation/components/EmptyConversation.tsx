import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface EmptyConversationProps {
  themeColors: any;
}

/**
 * Empty state shown when conversation has no messages yet
 */
export function EmptyConversation({ themeColors }: EmptyConversationProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: themeColors.card }]}>
        <Text style={styles.icon}>👋</Text>
      </View>
      <Text style={[styles.title, { color: themeColors.text }]}>Say hello!</Text>
      <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
        Send a message to start the conversation
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
