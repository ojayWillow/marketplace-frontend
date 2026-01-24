import React, { memo } from 'react';
import { View, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { haptic } from '../../../../../utils/haptics';
import { JOB_COLOR, RADIUS_OPTIONS, DIFFICULTY_OPTIONS } from '../../constants';
import { colors } from '../../../../../src/theme';

interface FiltersModalProps {
  visible: boolean;
  selectedRadius: number | null;
  selectedDifficulty: string | null;
  onRadiusSelect: (radius: number | null) => void;
  onDifficultySelect: (difficulty: string | null) => void;
  onClear: () => void;
  onApply: () => void;
  onClose: () => void;
  themeColors: typeof colors.light;
}

const FiltersModalComponent: React.FC<FiltersModalProps> = ({
  visible,
  selectedRadius,
  selectedDifficulty,
  onRadiusSelect,
  onDifficultySelect,
  onClear,
  onApply,
  onClose,
  themeColors,
}) => {
  const styles = createStyles(themeColors);

  const handleRadiusSelect = (radius: number | null) => {
    haptic.selection();
    onRadiusSelect(radius);
  };

  const handleDifficultySelect = (difficulty: string | null) => {
    haptic.selection();
    onDifficultySelect(difficulty);
  };

  const handleClear = () => {
    haptic.light();
    onClear();
  };

  const handleApply = () => {
    haptic.selection();
    onApply();
  };

  const handleClose = () => {
    haptic.soft();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
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
                  selectedDifficulty === diff.value && {
                    backgroundColor: diff.color + '20',
                    borderColor: diff.color,
                  },
                ]}
                onPress={() => handleDifficultySelect(diff.value)}
                activeOpacity={0.7}
              >
                {diff.value && (
                  <View style={[styles.segmentDot, { backgroundColor: diff.color }]} />
                )}
                <Text
                  style={[
                    styles.segmentText,
                    selectedDifficulty === diff.value && {
                      color: diff.color,
                      fontWeight: '600',
                    },
                  ]}
                >
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
                style={[
                  styles.filterOption,
                  selectedRadius === rad.value && styles.filterOptionActive,
                ]}
                onPress={() => handleRadiusSelect(rad.value)}
                activeOpacity={0.7}
              >
                <Icon
                  name="my-location"
                  size={20}
                  color={selectedRadius === rad.value ? JOB_COLOR : themeColors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedRadius === rad.value && styles.filterOptionTextActive,
                  ]}
                >
                  {rad.label}
                </Text>
                {selectedRadius === rad.value && (
                  <Text style={styles.filterOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={styles.applyFiltersText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const FiltersModal = memo(FiltersModalComponent, (prev, next) => {
  return (
    prev.visible === next.visible &&
    prev.selectedRadius === next.selectedRadius &&
    prev.selectedDifficulty === next.selectedDifficulty
  );
});

const createStyles = (themeColors: typeof colors.light) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  filterModalContent: {
    backgroundColor: themeColors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.textSecondary,
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: themeColors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  segmentButtonActive: {
    backgroundColor: themeColors.card,
  },
  segmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: themeColors.textSecondary,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: themeColors.backgroundSecondary,
  },
  filterOptionActive: {
    backgroundColor: '#e0f2fe',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 16,
    color: themeColors.text,
    fontWeight: '500',
    marginLeft: 8,
  },
  filterOptionTextActive: {
    color: JOB_COLOR,
    fontWeight: '600',
  },
  filterOptionCheck: {
    fontSize: 18,
    color: JOB_COLOR,
    fontWeight: 'bold',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: themeColors.backgroundSecondary,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 15,
    fontWeight: '600',
    color: themeColors.textSecondary,
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: JOB_COLOR,
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
