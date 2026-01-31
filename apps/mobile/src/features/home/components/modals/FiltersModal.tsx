import React, { useMemo } from 'react';
import { Modal, TouchableOpacity, View, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { haptic } from '../../../../../utils/haptics';
import { JOB_COLOR } from '../../constants';
import { useTranslation } from '../../../../../src/hooks/useTranslation';

interface FiltersModalProps {
  visible: boolean;
  selectedRadius: number | null;
  selectedDifficulty: string | null;
  onRadiusChange: (radius: number | null) => void;
  onDifficultyChange: (difficulty: string | null) => void;
  onClear: () => void;
  onClose: () => void;
  styles: any;
}

export default function FiltersModal({ 
  visible, 
  selectedRadius, 
  selectedDifficulty, 
  onRadiusChange, 
  onDifficultyChange, 
  onClear, 
  onClose, 
  styles 
}: FiltersModalProps) {
  const { t } = useTranslation();
  
  // Translated radius options
  const radiusOptions = useMemo(() => [
    { key: 'all', label: t.home.allAreas, value: null },
    { key: '5', label: '5 km', value: 5 },
    { key: '10', label: '10 km', value: 10 },
    { key: '20', label: '20 km', value: 20 },
    { key: '50', label: '50 km', value: 50 },
  ], [t]);

  // Translated difficulty options
  const difficultyOptions = useMemo(() => [
    { key: 'all', label: t.common.all, value: null, color: '#6b7280' },
    { key: 'easy', label: t.difficulty.easy, value: 'easy', color: '#10b981' },
    { key: 'medium', label: t.difficulty.medium, value: 'medium', color: '#f59e0b' },
    { key: 'hard', label: t.difficulty.hard, value: 'hard', color: '#ef4444' },
  ], [t]);
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => { haptic.soft(); onClose(); }}
      >
        <View style={styles.filterModalContent}>
          <Text style={styles.modalTitle}>{t.common.filters}</Text>
          
          <Text style={styles.filterSectionTitle}>{t.common.difficulty}</Text>
          <View style={styles.segmentContainer}>
            {difficultyOptions.map((diff) => (
              <TouchableOpacity
                key={diff.key}
                style={[
                  styles.segmentButton,
                  selectedDifficulty === diff.value && styles.segmentButtonActive,
                  selectedDifficulty === diff.value && { backgroundColor: diff.color + '20', borderColor: diff.color }
                ]}
                onPress={() => { haptic.selection(); onDifficultyChange(diff.value); }}
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
          
          <Text style={styles.filterSectionTitle}>{t.common.radius}</Text>
          <FlatList
            data={radiusOptions}
            keyExtractor={(item) => item.key}
            scrollEnabled={false}
            renderItem={({ item: rad }) => (
              <TouchableOpacity
                style={[styles.filterOption, selectedRadius === rad.value && styles.filterOptionActive]}
                onPress={() => { haptic.selection(); onRadiusChange(rad.value); }}
                activeOpacity={0.7}
              >
                <Icon name="my-location" size={20} color={selectedRadius === rad.value ? JOB_COLOR : styles.filterOptionText.color} />
                <Text style={[styles.filterOptionText, selectedRadius === rad.value && styles.filterOptionTextActive]}>
                  {rad.label}
                </Text>
                {selectedRadius === rad.value && <Text style={styles.filterOptionCheck}>✓</Text>}
              </TouchableOpacity>
            )}
          />

          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.clearFiltersButton} 
              onPress={() => { haptic.light(); onClear(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.clearFiltersText}>{t.common.clearAll}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyFiltersButton} 
              onPress={() => { haptic.selection(); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.applyFiltersText}>{t.common.apply}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
