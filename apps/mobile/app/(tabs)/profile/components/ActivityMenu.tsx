import { View, Pressable, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { colors } from '../../../../src/theme';

interface ActivityMenuProps {
  themeColors: typeof colors.light;
}

function MenuItem({ 
  title, 
  subtitle,
  icon, 
  onPress,
  themeColors,
}: { 
  title: string; 
  subtitle?: string;
  icon: string; 
  onPress: () => void;
  themeColors: typeof colors.light;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { backgroundColor: themeColors.backgroundSecondary },
      ]}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: themeColors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: themeColors.textMuted }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Text style={[styles.menuArrow, { color: themeColors.textMuted }]}>›</Text>
    </Pressable>
  );
}

export function ActivityMenu({ themeColors }: ActivityMenuProps) {
  return (
    <>
      {/* Activity Section */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 12, marginHorizontal: 20 }]}>
          Activity
        </Text>
        <Surface style={[styles.menuCard, { backgroundColor: themeColors.card }]} elevation={1}>
          <View style={styles.menuCardContent}>
            <MenuItem 
              title="Jobs & Offerings" 
              subtitle="View all your jobs and services"
              icon="📄" 
              onPress={() => router.push('/activity/jobs-and-offerings')}
              themeColors={themeColors}
            />
          </View>
        </Surface>
      </View>

      {/* My Listings Section - Coming Soon */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 12, marginHorizontal: 20 }]}>
          Marketplace
        </Text>
        <Surface style={[styles.menuCard, { backgroundColor: themeColors.card }]} elevation={1}>
          <View style={styles.menuCardContent}>
            <View style={styles.comingSoonItem}>
              <Text style={styles.menuIcon}>🛍️</Text>
              <View style={styles.menuTextContainer}>
                <View style={styles.comingSoonTitleRow}>
                  <Text style={[styles.menuTitle, { color: themeColors.text }]}>My Listings</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonBadgeText}>Coming Soon</Text>
                  </View>
                </View>
                <Text style={[styles.menuSubtitle, { color: themeColors.textMuted }]}>
                  Buy and sell items in your area
                </Text>
              </View>
            </View>
          </View>
        </Surface>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  menuSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuCard: {
    marginHorizontal: 20,
    borderRadius: 12,
  },
  menuCardContent: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
  },
  comingSoonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    opacity: 0.7,
  },
  comingSoonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comingSoonBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  comingSoonBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});
