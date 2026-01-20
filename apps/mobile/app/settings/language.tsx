import { View, StyleSheet, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, RadioButton } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { i18n } from '@marketplace/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

const LANGUAGE_STORAGE_KEY = '@marketplace_language';

export default function LanguageSettingsScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language?.substring(0, 2) || 'en');

  useEffect(() => {
    // Load saved language
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
      if (saved) {
        setSelectedLanguage(saved);
      }
    });
  }, []);

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
    
    // Update i18n
    await i18n.changeLanguage(langCode);
    
    // Persist choice
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Language',
          headerBackTitle: 'Back',
        }} 
      />
      
      <Surface style={styles.section} elevation={0}>
        <Text style={styles.sectionDescription}>
          Choose your preferred language for the app interface.
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
              status={selectedLanguage === lang.code ? 'checked' : 'unchecked'}
              onPress={() => handleLanguageChange(lang.code)}
              color="#0ea5e9"
            />
          </Pressable>
        ))}
      </Surface>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Language changes take effect immediately.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  sectionDescription: {
    color: '#6b7280',
    fontSize: 14,
    padding: 16,
    paddingBottom: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  languageItemPressed: {
    backgroundColor: '#f9fafb',
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
    color: '#1f2937',
  },
  footer: {
    padding: 16,
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
  },
});
