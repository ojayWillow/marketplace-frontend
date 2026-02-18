import { View, ScrollView, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, Button, Surface, Avatar, Badge } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getConversations, useAuthStore, type Conversation } from '@marketplace/shared';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function MessagesScreen() {
  const { t, currentLanguage } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      return await getConversations();
    },
    enabled: isAuthenticated,
  });

  const conversations = data?.conversations || [];

  // Not logged in
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
        <LinearGradient
          colors={activeTheme === 'dark' ? ['#1e3a5f', '#0c1929'] : ['#0ea5e9', '#0284c7']}
          style={styles.gradientHeader}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t.messages.title}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.centerContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: themeColors.card }]}>
            <Text style={styles.emptyIcon}>💬</Text>
          </View>
          <Text variant="titleLarge" style={[styles.signInTitle, { color: themeColors.text }]}>
            {t.messages.signInTitle}
          </Text>
          <Text style={[styles.signInSubtitle, { color: themeColors.textSecondary }]}>
            {t.messages.signInSubtitle}
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInButton}
          >
            {t.auth.login.title}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
      <LinearGradient
        colors={activeTheme === 'dark' ? ['#1e3a5f', '#0c1929'] : ['#0ea5e9', '#0284c7']}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t.messages.title}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={[styles.scrollView, { backgroundColor: themeColors.backgroundSecondary }]}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: themeColors.backgroundSecondary }]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>
              {t.messages.loading}
            </Text>
          </View>
        )}

        {isError && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{t.messages.errorLoading}</Text>
            <Button mode="contained" onPress={() => refetch()}>
              {t.common.retry}
            </Button>
          </View>
        )}

        {!isLoading && !isError && conversations.length === 0 && (
          <View style={styles.centerContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: themeColors.card }]}>
              <Text style={styles.emptyIcon}>💬</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
              {t.messages.noConversations}
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
              {t.messages.startChat}
            </Text>
          </View>
        )}

        {!isLoading && !isError && conversations.length > 0 && (
          <View style={styles.listContainer}>
            {conversations.map((conversation: Conversation) => {
              const otherUser = conversation.other_participant;
              const lastMessage = conversation.last_message;
              const unreadCount = conversation.unread_count || 0;
              const hasUnread = unreadCount > 0;

              return (
                <Pressable
                  key={conversation.id}
                  onPress={() => router.push(`/conversation/${conversation.id}`)}
                  style={({ pressed }) => [
                    styles.conversationCard,
                    { backgroundColor: themeColors.card },
                    pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                  ]}
                >
                  <View style={styles.avatarContainer}>
                    <Avatar.Text
                      size={52}
                      label={otherUser?.username?.charAt(0).toUpperCase() || '?'}
                      style={styles.avatar}
                    />
                    <View style={[styles.onlineIndicator, styles.offlineIndicator]} />
                  </View>

                  <View style={styles.conversationContent}>
                    <View style={styles.conversationHeader}>
                      <Text 
                        variant="titleMedium" 
                        style={[
                          styles.username, 
                          { color: themeColors.text },
                          hasUnread && styles.usernameUnread,
                        ]} 
                        numberOfLines={1}
                      >
                        {otherUser?.username || t.messages.unknownUser}
                      </Text>
                      {lastMessage?.created_at && (
                        <Text style={[styles.time, { color: themeColors.textMuted }]}>
                          {formatMessageTime(lastMessage.created_at, currentLanguage)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.messageRow}>
                      <Text
                        style={[
                          styles.lastMessage,
                          { color: themeColors.textSecondary },
                          hasUnread && [styles.unreadMessage, { color: themeColors.text }],
                        ]}
                        numberOfLines={1}
                      >
                        {lastMessage?.content || t.messages.noMessages}
                      </Text>

                      {hasUnread && (
                        <Badge style={styles.badge}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function formatMessageTime(timestamp: string, lang: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    if (lang === 'lv') return 'Tikko';
    if (lang === 'ru') return 'Только что';
    return 'Just now';
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    if (lang === 'lv') return `${minutes} min`;
    if (lang === 'ru') return `${minutes} мин`;
    return `${minutes}m`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    if (lang === 'lv') return `${hours} h`;
    if (lang === 'ru') return `${hours} ч`;
    return `${hours}h`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    if (lang === 'lv') return `${days} d`;
    if (lang === 'ru') return `${days} д`;
    return `${days}d`;
  }
  
  const locale = lang === 'lv' ? 'lv-LV' : lang === 'ru' ? 'ru-RU' : 'en-US';
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientHeader: { paddingBottom: 16 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  signInTitle: { fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  signInSubtitle: { textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  signInButton: { paddingHorizontal: 24 },
  statusText: { marginTop: 12, textAlign: 'center' },
  errorText: { color: '#ef4444', marginBottom: 12, fontSize: 16 },
  listContainer: { padding: 16, gap: 12 },
  conversationCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: { position: 'relative', marginRight: 14 },
  avatar: { backgroundColor: '#0ea5e9' },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  onlineIndicatorActive: { backgroundColor: '#22c55e' },
  offlineIndicator: { backgroundColor: '#9ca3af' },
  conversationContent: { flex: 1 },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: { flex: 1, fontWeight: '500' },
  usernameUnread: { fontWeight: '700' },
  time: { fontSize: 13, marginLeft: 8 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: { flex: 1, fontSize: 14 },
  unreadMessage: { fontWeight: '600' },
  badge: { backgroundColor: '#0ea5e9', marginLeft: 8, fontSize: 11 },
});
