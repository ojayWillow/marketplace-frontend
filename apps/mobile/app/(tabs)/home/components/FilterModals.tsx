import React from 'react';
import { View, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { haptic } from '../../../../utils/haptics';
import { CATEGORIES, RADIUS_OPTIONS } from '../utils/constants';
import { styles } from '../styles';

interface CategoryModalProps {
  visible: boolean;
  selectedCategory: string;
  onSelect: (category: string) => void;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  selectedCategory,
  onSelect,
  onClose,
}) => {
  const handleClose = () => {
    haptic.soft();
    onClose();
  };

  const handleSelect = (category: string) => {
    haptic.selection();
    onSelect(category);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
        <View style={styles.filterModalContent}>
          <Text style={styles.modalTitle}>Select Category</Text>
          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.key}
            renderItem={({ item: cat }) => (
              <TouchableOpacity
                style={[styles.filterOption, selectedCategory === cat.key && styles.filterOptionActive]}
                onPress={() => handleSelect(cat.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.filterOptionIcon}>{cat.icon}</Text>
                <Text style={[styles.filterOptionText, selectedCategory === cat.key && styles.filterOptionTextActive]}>
                  {cat.label}
                </Text>
                {selectedCategory === cat.key && <Text style={styles.filterOptionCheck}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

interface RadiusModalProps {
  visible: boolean;
  selectedRadius: number | null;
  onSelect: (radius: number | null) => void;
  onClose: () => void;
}

export const RadiusModal: React.FC<RadiusModalProps> = ({
  visible,
  selectedRadius,
  onSelect,
  onClose,
}) => {
  const handleClose = () => {
    haptic.soft();
    onClose();
  };

  const handleSelect = (radius: number | null) => {
    haptic.selection();
    onSelect(radius);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
        <View style={styles.filterModalContent}>
          <Text style={styles.modalTitle}>Select Radius</Text>
          <FlatList
            data={RADIUS_OPTIONS}
            keyExtractor={(item) => item.key}
            renderItem={({ item: rad }) => (
              <TouchableOpacity
                style={[styles.filterOption, selectedRadius === rad.value && styles.filterOptionActive]}
                onPress={() => handleSelect(rad.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.filterOptionIcon}>📍</Text>
                <Text style={[styles.filterOptionText, selectedRadius === rad.value && styles.filterOptionTextActive]}>
                  {rad.label}
                </Text>
                {selectedRadius === rad.value && <Text style={styles.filterOptionCheck}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
