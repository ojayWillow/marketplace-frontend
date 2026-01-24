import React from 'react';
import { Modal, TouchableOpacity, View, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { haptic } from '../../../../utils/haptics';
import { JOB_COLOR, RADIUS_OPTIONS, DIFFICULTY_OPTIONS } from '../../constants';

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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => { haptic.soft(); onClose(); }}
      >
        <View style={styles.filterModalContent}>
          <Text style={styles.modalTitle}>Filters</Text>
          
          <Text style={styles.filterSectionTitle}>Difficulty</Text>
          <View style={styles.segmentContainer}>
            {DIFFICULTY_OPTIONS.map((diff) => (
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
          
          <Text style={styles.filterSectionTitle}>Radius</Text>
          <FlatList
            data={RADIUS_OPTIONS}
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
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyFiltersButton} 
              onPress={() => { haptic.selection(); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.applyFiltersText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
