import { View, StyleSheet } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import type { Message } from '@marketplace/shared';
import { ChatImage } from './ChatImage';
import { formatMessageTime } from '../utils/messageFormatters';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  activeTheme: 'light' | 'dark';
  themeColors: any;
  onImagePress: (imageUrl: string) => void;
}

/**
 * Individual message bubble with text, images, and timestamp
 */
export function MessageBubble({
  message,
  isOwnMessage,
  activeTheme,
  themeColors,
  onImagePress,
}: MessageBubbleProps) {
  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      {/* Avatar for other user's messages */}
      {!isOwnMessage && (
        <Avatar.Text
          size={32}
          label={message.sender?.username?.charAt(0).toUpperCase() || '?'}
          style={[
            styles.avatar,
            {
              backgroundColor:
                activeTheme === 'dark'
                  ? themeColors.secondaryAccent
                  : '#6b7280',
            },
          ]}
        />
      )}

      {/* Message bubble */}
      <View
        style={[
          styles.bubble,
          isOwnMessage
            ? [
                styles.ownBubble,
                activeTheme === 'dark' && styles.ownBubbleDark,
              ]
            : [
                styles.otherBubble,
                {
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                },
              ],
        ]}
      >
        {/* Image attachment */}
        {message.attachment_url && message.attachment_type === 'image' && (
          <View style={styles.imageContainer}>
            <ChatImage
              uri={message.attachment_url}
              onPress={() => onImagePress(message.attachment_url!)}
              themeColors={themeColors}
            />
          </View>
        )}

        {/* Message text */}
        {message.content ? (
          <Text
            style={[
              styles.messageText,
              isOwnMessage
                ? styles.ownMessageText
                : [styles.otherMessageText, { color: themeColors.text }],
            ]}
          >
            {message.content}
          </Text>
        ) : null}

        {/* Timestamp */}
        <Text
          style={[
            styles.time,
            isOwnMessage
              ? styles.ownTime
              : [styles.otherTime, { color: themeColors.textMuted }],
          ]}
        >
          {formatMessageTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#0ea5e9',
    borderBottomRightRadius: 6,
  },
  ownBubbleDark: {
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  imageContainer: {
    marginBottom: 8,
    overflow: 'hidden',
    borderRadius: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {},
  time: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherTime: {},
});
