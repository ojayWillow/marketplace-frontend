import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface DateSeparatorProps {
  date: string;
  themeColors: any;
}

/**
 * Formats and displays a date separator between messages
 */
export function DateSeparator({ date, themeColors }: DateSeparatorProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: themeColors.border }]} />
      <Text style={[styles.text, { color: themeColors.textMuted }]}>
        {date}
      </Text>
      <View style={[styles.line, { backgroundColor: themeColors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
  },
});
