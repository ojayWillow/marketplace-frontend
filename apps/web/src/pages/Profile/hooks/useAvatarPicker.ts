import { useState, useRef } from 'react';
import { useToastStore } from '@marketplace/shared';
import { uploadImage, getImageUrl } from '@marketplace/shared/src/api/uploads';
import { generateAvatarUrl, generateRandomSeed } from '../utils/avatarHelpers';
import type { ProfileFormData } from '@marketplace/shared';

interface UseAvatarPickerProps {
  initialSeed: string;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const useAvatarPicker = ({ initialSeed, setFormData }: UseAvatarPickerProps) => {
  const toast = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState('avataaars');
  const [avatarSeed, setAvatarSeed] = useState(initialSeed);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleSelectGeneratedAvatar = () => {
    const avatarUrl = generateAvatarUrl(selectedAvatarStyle, avatarSeed);
    setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
    setShowAvatarPicker(false);
  };

  const handleRandomizeSeed = () => {
    setAvatarSeed(generateRandomSeed());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const result = await uploadImage(file);
      const imageUrl = getImageUrl(result.url);
      setFormData(prev => ({ ...prev, avatar_url: imageUrl }));
      setShowAvatarPicker(false);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    showAvatarPicker,
    setShowAvatarPicker,
    selectedAvatarStyle,
    setSelectedAvatarStyle,
    avatarSeed,
    setAvatarSeed,
    uploadingAvatar,
    fileInputRef,
    handleSelectGeneratedAvatar,
    handleRandomizeSeed,
    handleFileUpload,
    triggerFileInput,
  };
};
