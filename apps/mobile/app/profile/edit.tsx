import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, TextInput, Avatar, Switch, Chip, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, useAuthStore } from '@marketplace/shared';
import { useState, useEffect } from 'react';

const SKILL_OPTIONS = [
  'Cleaning', 'Moving', 'Handyman', 'Gardening', 'Delivery',
  'Pet Care', 'Tutoring', 'Tech Support', 'Cooking', 'Driving'
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
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (response) => {
      // Update local user state
      if (response.user) {
        setUser(response.user);
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to update profile.';
      Alert.alert('Error', message);
    },
  });

  const handleSave = () => {
    const data: any = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      bio: bio.trim(),
      phone: phone.trim(),
      city: city.trim(),
      is_helper: isHelper,
    };

    if (isHelper) {
      data.hourly_rate = hourlyRate ? parseFloat(hourlyRate) : null;
      data.skills = skills;
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
          <Avatar.Text 
            size={80} 
            label={getInitials()} 
            style={styles.avatar}
          />
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
          />
        </Surface>

        {/* Helper Settings */}
        <Surface style={styles.section} elevation={0}>
          <View style={styles.helperHeader}>
            <View style={styles.helperTextContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Helper Mode</Text>
              <Text style={styles.helperDescription}>
                Enable to appear as available for jobs
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

              <Text style={styles.skillsLabel}>Your Skills</Text>
              <View style={styles.skillsContainer}>
                {SKILL_OPTIONS.map((skill) => (
                  <Chip
                    key={skill}
                    selected={skills.includes(skill)}
                    onPress={() => toggleSkill(skill)}
                    style={styles.skillChip}
                    mode={skills.includes(skill) ? 'flat' : 'outlined'}
                  >
                    {skill}
                  </Chip>
                ))}
              </View>
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
  avatar: {
    backgroundColor: '#0ea5e9',
    marginBottom: 12,
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
  skillsLabel: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 8,
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
