import React from 'react';
import { Modal, TouchableOpacity, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { CATEGORIES } from '@marketplace/shared';
import { haptic } from '../../../../utils/haptics';

interface CategoryModalProps {
  visible: boolean;
  selectedCategory: string;
  onSelect: (category: string) => void;
  onClose: () => void;
  styles: any;
}

export default function CategoryModal({ 
  visible, 
  selectedCategory, 
  onSelect, 
  onClose, 
  styles 
}: CategoryModalProps) {
  const handleSelect = (category: string) => {
    haptic.selection();
    onSelect(category);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => { haptic.soft(); onClose(); }}
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
                    selectedCategory === cat.key && styles.categoryPillActive
                  ]}
                  onPress={() => handleSelect(cat.key)}
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
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
