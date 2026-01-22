import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { styles } from '../styles';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  isLoading = false,
}) => {
  return (
    <View style={styles.searchBarContainer}>
      <BlurView intensity={80} tint="light" style={styles.searchBarBlur}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.searchClearButton}>
            <Text style={styles.searchClearIcon}>✕</Text>
          </TouchableOpacity>
        )}
        {isLoading && (
          <ActivityIndicator size="small" color="#0ea5e9" style={styles.searchLoader} />
        )}
      </BlurView>
    </View>
  );
};
