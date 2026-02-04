import { View, TouchableOpacity, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { HomeCategoryButton } from './HomeCategoryButton';
import { HomeSearchBar } from './HomeSearchBar';
import { JOB_COLOR } from '../../../../src/features/home/constants';

interface HomeFloatingControlsProps {
  getCategoryButtonText: () => string;
  hasActiveCategory: boolean;
  hasActiveFilters: boolean;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchClear: () => void;
  showSearchLoading: boolean;
  onCategoryPress: () => void;
  onFiltersPress: () => void;
  blurTint: 'light' | 'dark';
  topInset: number;
  styles: any;
  searchInputRef: React.RefObject<TextInput>;
}

export function HomeFloatingControls({
  getCategoryButtonText,
  hasActiveCategory,
  hasActiveFilters,
  searchQuery,
  onSearchChange,
  onSearchClear,
  showSearchLoading,
  onCategoryPress,
  onFiltersPress,
  blurTint,
  topInset,
  styles,
  searchInputRef,
}: HomeFloatingControlsProps) {
  return (
    <View 
      style={[
        styles.floatingHeader, 
        { paddingTop: topInset }
      ]} 
      collapsable={false}
    >
      <View style={styles.topRow}>
        <HomeCategoryButton
          text={getCategoryButtonText()}
          isActive={hasActiveCategory}
          onPress={onCategoryPress}
          blurTint={blurTint}
          styles={styles}
        />

        <HomeSearchBar
          searchQuery={searchQuery}
          onChangeText={onSearchChange}
          onClear={onSearchClear}
          showLoading={showSearchLoading}
          blurTint={blurTint}
          styles={styles}
          searchInputRef={searchInputRef}
        />

        <TouchableOpacity 
          style={styles.filtersButton}
          onPress={onFiltersPress}
          activeOpacity={0.7}
        >
          <BlurView intensity={80} tint={blurTint} style={styles.filtersBlur}>
            <Icon name="tune" size={20} color={hasActiveFilters ? JOB_COLOR : styles.categoryButtonText.color} />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  );
}
