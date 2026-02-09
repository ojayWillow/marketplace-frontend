import { useState, useRef } from 'react';
import { useToastStore, uploadAvatarFile, useAuthStore } from '@marketplace/shared';
import { generateAvatarUrl, generateRandomSeed } from '../utils/avatarHelpers';
import type { ProfileFormData } from '@marketplace/shared';

interface UseAvatarPickerProps {
  initialSeed: string;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export const useAvatarPicker = ({ initialSeed, setFormData }: UseAvatarPickerProps) => {
  const toast = useToastStore();
  const { setUser, user } = useAuthStore();
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
      // Use uploadAvatarFile which uploads to Supabase and updates the user's avatar_url in the DB
      const avatarUrl = await uploadAvatarFile(file);
      setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
      // Also update the auth store so the avatar updates everywhere immediately
      if (user) {
        setUser({ ...user, avatar_url: avatarUrl });
      }
      setShowAvatarPicker(false);
      toast.success('Avatar uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      const message = error?.response?.data?.error || error?.response?.data?.message || 'Failed to upload avatar';
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
