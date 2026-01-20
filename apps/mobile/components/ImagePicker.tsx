import { View, Image, Pressable, StyleSheet, Alert } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import * as ExpoImagePicker from 'expo-image-picker';
import { useState } from 'react';

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export default function ImagePicker({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  label = 'Add Photos'
}: ImagePickerProps) {
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload images.'
      );
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to take photos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only add up to ${maxImages} images.`);
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxImages - images.length,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        onImagesChange([...images, ...newImages].slice(0, maxImages));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only add up to ${maxImages} images.`);
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ExpoImagePicker.launchCameraAsync({
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        onImagesChange([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const showOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>{images.length}/{maxImages} photos</Text>
      
      <View style={styles.imagesContainer}>
        {/* Existing Images */}
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />
            <IconButton
              icon="close-circle"
              size={20}
              iconColor="#ef4444"
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            />
          </View>
        ))}

        {/* Add Button */}
        {images.length < maxImages && (
          <Pressable
            onPress={showOptions}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            disabled={loading}
          >
            <Text style={styles.addIcon}>{loading ? '⏳' : '📷'}</Text>
            <Text style={styles.addText}>{loading ? 'Loading...' : 'Add'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    margin: 0,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  addButtonPressed: {
    backgroundColor: '#f3f4f6',
  },
  addIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  addText: {
    fontSize: 13,
    color: '#6b7280',
  },
});
