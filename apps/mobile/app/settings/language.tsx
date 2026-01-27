import { View, StyleSheet, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, RadioButton } from 'react-native-paper';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

const LANGUAGE_STORAGE_KEY = '@marketplace_language';

export default function LanguageSettingsScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    // Load saved language preference
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
      if (saved) {
        setSelectedLanguage(saved);
      }
    });
  }, []);

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
    
    // Persist choice for future use
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
    
    // Note: i18n translations are not currently active in mobile app
    // This screen saves the preference for when translations are re-enabled
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
        
        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>
            ℹ️ Translations are currently being updated. The app is displayed in English for now.
          </Text>
        </View>
        
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
          Your language preference will be saved for when translations are available.
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
