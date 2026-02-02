import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { useThemeStore } from '../stores/themeStore';
import { colors } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface Country {
  name: string;
  code: string; // ISO code (e.g., 'LV')
  dialCode: string; // Phone dial code (e.g., '+371')
  flag: string; // Emoji flag
}

// Common European and nearby countries, sorted by relevance for Baltic region
export const COUNTRIES: Country[] = [
  { name: 'Latvia', code: 'LV', dialCode: '+371', flag: '🇱🇻' },
  { name: 'Lithuania', code: 'LT', dialCode: '+370', flag: '🇱🇹' },
  { name: 'Estonia', code: 'EE', dialCode: '+372', flag: '🇪🇪' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420', flag: '🇨🇿' },
  { name: 'Slovakia', code: 'SK', dialCode: '+421', flag: '🇸🇰' },
  { name: 'Hungary', code: 'HU', dialCode: '+36', flag: '🇭🇺' },
  { name: 'Romania', code: 'RO', dialCode: '+40', flag: '🇷🇴' },
  { name: 'Bulgaria', code: 'BG', dialCode: '+359', flag: '🇧🇬' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380', flag: '🇺🇦' },
  { name: 'Belarus', code: 'BY', dialCode: '+375', flag: '🇧🇾' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: '🇮🇱' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
];

interface CountryCodePickerProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

export default function CountryCodePicker({
  selectedCountry,
  onSelect,
  disabled = false,
}: CountryCodePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const insets = useSafeAreaInsets();

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const query = searchQuery.toLowerCase().trim();
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.dialCode.includes(query) ||
        country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = useCallback(
    (country: Country) => {
      onSelect(country);
      setModalVisible(false);
      setSearchQuery('');
    },
    [onSelect]
  );

  const handleClose = useCallback(() => {
    setModalVisible(false);
    setSearchQuery('');
  }, []);

  const renderCountryItem = useCallback(
    ({ item }: { item: Country }) => (
      <TouchableOpacity
        style={[
          styles.countryItem,
          { borderBottomColor: themeColors.border },
          item.code === selectedCountry.code && {
            backgroundColor: activeTheme === 'dark' ? themeColors.elevated : '#e0f2fe',
          },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.countryFlag}>{item.flag}</Text>
        <View style={styles.countryInfo}>
          <Text style={[styles.countryName, { color: themeColors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.countryDialCode, { color: themeColors.textSecondary }]}>
            {item.dialCode}
          </Text>
        </View>
        {item.code === selectedCountry.code && (
          <Text style={[styles.checkmark, { color: themeColors.primaryAccent }]}>✓</Text>
        )}
      </TouchableOpacity>
    ),
    [selectedCountry.code, handleSelect, themeColors, activeTheme]
  );

  const keyExtractor = useCallback((item: Country) => item.code, []);

  const styles = createStyles(themeColors, activeTheme, insets);

  return (
    <>
      {/* Country Code Button */}
      <TouchableOpacity
        style={[
          styles.pickerButton,
          disabled && styles.pickerButtonDisabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.pickerFlag}>{selectedCountry.flag}</Text>
        <Text style={[styles.pickerCode, { color: themeColors.text }]}>
          {selectedCountry.dialCode}
        </Text>
        <Text style={[styles.pickerArrow, { color: themeColors.textMuted }]}>▼</Text>
      </TouchableOpacity>

      {/* Country Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalContainer, { backgroundColor: themeColors.background }]}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
            <View style={styles.headerLeft} />
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              Select Country
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={handleClose}
              iconColor={themeColors.textSecondary}
            />
          </View>

          {/* Search Input */}
          <View style={[styles.searchContainer, { backgroundColor: themeColors.inputBackground }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <RNTextInput
              style={[styles.searchInput, { color: themeColors.text }]}
              placeholder="Search country or code..."
              placeholderTextColor={themeColors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Country List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                  No countries found
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const createStyles = (themeColors: any, activeTheme: string, insets: any) =>
  StyleSheet.create({
    // Picker Button
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.inputBackground,
      paddingHorizontal: 12,
      paddingVertical: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: themeColors.border,
      marginRight: 8,
    },
    pickerButtonDisabled: {
      opacity: 0.5,
    },
    pickerFlag: {
      fontSize: 20,
      marginRight: 6,
    },
    pickerCode: {
      fontSize: 16,
      fontWeight: '500',
    },
    pickerArrow: {
      fontSize: 10,
      marginLeft: 4,
    },
    // Modal
    modalContainer: {
      flex: 1,
      paddingTop: insets.top,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderBottomWidth: 1,
    },
    headerLeft: {
      width: 40,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '600',
    },
    // Search
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      padding: 0,
    },
    // List
    listContent: {
      paddingBottom: insets.bottom + 20,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    countryFlag: {
      fontSize: 28,
      marginRight: 12,
    },
    countryInfo: {
      flex: 1,
    },
    countryName: {
      fontSize: 16,
      fontWeight: '500',
    },
    countryDialCode: {
      fontSize: 14,
      marginTop: 2,
    },
    checkmark: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    // Empty
    emptyContainer: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
    },
  });
