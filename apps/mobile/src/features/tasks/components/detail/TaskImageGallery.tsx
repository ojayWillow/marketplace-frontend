import { View, ScrollView, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { styles } from '../../styles/taskDetailStyles';

interface TaskImageGalleryProps {
  images: string[];
}

export function TaskImageGallery({ images }: TaskImageGalleryProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <View style={styles.imageCard}>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
      >
        {images.map((uri, index) => (
          <Image 
            key={index} 
            source={{ uri }} 
            style={styles.taskImage} 
            resizeMode="cover" 
          />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>{images.length} photos</Text>
        </View>
      )}
    </View>
  );
}
