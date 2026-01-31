import { View, StyleSheet } from 'react-native';
import { Avatar, Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { colors } from '../../../../src/theme';
import { useTranslation } from '../../../../src/hooks/useTranslation';

interface ProfileAvatarProps {
  displayName: string;
  username: string;
  city?: string;
  bio?: string;
  profilePictureUrl: string | null;
  themeColors: typeof colors.light;
}

export function ProfileAvatar({ 
  displayName, 
  username, 
  city, 
  bio, 
  profilePictureUrl,
  themeColors 
}: ProfileAvatarProps) {
  const { t } = useTranslation();
  
  return (
    <>
      {/* Avatar - overlapping gradient */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarContainer}>
          {profilePictureUrl ? (
            <Avatar.Image
              size={100}
              source={{ uri: profilePictureUrl }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={100}
              label={displayName.charAt(0).toUpperCase()}
              style={styles.avatar}
            />
          )}
        </View>
      </View>

      {/* Name & Location */}
      <View style={styles.nameSection}>
        <Text variant="headlineSmall" style={[styles.name, { color: themeColors.text }]}>
          {displayName}
        </Text>
        <Text style={[styles.username, { color: themeColors.textSecondary }]}>
          @{username} {city && `· 📍 ${city}`}
        </Text>
        {bio && (
          <Text style={[styles.bio, { color: themeColors.textSecondary }]} numberOfLines={2}>
            {bio}
          </Text>
        )}
      </View>

      {/* Edit Profile Button */}
      <View style={styles.editProfileContainer}>
        <Button
          mode="outlined"
          onPress={() => router.push('/profile/edit')}
          style={styles.editProfileButton}
          labelStyle={styles.editProfileButtonLabel}
          contentStyle={styles.editProfileButtonContent}
          icon="account-edit"
        >
          {t.profile.editProfile}
        </Button>
      </View>

      {/* TEST ONBOARDING BUTTON */}
      <View style={styles.editProfileContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/onboarding/welcome')}
          style={styles.testButton}
          labelStyle={styles.testButtonLabel}
          contentStyle={styles.editProfileButtonContent}
          icon="rocket-launch"
        >
          🚀 Test Onboarding
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    backgroundColor: '#0ea5e9',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nameSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  name: {
    fontWeight: 'bold',
  },
  username: {
    marginTop: 4,
    fontSize: 14,
  },
  bio: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  editProfileContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  editProfileButton: {
    borderColor: '#0ea5e9',
    borderRadius: 10,
  },
  editProfileButtonLabel: {
    color: '#0ea5e9',
    fontSize: 15,
    fontWeight: '600',
  },
  editProfileButtonContent: {
    paddingVertical: 4,
  },
  testButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    marginTop: 8,
  },
  testButtonLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
