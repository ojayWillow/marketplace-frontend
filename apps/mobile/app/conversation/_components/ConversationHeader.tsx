import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { router } from 'expo-router';

interface ConversationHeaderProps {
  username: string;
  userId?: number;
  userStatus: 'online' | 'offline' | null;
  statusText: string | null;
  onBack: () => void;
  themeColors: any;
}

/**
 * Conversation header with user avatar, name, and online status
 */
export function ConversationHeader({
  username,
  userId,
  userStatus,
  statusText,
  onBack,
  themeColors,
}: ConversationHeaderProps) {
  const avatarLabel = username.charAt(0).toUpperCase();

  const handleUserPress = () => {
    if (userId) {
      router.push(`/user/${userId}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
      {/* Back Button */}
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backText, { color: '#0ea5e9' }]}>‹ Back</Text>
      </Pressable>
      
      {/* Center: Avatar + Username + Status */}
      <Pressable style={styles.center} onPress={handleUserPress}>
        <View style={styles.avatarContainer}>
          <Avatar.Text size={36} label={avatarLabel} style={styles.avatar} />
          {userStatus === 'online' && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.username, { color: themeColors.text }]} numberOfLines={1}>
            {username}
          </Text>
          {statusText && (
            <Text
              style={[
                styles.status,
                { color: userStatus === 'online' ? '#22c55e' : themeColors.textMuted },
              ]}
            >
              {statusText}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Info Button */}
      <Pressable style={styles.infoButton} onPress={handleUserPress}>
        <Text style={styles.infoIcon}>ℹ️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    fontSize: 17,
    fontWeight: '400',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    backgroundColor: '#0ea5e9',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  textContainer: {
    alignItems: 'center',
  },
  username: {
    fontSize: 17,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    marginTop: 1,
  },
  infoButton: {
    padding: 4,
  },
  infoIcon: {
    fontSize: 20,
  },
});
