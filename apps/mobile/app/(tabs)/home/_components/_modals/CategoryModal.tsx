import React, { memo } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { CATEGORIES } from '@marketplace/shared';
import { haptic } from '../../../../../utils/haptics';
import { JOB_COLOR } from '../../constants';
import { colors } from '../../../../../src/theme';

interface CategoryModalProps {
  visible: boolean;
  selectedCategory: string;
  onSelect: (category: string) => void;
  onClose: () => void;
  themeColors: typeof colors.light;
}

const CategoryModalComponent: React.FC<CategoryModalProps> = ({
  visible,
  selectedCategory,
  onSelect,
  onClose,
  themeColors,
}) => {
  const styles = createStyles(themeColors);

  const handleSelect = (category: string) => {
    haptic.selection();
    onSelect(category);
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
        <View style={styles.categoryModalContent}>
          <Text style={styles.modalTitle}>Select Category</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.categoryWrap}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryPill,
                    selectedCategory === cat.key && styles.categoryPillActive,
                  ]}
                  onPress={() => handleSelect(cat.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryPillLabel,
                      selectedCategory === cat.key && styles.categoryPillLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                  {selectedCategory === cat.key && (
                    <Text style={styles.categoryPillCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const CategoryModal = memo(CategoryModalComponent, (prev, next) => {
  return (
    prev.visible === next.visible &&
    prev.selectedCategory === next.selectedCategory
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
  categoryModalContent: {
    backgroundColor: themeColors.card,
    borderRadius: 20,
    padding: 20,
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
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: themeColors.border,
  },
  categoryPillActive: {
    backgroundColor: '#e0f2fe',
    borderColor: JOB_COLOR,
  },
  categoryPillIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryPillLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.text,
  },
  categoryPillLabelActive: {
    color: '#0369a1',
    fontWeight: '700',
  },
  categoryPillCheck: {
    fontSize: 14,
    color: JOB_COLOR,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
