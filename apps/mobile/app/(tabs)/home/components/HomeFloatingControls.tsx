import { View, TouchableOpacity, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { HomeSearchBar } from './HomeSearchBar';

interface HomeFloatingControlsProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchClear: () => void;
  showSearchLoading: boolean;
  blurTint: 'light' | 'dark';
  topInset: number;
  styles: any;
  searchInputRef: React.RefObject<TextInput>;
}

export function HomeFloatingControls({
  searchQuery,
  onSearchChange,
  onSearchClear,
  showSearchLoading,
  blurTint,
  topInset,
  styles,
  searchInputRef,
}: HomeFloatingControlsProps) {
  return (
    <View 
      style={[
        styles.floatingHeader, 
        { paddingTop: topInset + 8 }
      ]} 
      collapsable={false}
    >
      {/* Just search bar centered */}
      <View style={styles.topRow}>
        <HomeSearchBar
          searchQuery={searchQuery}
          onChangeText={onSearchChange}
          onClear={onSearchClear}
          showLoading={showSearchLoading}
          blurTint={blurTint}
          styles={styles}
          searchInputRef={searchInputRef}
        />
      </View>
    </View>
  );
}
