import React from 'react';
import { Modal, TouchableOpacity, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { CATEGORIES } from '@marketplace/shared';
import { haptic } from '../../../../../utils/haptics';
import { useTranslation } from '../../../../hooks/useTranslation';
import { DIFFICULTY_OPTIONS } from '../../constants';
import { MainTab } from '../../constants';

interface FilterModalProps {
  visible: boolean;
  mainTab: MainTab;
  selectedCategory: string;
  selectedDifficulty: string | null;
  onCategorySelect: (category: string) => void;
  onDifficultySelect: (difficulty: string | null) => void;
  onClear: () => void;
  onClose: () => void;
  styles: any;
}

export default function FilterModal({
  visible,
  mainTab,
  selectedCategory,
  selectedDifficulty,
  onCategorySelect,
  onDifficultySelect,
  onClear,
  onClose,
  styles,
}: FilterModalProps) {
  const { t } = useTranslation();
  
  const handleCategorySelect = (category: string) => {
    haptic.selection();
    onCategorySelect(category);
  };

  const handleDifficultySelect = (difficulty: string | null) => {
    haptic.selection();
    onDifficultySelect(difficulty);
  };

  const handleApply = () => {
    haptic.selection();
    onClose();
  };

  const handleClear = () => {
    haptic.light();
    onClear();
  };

  // Translate difficulty options
  const translatedDifficultyOptions = DIFFICULTY_OPTIONS.map(diff => ({
    ...diff,
    label: diff.value === null ? t.tasks.filters.all : t.tasks.filters[diff.key as 'easy' | 'medium' | 'hard']
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => { haptic.soft(); onClose(); }}
      >
        <View style={styles.filterModalContent}>
          <Text style={styles.filterModalTitle}>{t.tasks.filters.title}</Text>
          
          {/* Difficulty Segment - Only show when Jobs or All tab */}
          {(mainTab === 'jobs' || mainTab === 'all') && (
            <>
              <Text style={styles.filterSectionTitle}>{t.tasks.filters.difficultyLabel}</Text>
              <View style={styles.segmentContainer}>
                {translatedDifficultyOptions.map((diff) => (
                  <TouchableOpacity
                    key={diff.key}
                    style={[
                      styles.segmentButton,
                      selectedDifficulty === diff.value && styles.segmentButtonActive,
                      selectedDifficulty === diff.value && { backgroundColor: diff.color + '20', borderColor: diff.color }
                    ]}
                    onPress={() => handleDifficultySelect(diff.value)}
                    activeOpacity={0.7}
                  >
                    {diff.value && (
                      <View style={[styles.segmentDot, { backgroundColor: diff.color }]} />
                    )}
                    <Text style={[
                      styles.segmentText,
                      selectedDifficulty === diff.value && { color: diff.color, fontWeight: '600' }
                    ]}>
                      {diff.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          
          {/* Category Section */}
          <Text style={styles.filterSectionTitle}>{t.tasks.filters.categoryLabel}</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.categoryScrollView}>
            <View style={styles.categoryWrap}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryPill,
                    selectedCategory === cat.key && styles.categoryPillActive
                  ]}
                  onPress={() => handleCategorySelect(cat.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryPillLabel,
                    selectedCategory === cat.key && styles.categoryPillLabelActive
                  ]}>
                    {cat.label}
                  </Text>
                  {selectedCategory === cat.key && (
                    <Text style={styles.categoryPillCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.clearFiltersButton} 
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearFiltersText}>{t.tasks.filters.clearAll}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyFiltersButton} 
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={styles.applyFiltersText}>{t.tasks.filters.apply}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
