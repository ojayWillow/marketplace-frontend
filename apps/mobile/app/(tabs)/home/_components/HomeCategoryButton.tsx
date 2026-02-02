import { TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HomeCategoryButtonProps {
  text: string;
  isActive: boolean;
  onPress: () => void;
  blurTint: 'light' | 'dark';
  styles: any;
}

export function HomeCategoryButton({
  text,
  isActive,
  onPress,
  blurTint,
  styles,
}: HomeCategoryButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BlurView intensity={80} tint={blurTint} style={styles.categoryBlur}>
        <Text style={styles.categoryButtonText} numberOfLines={1}>
          {text}
        </Text>
        <Icon name="expand-more" size={18} color={styles.categoryButtonText.color} />
      </BlurView>
    </TouchableOpacity>
  );
}
