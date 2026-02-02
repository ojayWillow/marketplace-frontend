import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput as RNTextInput,
  Keyboard,
} from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';
import { colors } from '../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

// Common European countries first, then others alphabetically
export const COUNTRIES: Country[] = [
  // Baltic & Nordic (most relevant)
  { name: 'Latvia', code: 'LV', dialCode: '371', flag: '🇱🇻' },
  { name: 'Lithuania', code: 'LT', dialCode: '370', flag: '🇱🇹' },
  { name: 'Estonia', code: 'EE', dialCode: '372', flag: '🇪🇪' },
  { name: 'Finland', code: 'FI', dialCode: '358', flag: '🇫🇮' },
  { name: 'Sweden', code: 'SE', dialCode: '46', flag: '🇸🇪' },
  { name: 'Norway', code: 'NO', dialCode: '47', flag: '🇳🇴' },
  { name: 'Denmark', code: 'DK', dialCode: '45', flag: '🇩🇰' },
  // Major European
  { name: 'Germany', code: 'DE', dialCode: '49', flag: '🇩🇪' },
  { name: 'United Kingdom', code: 'GB', dialCode: '44', flag: '🇬🇧' },
  { name: 'France', code: 'FR', dialCode: '33', flag: '🇫🇷' },
  { name: 'Italy', code: 'IT', dialCode: '39', flag: '🇮🇹' },
  { name: 'Spain', code: 'ES', dialCode: '34', flag: '🇪🇸' },
  { name: 'Netherlands', code: 'NL', dialCode: '31', flag: '🇳🇱' },
  { name: 'Belgium', code: 'BE', dialCode: '32', flag: '🇧🇪' },
  { name: 'Poland', code: 'PL', dialCode: '48', flag: '🇵🇱' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '420', flag: '🇨🇿' },
  { name: 'Austria', code: 'AT', dialCode: '43', flag: '🇦🇹' },
  { name: 'Switzerland', code: 'CH', dialCode: '41', flag: '🇨🇭' },
  { name: 'Ireland', code: 'IE', dialCode: '353', flag: '🇮🇪' },
  { name: 'Portugal', code: 'PT', dialCode: '351', flag: '🇵🇹' },
  // Eastern Europe
  { name: 'Russia', code: 'RU', dialCode: '7', flag: '🇷🇺' },
  { name: 'Ukraine', code: 'UA', dialCode: '380', flag: '🇺🇦' },
  { name: 'Belarus', code: 'BY', dialCode: '375', flag: '🇧🇾' },
  { name: 'Romania', code: 'RO', dialCode: '40', flag: '🇷🇴' },
  { name: 'Hungary', code: 'HU', dialCode: '36', flag: '🇭🇺' },
  { name: 'Slovakia', code: 'SK', dialCode: '421', flag: '🇸🇰' },
  { name: 'Bulgaria', code: 'BG', dialCode: '359', flag: '🇧🇬' },
  { name: 'Croatia', code: 'HR', dialCode: '385', flag: '🇭🇷' },
  { name: 'Slovenia', code: 'SI', dialCode: '386', flag: '🇸🇮' },
  { name: 'Serbia', code: 'RS', dialCode: '381', flag: '🇷🇸' },
  // Other major countries
  { name: 'United States', code: 'US', dialCode: '1', flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', dialCode: '1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '61', flag: '🇦🇺' },
  { name: 'New Zealand', code: 'NZ', dialCode: '64', flag: '🇳🇿' },
  { name: 'China', code: 'CN', dialCode: '86', flag: '🇨🇳' },
  { name: 'Japan', code: 'JP', dialCode: '81', flag: '🇯🇵' },
  { name: 'South Korea', code: 'KR', dialCode: '82', flag: '🇰🇷' },
  { name: 'India', code: 'IN', dialCode: '91', flag: '🇮🇳' },
  { name: 'Brazil', code: 'BR', dialCode: '55', flag: '🇧🇷' },
  { name: 'Mexico', code: 'MX', dialCode: '52', flag: '🇲🇽' },
  { name: 'Turkey', code: 'TR', dialCode: '90', flag: '🇹🇷' },
  { name: 'Israel', code: 'IL', dialCode: '972', flag: '🇮🇱' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '971', flag: '🇦🇪' },
  { name: 'Singapore', code: 'SG', dialCode: '65', flag: '🇸🇬' },
  { name: 'South Africa', code: 'ZA', dialCode: '27', flag: '🇿🇦' },
  // Additional European
  { name: 'Greece', code: 'GR', dialCode: '30', flag: '🇬🇷' },
  { name: 'Iceland', code: 'IS', dialCode: '354', flag: '🇮🇸' },
  { name: 'Luxembourg', code: 'LU', dialCode: '352', flag: '🇱🇺' },
  { name: 'Malta', code: 'MT', dialCode: '356', flag: '🇲🇹' },
  { name: 'Cyprus', code: 'CY', dialCode: '357', flag: '🇨🇾' },
  { name: 'Moldova', code: 'MD', dialCode: '373', flag: '🇲🇩' },
  { name: 'Albania', code: 'AL', dialCode: '355', flag: '🇦🇱' },
  { name: 'North Macedonia', code: 'MK', dialCode: '389', flag: '🇲🇰' },
  { name: 'Montenegro', code: 'ME', dialCode: '382', flag: '🇲🇪' },
  { name: 'Bosnia and Herzegovina', code: 'BA', dialCode: '387', flag: '🇧🇦' },
  { name: 'Kosovo', code: 'XK', dialCode: '383', flag: '🇽🇰' },
];

// Get default country (Latvia)
export const getDefaultCountry = (): Country => {
  return COUNTRIES.find(c => c.code === 'LV') || COUNTRIES[0];
};

interface CountryCodePickerProps {
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
  disabled?: boolean;
}

export default function CountryCodePicker({
  selectedCountry,
  onSelectCountry,
  disabled = false,
}: CountryCodePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingCountry, setPendingCountry] = useState<Country | null>(null);
  
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    
    const query = searchQuery.toLowerCase().trim();
    // Remove + if user typed it
    const numericQuery = query.replace(/^\+/, '');
    
    return COUNTRIES.filter(country => {
      // Match by country name
      if (country.name.toLowerCase().includes(query)) return true;
      // Match by country code (e.g., "LV")
      if (country.code.toLowerCase().includes(query)) return true;
      // Match by dial code (without +)
      if (country.dialCode.startsWith(numericQuery)) return true;
      // Match by dial code (with +)
      if (query.startsWith('+') && country.dialCode.startsWith(numericQuery)) return true;
      return false;
    });
  }, [searchQuery]);

  const handleOpenModal = useCallback(() => {
    if (disabled) return;
    setSearchQuery('');
    setPendingCountry(null);
    setModalVisible(true);
  }, [disabled]);

  const handleSelectCountry = useCallback((country: Country) => {
    setPendingCountry(country);
  }, []);

  const handleConfirmSelection = useCallback(() => {
    if (pendingCountry) {
      onSelectCountry(pendingCountry);
      setModalVisible(false);
      setPendingCountry(null);
      setSearchQuery('');
    }
  }, [pendingCountry, onSelectCountry]);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    setPendingCountry(null);
    setSearchQuery('');
  }, []);

  const renderCountryItem = useCallback(({ item }: { item: Country }) => {
    const isSelected = pendingCountry?.code === item.code;
    const isCurrentCountry = selectedCountry.code === item.code;
    
    return (
      <TouchableOpacity
        style={[
          localStyles.countryItem,
          { backgroundColor: themeColors.card },
          isSelected && { backgroundColor: themeColors.primaryAccent + '20' },
        ]}
        onPress={() => handleSelectCountry(item)}
        activeOpacity={0.7}
      >
        <Text style={localStyles.countryFlag}>{item.flag}</Text>
        <View style={localStyles.countryInfo}>
          <Text style={[localStyles.countryName, { color: themeColors.text }]}>
            {item.name}
          </Text>
          <Text style={[localStyles.countryCode, { color: themeColors.textSecondary }]}>
            +{item.dialCode}
          </Text>
        </View>
        {(isSelected || (!pendingCountry && isCurrentCountry)) && (
          <Icon name="check" size={24} color={themeColors.primaryAccent} />
        )}
      </TouchableOpacity>
    );
  }, [pendingCountry, selectedCountry, themeColors, handleSelectCountry]);

  const localStyles = StyleSheet.create({
    triggerButton: {
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
    triggerFlag: {
      fontSize: 20,
      marginRight: 6,
    },
    triggerCode: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text,
      marginRight: 4,
    },
    triggerArrow: {
      color: themeColors.textMuted,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      backgroundColor: themeColors.card,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: themeColors.text,
    },
    searchContainer: {
      padding: 16,
      backgroundColor: themeColors.card,
    },
    searchInput: {
      backgroundColor: themeColors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: themeColors.text,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    searchHint: {
      marginTop: 8,
      fontSize: 13,
      color: themeColors.textSecondary,
    },
    countryList: {
      flex: 1,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
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
    countryCode: {
      fontSize: 14,
      marginTop: 2,
    },
    confirmContainer: {
      padding: 16,
      backgroundColor: themeColors.card,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    selectedPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      padding: 12,
      backgroundColor: themeColors.inputBackground,
      borderRadius: 12,
    },
    selectedPreviewFlag: {
      fontSize: 32,
      marginRight: 12,
    },
    selectedPreviewText: {
      fontSize: 16,
      color: themeColors.text,
    },
    selectedPreviewCode: {
      fontSize: 18,
      fontWeight: '700',
      color: themeColors.primaryAccent,
    },
    confirmButton: {
      borderRadius: 12,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: themeColors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        style={[localStyles.triggerButton, disabled && { opacity: 0.5 }]}
        onPress={handleOpenModal}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={localStyles.triggerFlag}>{selectedCountry.flag}</Text>
        <Text style={localStyles.triggerCode}>+{selectedCountry.dialCode}</Text>
        <Icon name="arrow-drop-down" size={20} style={localStyles.triggerArrow} />
      </TouchableOpacity>

      {/* Country Picker Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={localStyles.modalContainer} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={localStyles.modalHeader}>
            <Button onPress={handleClose} textColor={themeColors.textSecondary}>
              Cancel
            </Button>
            <Text style={localStyles.modalTitle}>Select Country</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Search */}
          <View style={localStyles.searchContainer}>
            <RNTextInput
              style={localStyles.searchInput}
              placeholder="Search country or code (e.g. 371)"
              placeholderTextColor={themeColors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            <Text style={localStyles.searchHint}>
              Type country name or dial code without +
            </Text>
          </View>

          {/* Country List */}
          {filteredCountries.length > 0 ? (
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={renderCountryItem}
              style={localStyles.countryList}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
            />
          ) : (
            <View style={localStyles.emptyContainer}>
              <Text style={localStyles.emptyText}>
                No countries found for "{searchQuery}"
              </Text>
            </View>
          )}

          {/* Confirm Selection */}
          {pendingCountry && (
            <View style={localStyles.confirmContainer}>
              <View style={localStyles.selectedPreview}>
                <Text style={localStyles.selectedPreviewFlag}>{pendingCountry.flag}</Text>
                <View>
                  <Text style={localStyles.selectedPreviewText}>{pendingCountry.name}</Text>
                  <Text style={localStyles.selectedPreviewCode}>+{pendingCountry.dialCode}</Text>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={handleConfirmSelection}
                style={localStyles.confirmButton}
                contentStyle={{ paddingVertical: 6 }}
              >
                Confirm Selection
              </Button>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
}
