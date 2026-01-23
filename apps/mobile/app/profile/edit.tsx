import { View, ScrollView, StyleSheet, Alert, Pressable, Image } from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, TextInput, Avatar, Switch, Chip, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, useAuthStore, getImageUrl } from '@marketplace/shared';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';

const SKILL_OPTIONS = [
  'Cleaning', 'Moving', 'Handyman', 'Gardening', 'Delivery',
  'Pet Care', 'Tutoring', 'Tech Support', 'Cooking', 'Driving',
  'Plumbing', 'Electrical', 'Painting', 'Assembly', 'Shopping'
];

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [isHelper, setIsHelper] = useState(false);
  const [hourlyRate, setHourlyRate] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  // Load current profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
  });

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setIsHelper(profile.is_helper || false);
      setHourlyRate(profile.hourly_rate?.toString() || '');
      
      // Handle skills - could be array or comma-separated string
      if (profile.skills) {
        if (Array.isArray(profile.skills)) {
          setSkills(profile.skills);
        } else if (typeof profile.skills === 'string') {
          setSkills(profile.skills.split(',').map(s => s.trim()).filter(Boolean));
        }
      }
      
      if (profile.avatar_url) {
        setAvatarUri(getImageUrl(profile.avatar_url));
      }
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.user) {
        setUser(response.user);
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const message = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message
        || 'Failed to update profile.';
      
      Alert.alert('Error', `Failed to update profile: ${message}`);
    },
  });

  const pickImage = async () => {
    // Ask user to choose camera or gallery
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera permission is required to take photos.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              setAvatarUri(result.assets[0].uri);
              setAvatarChanged(true);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Gallery permission is required to select photos.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              setAvatarUri(result.assets[0].uri);
              setAvatarChanged(true);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    // Build the data object
    const data: any = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      bio: bio.trim() || null,
      phone: phone.trim() || null,
      city: city.trim() || null,
      is_helper: isHelper,
    };

    // Always send skills (even if empty)
    data.skills = skills;

    if (isHelper) {
      data.hourly_rate = hourlyRate ? parseFloat(hourlyRate) : null;
    } else {
      data.hourly_rate = null;
    }

    console.log('Saving profile data:', JSON.stringify(data, null, 2));

    // If avatar changed, upload it first
    if (avatarChanged && avatarUri) {
      try {
        const formData = new FormData();
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.([\w]+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('avatar', {
          uri: avatarUri,
          name: filename,
          type,
        } as any);

        console.log('Uploading avatar...');
        const uploadResponse = await authApi.uploadAvatar(formData);
        console.log('Avatar uploaded:', uploadResponse);
        
        if (uploadResponse.avatar_url) {
          data.avatar_url = uploadResponse.avatar_url;
        }
      } catch (error: any) {
        console.error('Avatar upload error:', error);
        console.error('Avatar error response:', error.response?.data);
        Alert.alert('Error', 'Failed to upload profile photo. Profile will be saved without the new photo.');
      }
    }

    updateMutation.mutate(data);
  };

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const getInitials = () => {
    const first = firstName || profile?.first_name || '';
    const last = lastName || profile?.last_name || '';
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first[0].toUpperCase();
    return profile?.username?.[0]?.toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Edit Profile' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <Surface style={styles.avatarSection} elevation={0}>
          <Pressable onPress={pickImage} style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Avatar.Text 
                size={100} 
                label={getInitials()} 
                style={styles.avatar}
              />
            )}
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraIconText}>📷</Text>
            </View>
          </Pressable>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
          <Text style={styles.username}>@{profile?.username}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </Surface>

        {/* Basic Info */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.nameRow}>
            <TextInput
              mode="outlined"
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.input, styles.halfInput]}
              outlineStyle={styles.inputOutline}
            />
            <TextInput
              mode="outlined"
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, styles.halfInput]}
              outlineStyle={styles.inputOutline}
            />
          </View>

          <TextInput
            mode="outlined"
            label="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            placeholder="Tell others about yourself..."
          />

          <TextInput
            mode="outlined"
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            outlineStyle={styles.inputOutline}
          />

          <TextInput
            mode="outlined"
            label="City"
            value={city}
            onChangeText={setCity}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            placeholder="e.g. Riga"
          />
        </Surface>

        {/* Skills Section - Always visible */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Your Skills</Text>
          <Text style={styles.skillsDescription}>
            Select skills you can help others with
          </Text>
          <View style={styles.skillsContainer}>
            {SKILL_OPTIONS.map((skill) => (
              <Chip
                key={skill}
                selected={skills.includes(skill)}
                onPress={() => toggleSkill(skill)}
                style={[
                  styles.skillChip,
                  skills.includes(skill) && styles.skillChipSelected
                ]}
                textStyle={skills.includes(skill) ? styles.skillChipTextSelected : undefined}
                mode={skills.includes(skill) ? 'flat' : 'outlined'}
              >
                {skill}
              </Chip>
            ))}
          </View>
        </Surface>

        {/* Helper Settings */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.helperHeader}>
            <View style={styles.helperTextContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Helper Mode</Text>
              <Text style={styles.helperDescription}>
                Enable to appear as available for hire
              </Text>
            </View>
            <Switch
              value={isHelper}
              onValueChange={setIsHelper}
              color="#0ea5e9"
            />
          </View>

          {isHelper ? (
            <View style={styles.helperFields}>
              <TextInput
                mode="outlined"
                label="Hourly Rate (€)"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="decimal-pad"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                placeholder="e.g. 15"
              />
            </View>
          ) : null}
        </Surface>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Save Button */}
      <Surface style={styles.bottomBar} elevation={4}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={updateMutation.isPending}
          disabled={updateMutation.isPending}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          Save Changes
        </Button>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: '#0ea5e9',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraIconText: {
    fontSize: 16,
  },
  changePhotoText: {
    color: '#0ea5e9',
    fontSize: 14,
    marginBottom: 8,
  },
  username: {
    color: '#6b7280',
    fontSize: 14,
  },
  email: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  halfInput: {
    flex: 1,
  },
  inputOutline: {
    borderColor: '#e5e7eb',
  },
  skillsDescription: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 16,
    marginTop: -8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipSelected: {
    backgroundColor: '#0ea5e9',
  },
  skillChipTextSelected: {
    color: '#ffffff',
  },
  helperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  helperTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  helperDescription: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: -12,
  },
  helperFields: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomSpacer: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});
