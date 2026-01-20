import { View, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, Chip, Avatar, ActivityIndicator, Divider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOffering, contactOfferingCreator, deleteOffering, pauseOffering, activateOffering, boostOffering, useAuthStore, type Offering } from '@marketplace/shared';

export default function OfferingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const offeringId = parseInt(id || '0', 10);
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: offering, isLoading, error } = useQuery({
    queryKey: ['offering', offeringId],
    queryFn: () => getOffering(offeringId),
    enabled: offeringId > 0,
  });

  const contactMutation = useMutation({
    mutationFn: (message: string) => contactOfferingCreator(offeringId, message),
    onSuccess: (data) => {
      router.push(`/conversation/${data.conversation_id}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to start conversation.';
      Alert.alert('Error', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteOffering(offeringId),
    onSuccess: () => {
      Alert.alert('Deleted', 'Your service has been deleted.');
      queryClient.invalidateQueries({ queryKey: ['offerings'] });
      router.back();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to delete service.';
      Alert.alert('Error', message);
    },
  });

  const pauseMutation = useMutation({
    mutationFn: () => pauseOffering(offeringId),
    onSuccess: () => {
      Alert.alert('Paused', 'Your service has been paused.');
      queryClient.invalidateQueries({ queryKey: ['offering', offeringId] });
      queryClient.invalidateQueries({ queryKey: ['offerings'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to pause service.';
      Alert.alert('Error', message);
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => activateOffering(offeringId),
    onSuccess: () => {
      Alert.alert('Activated', 'Your service is now active.');
      queryClient.invalidateQueries({ queryKey: ['offering', offeringId] });
      queryClient.invalidateQueries({ queryKey: ['offerings'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to activate service.';
      Alert.alert('Error', message);
    },
  });

  const boostMutation = useMutation({
    mutationFn: () => boostOffering(offeringId),
    onSuccess: (data) => {
      Alert.alert('Boosted!', `Your service is now boosted for ${data.boost_duration_hours} hours!`);
      queryClient.invalidateQueries({ queryKey: ['offering', offeringId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to boost service.';
      Alert.alert('Error', message);
    },
  });

  const handleContact = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in to contact service providers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    Alert.prompt(
      'Send Message',
      `Send a message to ${offering?.creator_name}`,
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
      `Hi! I'm interested in your service: ${offering?.title}`
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  const handleToggleStatus = () => {
    if (offering?.status === 'active') {
      pauseMutation.mutate();
    } else {
      activateMutation.mutate();
    }
  };

  const handleBoost = () => {
    Alert.alert(
      'Boost Service',
      'Boost your service to appear on the map for 24 hours (free trial)?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Boost', onPress: () => boostMutation.mutate() },
      ]
    );
  };

  const handleOpenMap = () => {
    if (offering?.latitude && offering?.longitude) {
      const url = `https://maps.google.com/?q=${offering.latitude},${offering.longitude}`;
      Linking.openURL(url);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriceLabel = (off: Offering) => {
    if (!off.price) return 'Price negotiable';
    switch (off.price_type) {
      case 'hourly': return `€${off.price} per hour`;
      case 'fixed': return `€${off.price} fixed price`;
      case 'negotiable': return `From €${off.price}`;
      default: return `€${off.price}`;
    }
  };

  const isOwnOffering = user?.id === offering?.creator_id;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Service Details' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !offering) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Service Details' }} />
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorText}>Service not found</Text>
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
          title: 'Service Details',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Surface style={styles.header} elevation={1}>
          <View style={styles.headerTop}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(offering.status) }]}
              textStyle={styles.statusText}
            >
              {offering.status.charAt(0).toUpperCase() + offering.status.slice(1)}
            </Chip>
            {offering.is_boost_active ? (
              <Chip style={styles.boostChip} textStyle={styles.boostText}>
                ⚡ Boosted
              </Chip>
            ) : null}
          </View>
          
          <Text variant="headlineSmall" style={styles.title}>{offering.title}</Text>
          
          <Text variant="headlineMedium" style={styles.price}>
            {getPriceLabel(offering)}
          </Text>
        </Surface>

        {/* Provider Card */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Service Provider</Text>
          <View style={styles.providerRow}>
            <Avatar.Text 
              size={56} 
              label={offering.creator_name?.charAt(0).toUpperCase() || 'U'} 
              style={styles.avatar}
            />
            <View style={styles.providerInfo}>
              <Text variant="titleLarge" style={styles.providerName}>
                {offering.creator_name || 'Unknown'}
              </Text>
              {offering.creator_rating ? (
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingStars}>
                    {'⭐'.repeat(Math.round(offering.creator_rating))}
                  </Text>
                  <Text style={styles.ratingText}>
                    {offering.creator_rating.toFixed(1)} ({offering.creator_review_count || 0} reviews)
                  </Text>
                </View>
              ) : (
                <Text style={styles.noRating}>No reviews yet</Text>
              )}
              {offering.creator_completed_tasks ? (
                <Text style={styles.completedTasks}>
                  ✅ {offering.creator_completed_tasks} tasks completed
                </Text>
              ) : null}
              {isOwnOffering ? (
                <Chip style={styles.ownBadge} textStyle={styles.ownBadgeText}>
                  <Text style={styles.ownBadgeText}>Your service</Text>
                </Chip>
              ) : null}
            </View>
          </View>
        </Surface>

        {/* Description */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{offering.description}</Text>
        </Surface>

        {/* Location */}
        {offering.location ? (
          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Service Area</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location}>{offering.location}</Text>
            </View>
            {offering.service_radius ? (
              <Text style={styles.serviceRadius}>
                Available within {offering.service_radius}km radius
              </Text>
            ) : null}
            {offering.latitude && offering.longitude ? (
              <Button 
                mode="outlined" 
                onPress={handleOpenMap}
                style={styles.mapButton}
                icon="map"
              >
                View on Map
              </Button>
            ) : null}
          </Surface>
        ) : null}

        {/* Details */}
        <Surface style={styles.section} elevation={0}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Chip style={styles.categoryChip}>
                <Text>{offering.category}</Text>
              </Chip>
            </View>
            {offering.experience ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Experience</Text>
                <Text style={styles.detailValue}>{offering.experience}</Text>
              </View>
            ) : null}
            {offering.availability ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Availability</Text>
                <Text style={styles.detailValue}>{offering.availability}</Text>
              </View>
            ) : null}
            {offering.created_at ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Listed</Text>
                <Text style={styles.detailValue}>
                  {new Date(offering.created_at).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
          </View>
        </Surface>

        {/* Spacer for bottom button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Contact Button (not own offering) */}
      {!isOwnOffering ? (
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
            Contact Provider
          </Button>
        </Surface>
      ) : null}

      {/* Own Offering Actions */}
      {isOwnOffering ? (
        <Surface style={styles.bottomBar} elevation={4}>
          <View style={styles.ownerActions}>
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleToggleStatus}
                loading={pauseMutation.isPending || activateMutation.isPending}
                style={styles.actionButton}
              >
                {offering.status === 'active' ? 'Pause' : 'Activate'}
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push(`/offering/${offeringId}/edit`)}
                style={styles.actionButton}
              >
                Edit
              </Button>
            </View>
            <View style={styles.buttonRow}>
              {!offering.is_boost_active ? (
                <Button
                  mode="contained"
                  onPress={handleBoost}
                  loading={boostMutation.isPending}
                  style={[styles.actionButton, styles.boostButton]}
                  icon="lightning-bolt"
                >
                  Boost
                </Button>
              ) : null}
              <Button
                mode="outlined"
                onPress={handleDelete}
                loading={deleteMutation.isPending}
                textColor="#ef4444"
                style={[styles.actionButton, styles.deleteButton]}
              >
                Delete
              </Button>
            </View>
          </View>
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
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusChip: {
    height: 28,
    marginRight: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  boostChip: {
    backgroundColor: '#fef3c7',
    height: 28,
  },
  boostText: {
    color: '#92400e',
    fontSize: 12,
  },
  title: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  price: {
    color: '#f97316',
    fontWeight: 'bold',
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
  providerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    backgroundColor: '#f97316',
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingStars: {
    marginRight: 8,
  },
  ratingText: {
    color: '#6b7280',
    fontSize: 13,
  },
  noRating: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 4,
  },
  completedTasks: {
    color: '#059669',
    fontSize: 13,
  },
  ownBadge: {
    backgroundColor: '#dbeafe',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  ownBadgeText: {
    color: '#1d4ed8',
    fontSize: 11,
  },
  description: {
    color: '#4b5563',
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  location: {
    color: '#4b5563',
    flex: 1,
  },
  serviceRadius: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 8,
  },
  mapButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#6b7280',
  },
  detailValue: {
    color: '#1f2937',
    fontWeight: '500',
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
  },
  bottomSpacer: {
    height: 120,
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
    backgroundColor: '#f97316',
  },
  contactButtonContent: {
    paddingVertical: 8,
  },
  ownerActions: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  boostButton: {
    backgroundColor: '#f59e0b',
  },
  deleteButton: {
    borderColor: '#fecaca',
  },
});
