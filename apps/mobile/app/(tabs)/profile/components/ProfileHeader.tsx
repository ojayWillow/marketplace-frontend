import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Badge } from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../../src/theme';

interface ProfileHeaderProps {
  activeTheme: 'light' | 'dark';
  unreadCount: number;
}

export function ProfileHeader({ activeTheme, unreadCount }: ProfileHeaderProps) {
  return (
    <LinearGradient
      colors={activeTheme === 'dark' ? ['#1e3a5f', '#0c1929'] : ['#0ea5e9', '#0284c7']}
      style={styles.heroGradient}
    >
      <SafeAreaView edges={['top']} collapsable={false}>
        <View style={styles.topBar}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.topBarRight}>
            <Pressable onPress={() => router.push('/settings')} style={styles.iconButton}>
              <Text style={styles.iconEmoji}>⚙️</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/notifications')} style={styles.iconButton} collapsable={false}>
              <Text style={styles.iconEmoji}>🔔</Text>
              <View style={[styles.badgeContainer, { opacity: unreadCount > 0 ? 1 : 0 }]} collapsable={false}>
                <Badge size={16} style={styles.badge}>
                  {unreadCount > 9 ? '9+' : (unreadCount || '0')}
                </Badge>
              </View>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  heroGradient: {
    paddingBottom: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
  },
  badge: {
    backgroundColor: '#ef4444',
    fontSize: 10,
  },
});
