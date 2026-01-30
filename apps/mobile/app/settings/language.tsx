import { View, StyleSheet, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, RadioButton } from 'react-native-paper';
import { useThemeStore } from '../../src/stores/themeStore';
import { useLanguageStore } from '../../src/stores/languageStore';
import { useTranslation } from '../../src/hooks/useTranslation';
import { colors } from '../../src/theme';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export default function LanguageSettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as 'en' | 'lv' | 'ru');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
    },
    section: {
      backgroundColor: themeColors.card,
      marginTop: 16,
    },
    sectionDescription: {
      color: themeColors.textSecondary,
      fontSize: 14,
      padding: 16,
      paddingBottom: 8,
    },
    noticeCard: {
      backgroundColor: '#fef3c7',
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 8,
    },
    noticeText: {
      color: '#92400e',
      fontSize: 13,
      lineHeight: 18,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    languageItemPressed: {
      backgroundColor: themeColors.inputBackground,
    },
    languageInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    flag: {
      fontSize: 24,
      marginRight: 16,
    },
    languageName: {
      fontSize: 16,
      color: themeColors.text,
    },
    footer: {
      padding: 16,
    },
    footerText: {
      color: themeColors.textMuted,
      fontSize: 13,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: t.settings.language,
          headerBackTitle: t.common.back,
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.primaryAccent,
          headerTitleStyle: { color: themeColors.text },
        }} 
      />
      
      <Surface style={styles.section} elevation={0}>
        <Text style={styles.sectionDescription}>
          {t.settings.languageDescription}
        </Text>
        
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.code}
            onPress={() => handleLanguageChange(lang.code)}
            style={({ pressed }) => [
              styles.languageItem,
              pressed && styles.languageItemPressed,
            ]}
          >
            <View style={styles.languageInfo}>
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={styles.languageName}>{lang.name}</Text>
            </View>
            <RadioButton
              value={lang.code}
              status={language === lang.code ? 'checked' : 'unchecked'}
              onPress={() => handleLanguageChange(lang.code)}
              color={themeColors.primaryAccent}
            />
          </Pressable>
        ))}
      </Surface>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t.settings.languageFooter}
        </Text>
      </View>
    </SafeAreaView>
  );
}
