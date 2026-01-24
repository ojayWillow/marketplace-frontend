import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { haptic } from '../../../../utils/haptics';
import { getCategoryByKey } from '@marketplace/shared';
import { DIFFICULTY_OPTIONS } from '../constants';

interface ActiveFilterBannerProps {
  selectedCategory: string;
  selectedDifficulty: string | null;
  onPress: () => void;
  onClear: () => void;
  styles: any;
}

export function ActiveFilterBanner({
  selectedCategory,
  selectedDifficulty,
  onPress,
  onClear,
  styles,
}: ActiveFilterBannerProps) {
  const selectedCategoryData = getCategoryByKey(selectedCategory);
  const selectedDifficultyData = DIFFICULTY_OPTIONS.find(d => d.value === selectedDifficulty);

  const handleClear = () => {
    haptic.soft();
    onClear();
  };

  return (
    <TouchableOpacity style={styles.activeFilterBanner} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.activeFilterContent}>
        {selectedCategoryData && selectedCategory !== 'all' && (
          <Text style={styles.activeFilterText}>
            {selectedCategoryData.icon} {selectedCategoryData.label}
          </Text>
        )}
        {selectedDifficultyData && selectedDifficulty && (
          <View style={styles.activeFilterChip}>
            <View style={[styles.difficultyDotSmall, { backgroundColor: selectedDifficultyData.color }]} />
            <Text style={styles.activeFilterText}>{selectedDifficultyData.label}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={handleClear} style={styles.clearFilterButton}>
        <Text style={styles.clearFilterText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
