import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, Avatar, ActivityIndicator, Card, Divider } from 'react-native-paper';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPublicUser, getUserReviews, getOfferingsByUser, useAuthStore, type PublicUser, type UserReview } from '@marketplace/shared';
import { startConversation } from '@marketplace/shared';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = parseInt(id || '0', 10);
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['publicUser', userId],
    queryFn: () => getPublicUser(userId),
    enabled: userId > 0,
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['userReviews', userId],
    queryFn: () => getUserReviews(userId),
    enabled: userId > 0,
  });

  const { data: offeringsData } = useQuery({
    queryKey: ['userOfferings', userId],
    queryFn: () => getOfferingsByUser(userId),
    enabled: userId > 0,
  });

  const contactMutation = useMutation({
    mutationFn: (message: string) => startConversation(userId, message),
    onSuccess: (data) => {
      router.push(`/conversation/${data.conversation_id}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to start conversation.';
      Alert.alert('Error', message);
    },
  });

  const handleContact = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to send messages.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    Alert.prompt(
      'Send Message',
      `Send a message to ${user?.username || 'this user'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: (message) => {
            if (message && message.trim()) {
              contactMutation.mutate(message.trim());
            }
          }
        },
      ],
      'plain-text',
      'Hi! I would like to connect with you.'
    );
  };

  const isOwnProfile = currentUser?.id === userId;
  const reviews = reviewsData?.reviews || [];
  const offerings = offeringsData?.offerings || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Profile' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (userError || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Profile' }} />
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorText}>User not found</Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: user.username || 'Profile',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Surface style={styles.header} elevation={1}>
          <Avatar.Text 
            size={80} 
            label={user.username?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          
          <Text variant="headlineSmall" style={styles.username}>
            {user.username}
          </Text>
          
          {user.first_name || user.last_name ? (
            <Text style={styles.fullName}>
              {[user.first_name, user.last_name].filter(Boolean).join(' ')}
            </Text>
          ) : null}
          
          {user.city || user.country ? (
            <Text style={styles.location}>
              📍 {[user.city, user.country].filter(Boolean).join(', ')}
            </Text>
          ) : null}

          {user.is_verified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✅ Verified</Text>
            </View>
          ) : null}

          <Text style={styles.memberSince}>
            Member since {formatDate(user.created_at)}
          </Text>
        </Surface>

        {/* Stats */}
        <Surface style={styles.statsContainer} elevation={0}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user.average_rating ? user.average_rating.toFixed(1) : '-'}
              </Text>
              <Text style={styles.statLabel}>⭐ Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.reviews_count || 0}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.completion_rate || 0}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </Surface>

        {/* Bio */}
        {user.bio ? (
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{user.bio}</Text>
          </Surface>
        ) : null}

        {/* Services/Offerings */}
        {offerings.length > 0 ? (
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Services ({offerings.length})
            </Text>
            {offerings.slice(0, 3).map((offering) => (
              <Card 
                key={offering.id} 
                style={styles.offeringCard}
                onPress={() => router.push(`/offering/${offering.id}`)}
              >
                <Card.Content style={styles.offeringContent}>
                  <View style={styles.offeringInfo}>
                    <Text variant="titleSmall" numberOfLines={1}>{offering.title}</Text>
                    <Text style={styles.offeringCategory}>{offering.category}</Text>
                  </View>
                  <Text style={styles.offeringPrice}>
                    {offering.price ? `€${offering.price}` : 'Negotiable'}
                    {offering.price_type === 'hourly' ? '/hr' : ''}
                  </Text>
                </Card.Content>
              </Card>
            ))}
            {offerings.length > 3 ? (
              <Button mode="text" onPress={() => {}}>
                View all {offerings.length} services
              </Button>
            ) : null}
          </Surface>
        ) : null}

        {/* Reviews */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Reviews ({reviews.length})
          </Text>
          
          {reviewsLoading ? (
            <ActivityIndicator size="small" />
          ) : reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet</Text>
          ) : (
            reviews.slice(0, 5).map((review: UserReview) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Avatar.Text 
                    size={36} 
                    label={review.reviewer_name?.charAt(0).toUpperCase() || 'U'}
                    style={styles.reviewerAvatar}
                  />
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                    <View style={styles.reviewRating}>
                      <Text style={styles.stars}>
                        {'⭐'.repeat(Math.round(review.rating))}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {formatDate(review.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewContent}>{review.content}</Text>
                {reviews.indexOf(review) < reviews.length - 1 ? (
                  <Divider style={styles.reviewDivider} />
                ) : null}
              </View>
            ))
          )}
        </Surface>

        {/* Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Contact Button (not own profile) */}
      {!isOwnProfile ? (
        <Surface style={styles.bottomBar} elevation={4}>
          <Button
            mode="contained"
            onPress={handleContact}
            loading={contactMutation.isPending}
            disabled={contactMutation.isPending}
            style={styles.contactButton}
            contentStyle={styles.contactButtonContent}
            icon="message"
          >
            Send Message
          </Button>
        </Surface>
      ) : null}
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
  errorText: {
    color: '#6b7280',
    marginBottom: 16,
  },
  backButton: {
    minWidth: 120,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#0ea5e9',
    marginBottom: 16,
  },
  username: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  fullName: {
    color: '#6b7280',
    marginBottom: 4,
  },
  location: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  verifiedText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '500',
  },
  memberSince: {
    color: '#9ca3af',
    fontSize: 13,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    marginTop: 12,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
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
  bioText: {
    color: '#4b5563',
    lineHeight: 22,
  },
  offeringCard: {
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  offeringContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offeringInfo: {
    flex: 1,
  },
  offeringCategory: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  offeringPrice: {
    color: '#f97316',
    fontWeight: 'bold',
  },
  noReviews: {
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 24,
  },
  reviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewerAvatar: {
    backgroundColor: '#6b7280',
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontWeight: '600',
    color: '#1f2937',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  stars: {
    marginRight: 8,
  },
  reviewDate: {
    color: '#9ca3af',
    fontSize: 12,
  },
  reviewContent: {
    color: '#4b5563',
    lineHeight: 20,
  },
  reviewDivider: {
    marginTop: 16,
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
  contactButton: {
    borderRadius: 12,
  },
  contactButtonContent: {
    paddingVertical: 8,
  },
});
