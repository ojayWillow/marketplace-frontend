import { Modal, View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useCategories } from '../../../../hooks/useCategories';
import { JOB_COLOR } from '../../constants';

interface UnifiedFiltersModalProps {
  visible: boolean;
  selectedCategories: string[];
  selectedRadius: number | null;
  selectedDifficulty: string | null;
  onCategoriesChange: (categories: string[]) => void;
  onRadiusChange: (radius: number | null) => void;
  onDifficultyChange: (difficulty: string | null) => void;
  onClear: () => void;
  onClose: () => void;
  styles: any;
}

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km', icon: 'location-on' },
  { value: 10, label: '10 km', icon: 'location-on' },
  { value: 25, label: '25 km', icon: 'location-on' },
  { value: 50, label: '50 km', icon: 'location-on' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', icon: '⚡' },
  { value: 'medium', icon: '🔧' },
  { value: 'hard', icon: '🔥' },
];

export default function UnifiedFiltersModal({
  visible,
  selectedCategories,
  selectedRadius,
  selectedDifficulty,
  onCategoriesChange,
  onRadiusChange,
  onDifficultyChange,
  onClear,
  onClose,
  styles,
}: UnifiedFiltersModalProps) {
  const { t } = useTranslation();
  const { taskCategories, getCategoryLabel, getCategoryIcon } = useCategories();

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedRadius !== null || selectedDifficulty !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView 
            style={styles.filterModalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.modalTitle}>{t.home.filters}</Text>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Icon name="close" size={24} color={styles.categoryButtonText.color} />
              </TouchableOpacity>
            </View>

            {/* Categories Section */}
            <Text style={styles.filterSectionTitle}>{t.home.categories}</Text>
            <View style={styles.categoryWrap}>
              {(taskCategories || []).map((category) => {
                const isActive = selectedCategories.includes(category);
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryPill,
                      isActive && styles.categoryPillActive,
                    ]}
                    onPress={() => toggleCategory(category)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryPillIcon}>
                      {getCategoryIcon(category)}
                    </Text>
                    <Text
                      style={[
                        styles.categoryPillLabel,
                        isActive && styles.categoryPillLabelActive,
                      ]}
                    >
                      {getCategoryLabel(category)}
                    </Text>
                    {isActive && (
                      <Text style={styles.categoryPillCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Radius Section */}
            <Text style={styles.filterSectionTitle}>{t.home.radius || 'Distance'}</Text>
            <View style={styles.segmentContainer}>
              {RADIUS_OPTIONS.map((option) => {
                const isActive = selectedRadius === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.segmentButton,
                      isActive && styles.segmentButtonActive,
                      isActive && { borderColor: JOB_COLOR },
                    ]}
                    onPress={() => onRadiusChange(isActive ? null : option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.segmentDot, { backgroundColor: isActive ? JOB_COLOR : styles.segmentText.color }]} />
                    <Text style={[styles.segmentText, isActive && { color: JOB_COLOR, fontWeight: '600' }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Difficulty Section */}
            <Text style={styles.filterSectionTitle}>{t.home.difficulty || 'Difficulty'}</Text>
            {DIFFICULTY_OPTIONS.map((option) => {
              const isActive = selectedDifficulty === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    isActive && styles.filterOptionActive,
                  ]}
                  onPress={() => onDifficultyChange(isActive ? null : option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.filterOptionIcon}>{option.icon}</Text>
                  <View
                    style={[
                      styles.segmentDot,
                      { backgroundColor: getDifficultyColor(option.value) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      isActive && styles.filterOptionTextActive,
                    ]}
                  >
                    {t.home[option.value] || option.value.charAt(0).toUpperCase() + option.value.slice(1)}
                  </Text>
                  {isActive && (
                    <Text style={styles.filterOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              {hasActiveFilters && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={onClear}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearFiltersText}>{t.home.clearAll || 'Clear All'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.applyFiltersButton, !hasActiveFilters && { flex: 1 }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.applyFiltersText}>{t.home.apply || 'Apply'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
