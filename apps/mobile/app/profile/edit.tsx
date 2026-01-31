import { View, ScrollView, StyleSheet, Alert, Pressable, Image } from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, TextInput, Avatar, Switch, Chip, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, useAuthStore, getImageUrl, uploadImageFromUri, FORM_CATEGORIES, normalizeSkills } from '@marketplace/shared';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  
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

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
  });

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setIsHelper(profile.is_helper || false);
      setHourlyRate(profile.hourly_rate?.toString() || '');
      
      if (profile.skills) {
        let skillsArray: string[] = [];
        if (Array.isArray(profile.skills)) {
          skillsArray = profile.skills;
        } else if (typeof profile.skills === 'string') {
          skillsArray = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
        setSkills(normalizeSkills(skillsArray));
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
        updateUser(response.user);
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      Alert.alert(t.common.success, t.profile.edit.updateSuccess, [
        { text: t.common.ok, onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      const message = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message
        || t.profile.edit.updateFailed;
      Alert.alert(t.common.error, `${t.profile.edit.updateFailed}: ${message}`);
    },
  });

  const pickImage = async () => {
    Alert.alert(
      t.profile.edit.changePhoto,
      t.profile.edit.chooseOption,
      [
        {
          text: t.profile.edit.takePhoto,
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t.profile.edit.permissionNeeded, t.profile.edit.cameraPermission);
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
          text: t.profile.edit.chooseGallery,
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(t.profile.edit.permissionNeeded, t.profile.edit.galleryPermission);
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
        { text: t.common.cancel, style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    const data: any = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      bio: bio.trim() || null,
      phone: phone.trim() || null,
      city: city.trim() || null,
      is_helper: isHelper,
    };

    data.skills = skills.join(',');

    if (isHelper) {
      data.hourly_rate = hourlyRate ? parseFloat(hourlyRate) : null;
    } else {
      data.hourly_rate = null;
    }

    if (avatarChanged && avatarUri) {
      try {
        const uploadResponse = await uploadImageFromUri(avatarUri);
        if (uploadResponse.url) {
          data.avatar_url = uploadResponse.url;
        }
      } catch (error: any) {
        console.error('Avatar upload error:', error);
        Alert.alert(t.common.error, t.profile.edit.photoUploadFailed);
      }
    }

    updateMutation.mutate(data);
  };

  const toggleSkill = (skillKey: string) => {
    if (skills.includes(skillKey)) {
      setSkills(skills.filter(s => s !== skillKey));
    } else {
      setSkills([...skills, skillKey]);
    }
  };

  const getInitials = () => {
    const first = firstName || profile?.first_name || '';
    const last = lastName || profile?.last_name || '';
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first[0].toUpperCase();
    return profile?.username?.[0]?.toUpperCase() || 'U';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
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
      backgroundColor: themeColors.card,
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 8,
    },
    avatar: {
      backgroundColor: themeColors.primaryAccent,
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
      backgroundColor: themeColors.card,
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
      color: themeColors.primaryAccent,
      fontSize: 14,
      marginBottom: 8,
    },
    username: {
      color: themeColors.textSecondary,
      fontSize: 14,
    },
    email: {
      color: themeColors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    section: {
      backgroundColor: themeColors.card,
      padding: 20,
      marginTop: 12,
    },
    sectionTitle: {
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 16,
    },
    nameRow: {
      flexDirection: 'row',
      gap: 12,
    },
    input: {
      marginBottom: 12,
      backgroundColor: themeColors.card,
    },
    halfInput: {
      flex: 1,
    },
    inputOutline: {
      borderColor: themeColors.border,
    },
    skillsDescription: {
      color: themeColors.textSecondary,
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
      backgroundColor: themeColors.primaryAccent,
    },
    skillChipTextSelected: {
      color: '#ffffff',
    },
    skillIcon: {
      fontSize: 14,
      marginRight: 2,
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
      color: themeColors.textSecondary,
      fontSize: 13,
      marginTop: -12,
    },
    helperFields: {
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    bottomSpacer: {
      height: 100,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: themeColors.card,
      padding: 16,
      paddingBottom: 32,
    },
    saveButton: {
      borderRadius: 12,
      backgroundColor: themeColors.primaryAccent,
    },
    saveButtonContent: {
      paddingVertical: 8,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen 
          options={{ 
            headerShown: true, 
            title: t.profile.edit.title, 
            headerBackTitle: t.common.back,
            headerStyle: { backgroundColor: themeColors.card },
            headerTintColor: themeColors.primaryAccent,
            headerTitleStyle: { color: themeColors.text },
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primaryAccent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: t.profile.edit.title,
          headerBackTitle: t.common.back,
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.primaryAccent,
          headerTitleStyle: { color: themeColors.text },
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.changePhotoText}>{t.profile.edit.tapToChange}</Text>
          <Text style={styles.username}>@{profile?.username}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </Surface>

        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t.profile.edit.basicInfo}</Text>
          
          <View style={styles.nameRow}>
            <TextInput
              mode="outlined"
              label={t.profile.edit.firstName}
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.input, styles.halfInput]}
              outlineStyle={styles.inputOutline}
              outlineColor={themeColors.border}
              activeOutlineColor={themeColors.primaryAccent}
              textColor={themeColors.text}
            />
            <TextInput
              mode="outlined"
              label={t.profile.edit.lastName}
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, styles.halfInput]}
              outlineStyle={styles.inputOutline}
              outlineColor={themeColors.border}
              activeOutlineColor={themeColors.primaryAccent}
              textColor={themeColors.text}
            />
          </View>

          <TextInput
            mode="outlined"
            label={t.profile.edit.bio}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            placeholder={t.profile.edit.bioPlaceholder}
            outlineColor={themeColors.border}
            activeOutlineColor={themeColors.primaryAccent}
            textColor={themeColors.text}
            placeholderTextColor={themeColors.textMuted}
          />

          <TextInput
            mode="outlined"
            label={t.profile.edit.phone}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            outlineColor={themeColors.border}
            activeOutlineColor={themeColors.primaryAccent}
            textColor={themeColors.text}
          />

          <TextInput
            mode="outlined"
            label={t.profile.edit.city}
            value={city}
            onChangeText={setCity}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            placeholder={t.profile.edit.cityPlaceholder}
            outlineColor={themeColors.border}
            activeOutlineColor={themeColors.primaryAccent}
            textColor={themeColors.text}
            placeholderTextColor={themeColors.textMuted}
          />
        </Surface>

        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t.profile.edit.yourSkills}</Text>
          <Text style={styles.skillsDescription}>
            {t.profile.edit.skillsDescription}
          </Text>
          <View style={styles.skillsContainer}>
            {FORM_CATEGORIES.map((category) => (
              <Chip
                key={category.key}
                selected={skills.includes(category.key)}
                onPress={() => toggleSkill(category.key)}
                style={[
                  styles.skillChip,
                  skills.includes(category.key) && styles.skillChipSelected
                ]}
                textStyle={skills.includes(category.key) ? styles.skillChipTextSelected : { color: themeColors.text }}
                mode={skills.includes(category.key) ? 'flat' : 'outlined'}
                icon={() => <Text style={styles.skillIcon}>{category.icon}</Text>}
              >
                {category.label}
              </Chip>
            ))}
          </View>
        </Surface>

        <Surface style={styles.section} elevation={0}>
          <View style={styles.helperHeader}>
            <View style={styles.helperTextContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>{t.profile.edit.helperMode}</Text>
              <Text style={styles.helperDescription}>
                {t.profile.edit.helperDescription}
              </Text>
            </View>
            <Switch
              value={isHelper}
              onValueChange={setIsHelper}
              color={themeColors.primaryAccent}
            />
          </View>

          {isHelper ? (
            <View style={styles.helperFields}>
              <TextInput
                mode="outlined"
                label={t.profile.edit.hourlyRate}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="decimal-pad"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                placeholder={t.profile.edit.hourlyRatePlaceholder}
                outlineColor={themeColors.border}
                activeOutlineColor={themeColors.primaryAccent}
                textColor={themeColors.text}
                placeholderTextColor={themeColors.textMuted}
              />
            </View>
          ) : null}
        </Surface>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Surface style={styles.bottomBar} elevation={4}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={updateMutation.isPending}
          disabled={updateMutation.isPending}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          buttonColor={themeColors.primaryAccent}
          textColor="#ffffff"
        >
          {t.profile.edit.saveChanges}
        </Button>
      </Surface>
    </SafeAreaView>
  );
}
