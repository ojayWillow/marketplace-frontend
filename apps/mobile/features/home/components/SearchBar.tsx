import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Animated, Keyboard } from 'react-native';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const expandAnim = useRef(new Animated.Value(0)).current;

  // Auto-expand if there's a value
  useEffect(() => {
    if (value && !isExpanded) {
      setIsExpanded(true);
    }
  }, [value]);

  // Animate expansion
  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 10,
    }).start();

    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (!value) {
      setIsExpanded(false);
      Keyboard.dismiss();
    }
  };

  const handleClear = () => {
    onClear();
    setIsExpanded(false);
    Keyboard.dismiss();
  };

  // Compact bubble (when collapsed)
  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.searchBubble}
        onPress={handleExpand}
        activeOpacity={0.8}
      >
        <BlurView intensity={80} tint="light" style={styles.searchBubbleBlur}>
          <Text style={styles.searchBubbleIcon}>🔍</Text>
        </BlurView>
      </TouchableOpacity>
    );
  }

  // Expanded search bar
  return (
    <View style={styles.searchBarContainer}>
      <BlurView intensity={80} tint="light" style={styles.searchBarBlur}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Search jobs..."
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          onBlur={handleCollapse}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.searchClearButton}>
            <Text style={styles.searchClearIcon}>✕</Text>
          </TouchableOpacity>
        )}
        {!value && (
          <TouchableOpacity onPress={handleCollapse} style={styles.searchClearButton}>
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
