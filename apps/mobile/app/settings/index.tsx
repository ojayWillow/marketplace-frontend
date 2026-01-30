import { View, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Divider, Appbar } from 'react-native-paper';
import { router } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { useLanguageStore } from '../../src/stores/languageStore';
import { useTranslation } from '../../src/hooks/useTranslation';
import { colors } from '../../src/theme';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  lv: 'Latviešu',
  ru: 'Русский',
};

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { getActiveTheme, mode } = useThemeStore();
  const { language } = useLanguageStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const getAppearanceLabel = () => {
    if (mode === 'system') return t.settings.appearanceSystem;
    if (mode === 'dark') return t.settings.appearanceDark;
    return t.settings.appearanceLight;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} edges={['top']}>
      <Appbar.Header style={{ backgroundColor: themeColors.card }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t.settings.title} titleStyle={{ color: themeColors.text }} />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <Surface style={[styles.menuContainer, { backgroundColor: themeColors.card }]} elevation={0}>
          <MenuItem 
            title={t.settings.appearance} 
            subtitle={getAppearanceLabel()}
            icon="🎨" 
            onPress={() => router.push('/settings/appearance')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title={t.settings.notifications} 
            icon="🔔" 
            onPress={() => router.push('/settings/notifications')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title={t.settings.language} 
            subtitle={LANGUAGE_NAMES[language] || 'English'}
            icon="🌐" 
            onPress={() => router.push('/settings/language')}
            themeColors={themeColors}
          />
        </Surface>

        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>{t.settings.support}</Text>
        <Surface style={[styles.menuContainer, { backgroundColor: themeColors.card }]} elevation={0}>
          <MenuItem 
            title={t.settings.help} 
            icon="❓" 
            onPress={() => Alert.alert(t.settings.help, 'Contact us at support@quickhelp.lv')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title={t.settings.privacyPolicy} 
            icon="🔒" 
            onPress={() => router.push('/settings/privacy-policy')}
            themeColors={themeColors}
          />
          <Divider style={{ backgroundColor: themeColors.border }} />
          <MenuItem 
            title={t.settings.termsOfService} 
            icon="📄" 
            onPress={() => router.push('/settings/terms-of-service')}
            themeColors={themeColors}
          />
        </Surface>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: themeColors.textMuted }]}>{t.profile.appVersion}</Text>
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
  container: { flex: 1 },
  scrollView: { flex: 1 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  menuContainer: {},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuIcon: { fontSize: 20, marginRight: 16, width: 28 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16 },
  menuSubtitle: { fontSize: 13, marginTop: 2 },
  menuArrow: { fontSize: 24 },
  footer: { paddingVertical: 24, paddingHorizontal: 24, alignItems: 'center' },
  version: { fontSize: 12 },
});
