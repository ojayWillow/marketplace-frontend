import { View, StyleSheet } from 'react-native';
import { Surface, Text, ActivityIndicator } from 'react-native-paper';
import { colors } from '../../../../src/theme';
import { useTranslation } from '../../../../src/hooks/useTranslation';

interface ReviewStats {
  average_rating?: number;
  total_reviews?: number;
}

interface ProfileStatsProps {
  reviewStats?: ReviewStats;
  completedTasksCount?: number;
  isLoading: boolean;
  themeColors: typeof colors.light;
}

export function ProfileStats({ reviewStats, completedTasksCount, isLoading, themeColors }: ProfileStatsProps) {
  const { t } = useTranslation();
  
  return (
    <Surface style={[styles.statsCard, { backgroundColor: themeColors.card }]} elevation={2}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#0ea5e9" />
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <View style={styles.statValueRow}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={[styles.statValue, { color: themeColors.text }]}>
                {reviewStats?.average_rating ? reviewStats.average_rating.toFixed(1) : '—'}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{t.profile.rating}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>
              {reviewStats?.total_reviews || 0}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{t.profile.reviews}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>
              {completedTasksCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{t.profile.completed}</Text>
          </View>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  starEmoji: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
});
