import React from 'react';
import { Modal, TouchableOpacity, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { CATEGORIES } from '@marketplace/shared';
import { haptic } from '../../../../../utils/haptics';
import { useTranslation } from '../../../../hooks/useTranslation';

const MAX_CATEGORIES = 5;

interface CategoryModalProps {
  visible: boolean;
  selectedCategories: string[];
  onSelect: (categories: string[]) => void;
  onClose: () => void;
  styles: any;
}

export default function CategoryModal({ 
  visible, 
  selectedCategories, 
  onSelect, 
  onClose, 
  styles 
}: CategoryModalProps) {
  const { t } = useTranslation();
  
  const handleToggleCategory = (categoryKey: string) => {
    haptic.selection();
    
    // Handle 'all' selection - clears everything
    if (categoryKey === 'all') {
      onSelect(['all']);
      return;
    }
    
    // Remove 'all' if it was selected and user picks a specific category
    let newSelection = selectedCategories.filter(c => c !== 'all');
    
    if (newSelection.includes(categoryKey)) {
      // Remove category if already selected
      newSelection = newSelection.filter(c => c !== categoryKey);
      // If nothing selected, default back to 'all'
      if (newSelection.length === 0) {
        newSelection = ['all'];
      }
    } else {
      // Add category if not at max limit
      if (newSelection.length < MAX_CATEGORIES) {
        newSelection = [...newSelection, categoryKey];
      } else {
        haptic.warning();
        return; // Don't add if at max
      }
    }
    
    onSelect(newSelection);
  };

  const handleClearAll = () => {
    haptic.light();
    onSelect(['all']);
  };

  const handleApply = () => {
    haptic.selection();
    onClose();
  };

  const isAllSelected = selectedCategories.includes('all') || selectedCategories.length === 0;
  const selectedCount = isAllSelected ? 0 : selectedCategories.length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => { haptic.soft(); onClose(); }}
      >
        <View style={styles.categoryModalContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.modalTitle}>{t.home.selectCategories}</Text>
          </View>
          
          <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>
            {selectedCount === 0 
              ? t.home.showingAllCategories 
              : `${selectedCount} ${t.home.of} ${MAX_CATEGORIES} ${t.home.selected}`}
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
            <View style={styles.categoryWrap}>
              {/* All option */}
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  isAllSelected && styles.categoryPillActive
                ]}
                onPress={() => handleToggleCategory('all')}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryPillIcon}>🌐</Text>
                <Text style={[
                  styles.categoryPillLabel,
                  isAllSelected && styles.categoryPillLabelActive
                ]}>
                  {t.common.all}
                </Text>
                {isAllSelected && (
                  <Text style={styles.categoryPillCheck}>✓</Text>
                )}
              </TouchableOpacity>
              
              {/* Category options */}
              {CATEGORIES.filter(cat => cat.key !== 'all').map((cat) => {
                const isSelected = selectedCategories.includes(cat.key);
                const isDisabled = !isSelected && selectedCount >= MAX_CATEGORIES;
                
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryPill,
                      isSelected && styles.categoryPillActive,
                      isDisabled && { opacity: 0.5 }
                    ]}
                    onPress={() => handleToggleCategory(cat.key)}
                    activeOpacity={0.7}
                    disabled={isDisabled}
                  >
                    <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
                    <Text style={[
                      styles.categoryPillLabel,
                      isSelected && styles.categoryPillLabelActive
                    ]}>
                      {cat.label}
                    </Text>
                    {isSelected && (
                      <Text style={styles.categoryPillCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.clearFiltersButton} 
              onPress={handleClearAll}
              activeOpacity={0.7}
            >
              <Text style={styles.clearFiltersText}>{t.common.clearAll}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyFiltersButton} 
              onPress={handleApply}
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
