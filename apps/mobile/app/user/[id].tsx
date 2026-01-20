import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, Avatar, Chip, ActivityIndicator, Card } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile, getUserReviewStats, reviewsApi, useAuthStore } from '@marketplace/shared';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = parseInt(id || '0', 10);
  const { user: currentUser } = useAuthStore();
  const isOwnProfile = currentUser?.id === userId;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserProfile(userId),
    enabled: userId > 0,
  });

  const { data: reviewStats } = useQuery({
    queryKey: ['userReviewStats', userId],
    queryFn: () => getUserReviewStats(userId),
    enabled: userId > 0,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['userReviews', userId],
    queryFn: () => reviewsApi.getUserReviews(userId),
    enabled: userId > 0,
  });

  const reviews = reviewsData?.reviews || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Profile' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Profile' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>👤</Text>
          <Text variant="headlineSmall" style={styles.errorText}>User not found</Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.username;

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: displayName,
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Surface style={styles.header} elevation={0}>
          <Avatar.Text 
            size={96} 
            label={getInitials()} 
            style={styles.avatar}
          />
          
          <Text variant="headlineSmall" style={styles.name}>{displayName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          {user.is_helper ? (
            <Chip style={styles.helperBadge} textStyle={styles.helperBadgeText}>
              🛠️ Available for work
            </Chip>
          ) : null}
          
          {user.bio ? (
            <Text style={styles.bio}>{user.bio}</Text>
          ) : null}

          {user.city ? (
            <Text style={styles.location}>📍 {user.city}</Text>
          ) : null}
        </Surface>

        {/* Stats */}
        <Surface style={styles.statsSection} elevation={0}>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {reviewStats?.average_rating?.toFixed(1) || '-'}
              </Text>
              <Text style={styles.statLabel}>⭐ Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {reviewStats?.total_reviews || 0}
              </Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {user.completed_tasks_count || 0}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </Surface>

        {/* Skills */}
        {user.is_helper && user.skills && user.skills.length > 0 ? (
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {user.skills.map((skill: string) => (
                <Chip key={skill} style={styles.skillChip}>
                  {skill}
                </Chip>
              ))}
            </View>
            {user.hourly_rate ? (
              <Text style={styles.hourlyRate}>
                💰 €{user.hourly_rate}/hour
              </Text>
            ) : null}
          </Surface>
        ) : null}

        {/* Reviews */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Reviews ({reviewStats?.total_reviews || 0})
          </Text>
          
          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet</Text>
          ) : (
            reviews.slice(0, 5).map((review: any) => (
              <Card key={review.id} style={styles.reviewCard}>
                <Card.Content>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <Avatar.Text 
                        size={36} 
                        label={review.reviewer?.username?.[0]?.toUpperCase() || 'U'} 
                        style={styles.reviewerAvatar}
                      />
                      <View>
                        <Text style={styles.reviewerName}>
                          {review.reviewer?.username || 'Anonymous'}
                        </Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>⭐ {review.rating}</Text>
                    </View>
                  </View>
                  {review.content ? (
                    <Text style={styles.reviewContent}>{review.content}</Text>
                  ) : null}
                </Card.Content>
              </Card>
            ))
          )}
        </Surface>

        {/* Action Buttons */}
        {!isOwnProfile ? (
          <Surface style={styles.actionsSection} elevation={0}>
            <Button
              mode="contained"
              onPress={() => router.push(`/conversation/new?userId=${userId}`)}
              style={styles.messageButton}
              icon="message"
            >
              Send Message
            </Button>
          </Surface>
        ) : null}

        {/* Member Since */}
        <View style={styles.footer}>
          <Text style={styles.memberSince}>
            Member since {new Date(user.created_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#6b7280',
    marginBottom: 16,
  },
  backButton: {
    minWidth: 120,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#0ea5e9',
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  username: {
    color: '#6b7280',
    marginTop: 4,
  },
  helperBadge: {
    backgroundColor: '#dcfce7',
    marginTop: 12,
  },
  helperBadgeText: {
    color: '#166534',
  },
  bio: {
    color: '#4b5563',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  location: {
    color: '#6b7280',
    marginTop: 8,
  },
  statsSection: {
    backgroundColor: '#ffffff',
    marginTop: 12,
    paddingVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 4,
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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
  },
  hourlyRate: {
    marginTop: 12,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  noReviews: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  reviewCard: {
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    backgroundColor: '#6b7280',
    marginRight: 12,
  },
  reviewerName: {
    fontWeight: '500',
    color: '#1f2937',
  },
  reviewDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  ratingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#92400e',
    fontWeight: '600',
    fontSize: 13,
  },
  reviewContent: {
    color: '#4b5563',
    lineHeight: 20,
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 12,
  },
  messageButton: {
    borderRadius: 12,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  memberSince: {
    color: '#9ca3af',
    fontSize: 13,
  },
});
