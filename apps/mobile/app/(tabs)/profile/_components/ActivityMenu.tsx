import { View, Pressable, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { colors } from '../../../../src/theme';
import { useTranslation } from '../../../../src/hooks/useTranslation';
import { useAuthStore } from '@marketplace/shared';

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
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  // Check if user is admin (by email for now - you can customize this)
  const adminEmails = ['dajsis@me.com', 'win10keypro@gmail.com', 'og.vitols@gmail.com'];
  const isAdmin = user?.email && adminEmails.includes(user.email);
  
  return (
    <>
      {/* Admin Section - Only visible to admins */}
      {isAdmin && (
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 12, marginHorizontal: 20 }]}>
            {t.profile.adminSection || 'Admin'}
          </Text>
          <Surface style={[styles.menuCard, { backgroundColor: themeColors.card }]} elevation={1}>
            <View style={styles.menuCardContent}>
              <MenuItem 
                title={t.profile.adminPanel || 'Admin Panel'}
                subtitle={t.profile.adminPanelSubtitle || 'Manage users, jobs, and platform'}
                icon="⚙️" 
                onPress={() => router.push('/admin')}
                themeColors={themeColors}
              />
            </View>
          </Surface>
        </View>
      )}

      {/* Activity Section */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 12, marginHorizontal: 20 }]}>
          {t.profile.activitySection}
        </Text>
        <Surface style={[styles.menuCard, { backgroundColor: themeColors.card }]} elevation={1}>
          <View style={styles.menuCardContent}>
            <MenuItem 
              title={t.profile.jobsAndOfferings}
              subtitle={t.profile.jobsAndOfferingsSubtitle}
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
          {t.profile.marketplaceSection}
        </Text>
        <Surface style={[styles.menuCard, { backgroundColor: themeColors.card }]} elevation={1}>
          <View style={styles.menuCardContent}>
            <View style={styles.comingSoonItem}>
              <Text style={styles.menuIcon}>🛍️</Text>
              <View style={styles.menuTextContainer}>
                <View style={styles.comingSoonTitleRow}>
                  <Text style={[styles.menuTitle, { color: themeColors.text }]}>{t.profile.myListings}</Text>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonBadgeText}>{t.profile.comingSoon}</Text>
                  </View>
                </View>
                <Text style={[styles.menuSubtitle, { color: themeColors.textMuted }]}>
                  {t.profile.myListingsSubtitle}
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
