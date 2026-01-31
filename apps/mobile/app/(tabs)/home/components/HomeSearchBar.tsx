import { TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { JOB_COLOR } from '../../../../src/features/home/constants';
import { useLanguageStore } from '../../../../src/stores/languageStore';

interface HomeSearchBarProps {
  searchQuery: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  showLoading: boolean;
  blurTint: 'light' | 'dark';
  styles: any;
  searchInputRef: React.RefObject<TextInput>;
}

export function HomeSearchBar({
  searchQuery,
  onChangeText,
  onClear,
  showLoading,
  blurTint,
  styles,
  searchInputRef,
}: HomeSearchBarProps) {
  const { t } = useLanguageStore();
  
  return (
    <View style={styles.searchBar}>
      <BlurView intensity={80} tint={blurTint} style={styles.searchBlur}>
        <Icon name="search" size={20} color={styles.searchInput.color} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder={t('home.searchJobs')}
          placeholderTextColor={styles.searchInput.color}
          value={searchQuery}
          onChangeText={onChangeText}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="close" size={18} color={styles.searchInput.color} />
          </TouchableOpacity>
        )}
        {showLoading && <ActivityIndicator size="small" color={JOB_COLOR} />}
      </BlurView>
    </View>
  );
}
