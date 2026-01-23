import { View, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Divider } from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function SettingsScreen() {
  const { getActiveTheme, mode } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const getAppearanceLabel = () => {
    if (mode === 'system') return 'System';
    if (mode === 'dark') return 'Dark';
    return 'Light';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} edges={['top', 'bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Settings',
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.text,
        }} 
      />
      <ScrollView style={styles.scrollView}>
        {/* Appearance */}
        <Surface style={[styles.menuContainer, { backgroundColor: themeColors.card }]} elevation={0}>
          <MenuItem 
            title="Appearance" 
            subtitle={getAppearanceLabel()}
            icon="🎨" 
            onPress={() => router.push('/settings/appearance')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="Notifications" 
            icon="🔔" 
            onPress={() => router.push('/settings/notifications')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="Language" 
            subtitle="English"
            icon="🌐" 
            onPress={() => router.push('/settings/language')}
            themeColors={themeColors}
          />
        </Surface>

        {/* Support */}
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>Support</Text>
        <Surface style={[styles.menuContainer, styles.menuContainerWithMargin, { backgroundColor: themeColors.card }]} elevation={0}>
          <MenuItem 
            title="Help & Support" 
            icon="❓" 
            onPress={() => Alert.alert('Help & Support', 'Contact us at support@quickhelp.lv')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="Privacy Policy" 
            icon="🔒" 
            onPress={() => Alert.alert('Privacy Policy', 'Coming soon')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title="Terms of Service" 
            icon="📄" 
            onPress={() => Alert.alert('Terms of Service', 'Coming soon')}
            themeColors={themeColors}
          />
        </Surface>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={[styles.version, { color: themeColors.textMuted }]}>App version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
        {subtitle ? (
          <Text style={[styles.menuSubtitle, { color: themeColors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.menuArrow, { color: themeColors.textMuted }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  menuContainer: {
    // No marginTop for first section - it's directly under header
  },
  menuContainerWithMargin: {
    marginTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 28,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
  },
  menuSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
  },
});
