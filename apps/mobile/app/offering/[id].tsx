import { View, ScrollView, StyleSheet, Alert, Linking, TouchableOpacity, Image, Dimensions, Share } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, IconButton, Portal, Dialog, TextInput } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOffering, contactOfferingCreator, deleteOffering, pauseOffering, activateOffering, boostOffering, useAuthStore, getCategoryByKey, getImageUrl } from '@marketplace/shared';
import { useState } from 'react';
import StarRating from '../../components/StarRating';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 200;
const ACCENT_COLOR = '#f97316';

const formatTimeAgo = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
};

const getPriceDisplay = (price: number | undefined, priceType: string | undefined): string => {
  if (!price) return 'Negotiable';
  switch (priceType) {
    case 'hourly': return `€${price}/hr`;
    case 'fixed': return `€${price}`;
    case 'negotiable': return `From €${price}`;
    default: return `€${price}`;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return '#10b981';
    case 'paused': return '#f59e0b';
    default: return '#6b7280';
  }
};

export default function OfferingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const offeringId = parseInt(id || '0', 10);
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  const { data: offering, isLoading, error } = useQuery({
    queryKey: ['offering', offeringId],
    queryFn: () => getOffering(offeringId),
    enabled: offeringId > 0,
  });

  const contactMutation = useMutation({
    mutationFn: (message: string) => contactOfferingCreator(offeringId, message),
    onSuccess: (data) => {
      setShowContactDialog(false);
      setContactMessage('');
      router.push(`/conversation/${data.conversation_id}`);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to start conversation.');
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
      Alert.alert('Error', error.response?.data?.error || 'Failed to delete.');
    },
  });

  const pauseMutation = useMutation({
    mutationFn: () => pauseOffering(offeringId),
    onSuccess: () => {
      Alert.alert('Paused', 'Your service has been paused.');
      queryClient.invalidateQueries({ queryKey: ['offering', offeringId] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed.');
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => activateOffering(offeringId),
    onSuccess: () => {
      Alert.alert('Activated', 'Your service is now active.');
      queryClient.invalidateQueries({ queryKey: ['offering', offeringId] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed.');
    },
  });

  const boostMutation = useMutation({
    mutationFn: () => boostOffering(offeringId),
    onSuccess: (data) => {
      Alert.alert('Boosted!', `Your service is boosted for ${data.boost_duration_hours} hours!`);
      queryClient.invalidateQueries({ queryKey: ['offering', offeringId] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed.');
    },
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${offering?.title} - ${getPriceDisplay(offering?.price, offering?.price_type)}\n${offering?.description}`,
      });
    } catch (e) {}
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'You need to sign in to contact.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    setContactMessage(`Hi! I'm interested in your service: ${offering?.title}`);
    setShowContactDialog(true);
  };

  const handleSendMessage = () => {
    if (contactMessage.trim()) {
      contactMutation.mutate(contactMessage.trim());
    }
  };

  const handleViewProfile = () => {
    if (offering?.creator_id) router.push(`/user/${offering.creator_id}`);
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'You need to sign in to message.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (offering?.creator_id) router.push(`/conversation/${offering.creator_id}`);
  };

  const handleDelete = () => {
    Alert.alert('Delete Service', 'Delete this service permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const handleToggleStatus = () => {
    if (offering?.status === 'active') {
      pauseMutation.mutate();
    } else {
      activateMutation.mutate();
    }
  };

  const handleBoost = () => {
    Alert.alert('Boost Service', 'Boost your service to appear at top for 24 hours?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Boost', onPress: () => boostMutation.mutate() },
    ]);
  };

  const handleOpenMap = () => {
    if (offering?.latitude && offering?.longitude) {
      Linking.openURL(`https://maps.google.com/?q=${offering.latitude},${offering.longitude}`);
    }
  };

  const handleReport = () => {
    Alert.alert('Report', 'Report this service?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thanks.') },
    ]);
  };

  const isOwnOffering = user?.id === offering?.creator_id;
  const categoryData = offering ? getCategoryByKey(offering.category) : null;
  const timeAgo = formatTimeAgo(offering?.created_at);
  const hasRating = (offering?.creator_rating ?? 0) > 0;
  const distance = offering?.distance;
  const priceDisplay = getPriceDisplay(offering?.price, offering?.price_type);
  const statusColor = getStatusColor(offering?.status || 'paused');
  
  const rating = offering?.creator_rating ?? 0;
  const completedJobs = offering?.creator_completed_tasks ?? 0;
  const completionRate = completedJobs > 0 ? 100 : 0; // Mock for now

  const offeringImages = offering?.images
    ? offering.images.split(',').filter(Boolean).map(url => getImageUrl(url))
    : [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Service Details' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !offering) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, title: 'Service Details' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Service not found</Text>
          <Button mode="contained" onPress={() => router.back()}>Go Back</Button>
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
          headerRight: () => (
            <IconButton icon="share-variant" iconColor={ACCENT_COLOR} size={24} onPress={handleShare} />
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* HERO CARD */}
        <View style={styles.heroCard}>
          {/* Category + Status */}
          <View style={styles.topRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryIcon}>{categoryData?.icon || '💼'}</Text>
              <Text style={styles.categoryText}>{categoryData?.label || offering.category}</Text>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
            <TouchableOpacity onPress={handleReport} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.flagIcon}>🚩</Text>
            </TouchableOpacity>
          </View>

          {/* Title + Badges */}
          <View style={styles.titleRow}>
            <Text style={styles.heroTitle}>{offering.title}</Text>
            <View style={styles.badgesRow}>
              {offering.is_boost_active && (
                <View style={styles.boostBadge}>
                  <Text style={styles.badgeText}>⚡ Boosted</Text>
                </View>
              )}
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Starting at</Text>
            <Text style={styles.price}>{priceDisplay}</Text>
          </View>

          {/* Stats Grid - REDESIGNED */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, styles.statBoxRating]}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statNumber}>{rating > 0 ? rating.toFixed(1) : '–'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxCompleted]}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statNumber}>{completedJobs}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxResponse]}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={styles.statNumber}>~2h</Text>
              <Text style={styles.statLabel}>Response</Text>
            </View>
          </View>

          {/* Trust Badges */}
          {!isOwnOffering && (
            <View style={styles.trustBadges}>
              <View style={styles.trustBadge}>
                <Text style={styles.trustIcon}>✓</Text>
                <Text style={styles.trustText}>ID Verified</Text>
              </View>
              {completedJobs >= 5 && (
                <View style={styles.trustBadge}>
                  <Text style={styles.trustIcon}>🏆</Text>
                  <Text style={styles.trustText}>Experienced</Text>
                </View>
              )}
              {rating >= 4.5 && (
                <View style={styles.trustBadge}>
                  <Text style={styles.trustIcon}>⭐</Text>
                  <Text style={styles.trustText}>Top Rated</Text>
                </View>
              )}
            </View>
          )}

          {/* Posted time */}
          <Text style={styles.postedTime}>Posted {timeAgo}</Text>
        </View>

        {/* IMAGES */}
        {offeringImages.length > 0 && (
          <View style={styles.imageCard}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {offeringImages.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.offeringImage} resizeMode="cover" />
              ))}
            </ScrollView>
            {offeringImages.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>{offeringImages.length} photos</Text>
              </View>
            )}
          </View>
        )}

        {/* OFFERED BY */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Service Provider</Text>
          <TouchableOpacity style={styles.userRow} onPress={handleViewProfile} activeOpacity={0.7}>
            {offering.creator_avatar ? (
              <Image source={{ uri: getImageUrl(offering.creator_avatar) }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{offering.creator_name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{offering.creator_name || 'Anonymous'}</Text>
              {hasRating && <StarRating rating={offering.creator_rating || 0} reviewCount={offering.creator_review_count} size={14} showCount />}
              {offering.creator_city && <Text style={styles.userCity}>📍 {offering.creator_city}</Text>}
            </View>
            {!isOwnOffering && (
              <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
                <Text style={styles.messageBtnText}>💬</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About This Service</Text>
          <Text style={styles.descriptionText}>{offering.description}</Text>
        </View>

        {/* LOCATION */}
        {offering.location && (
          <View style={styles.sectionCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.sectionTitle}>Service Area</Text>
              {distance !== undefined && distance !== null && (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>{distance.toFixed(1)} km away</Text>
                </View>
              )}
            </View>
            <Text style={styles.locationAddress}>{offering.location}</Text>
            {offering.service_radius && (
              <Text style={styles.serviceRadius}>📍 Available within {offering.service_radius}km radius</Text>
            )}
            {offering.latitude && offering.longitude && (
              <TouchableOpacity style={styles.mapBtn} onPress={handleOpenMap}>
                <Text style={styles.mapBtnText}>🗺️ Open in Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* STATUS NOTICE */}
        {isOwnOffering && (
          <View style={[styles.noticeCard, offering.status === 'active' ? styles.noticeSuccess : styles.noticeWarning]}>
            <Text style={styles.noticeText}>
              {offering.status === 'active' ? '✅ Your service is live and visible' : '⏸️ Your service is paused'}
            </Text>
          </View>
        )}

      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        {!isOwnOffering && (
          <Button 
            mode="contained" 
            onPress={handleContact} 
            style={styles.primaryBtn} 
            contentStyle={styles.btnContent} 
            labelStyle={styles.btnLabel}
            buttonColor={ACCENT_COLOR}
            icon="message-text"
          >
            Contact Provider
          </Button>
        )}

        {isOwnOffering && (
          <View style={styles.ownerActions}>
            <View style={styles.ownerBtnRow}>
              <Button 
                mode="outlined" 
                onPress={handleToggleStatus} 
                loading={pauseMutation.isPending || activateMutation.isPending}
                style={styles.halfBtn}
              >
                {offering.status === 'active' ? 'Pause' : 'Activate'}
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => router.push(`/offering/${offeringId}/edit`)} 
                style={styles.halfBtn}
              >
                Edit
              </Button>
            </View>
            <View style={styles.ownerBtnRow}>
              {!offering.is_boost_active && (
                <Button 
                  mode="contained" 
                  onPress={handleBoost} 
                  loading={boostMutation.isPending}
                  style={[styles.halfBtn, styles.boostBtn]}
                >
                  ⚡ Boost
                </Button>
              )}
              <Button 
                mode="outlined" 
                onPress={handleDelete} 
                loading={deleteMutation.isPending}
                textColor="#ef4444" 
                style={[styles.halfBtn, styles.dangerBtn]}
              >
                Delete
              </Button>
            </View>
          </View>
        )}
      </View>

      {/* CONTACT DIALOG */}
      <Portal>
        <Dialog visible={showContactDialog} onDismiss={() => setShowContactDialog(false)}>
          <Dialog.Title>Send Message</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogSubtitle}>Message {offering.creator_name}</Text>
            <TextInput
              mode="outlined"
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
              numberOfLines={4}
              style={styles.dialogInput}
              placeholder="Type your message..."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowContactDialog(false)}>Cancel</Button>
            <Button 
              onPress={handleSendMessage} 
              disabled={!contactMessage.trim() || contactMutation.isPending}
              loading={contactMutation.isPending}
            >
              Send
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },

  // Hero Card - REDESIGNED
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: ACCENT_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  categoryIcon: { fontSize: 16 },
  categoryText: { fontSize: 13, fontWeight: '600', color: ACCENT_COLOR },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  flagIcon: { fontSize: 18, opacity: 0.4 },

  titleRow: { marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#111827', lineHeight: 32, marginBottom: 8 },
  badgesRow: { flexDirection: 'row', gap: 8 },
  boostBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#92400e' },

  priceContainer: { marginBottom: 20 },
  priceLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  price: { fontSize: 32, fontWeight: '900', color: ACCENT_COLOR },

  // Stats Grid - COLORFUL BOXES
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statBoxRating: { backgroundColor: '#fef3c7' },
  statBoxCompleted: { backgroundColor: '#d1fae5' },
  statBoxResponse: { backgroundColor: '#dbeafe' },
  statIcon: { fontSize: 24 },
  statNumber: { fontSize: 20, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Trust Badges
  trustBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  trustIcon: { fontSize: 12, color: '#16a34a' },
  trustText: { fontSize: 11, fontWeight: '600', color: '#16a34a' },

  postedTime: { fontSize: 12, color: '#9ca3af', marginTop: 8 },

  // Images
  imageCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, position: 'relative' },
  offeringImage: { width: SCREEN_WIDTH - 32, height: IMAGE_HEIGHT },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCounterText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },

  // Section Card
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  descriptionText: { fontSize: 16, color: '#1f2937', lineHeight: 24 },

  // User Row
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#fff7ed' },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff7ed',
  },
  avatarText: { color: '#ffffff', fontSize: 22, fontWeight: '700' },
  userInfo: { flex: 1, marginLeft: 12, gap: 4 },
  userName: { fontSize: 17, fontWeight: '700', color: '#111827' },
  userCity: { fontSize: 13, color: '#6b7280' },
  messageBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ACCENT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  messageBtnText: { fontSize: 22 },

  // Location
  locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  distanceBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: { fontSize: 13, fontWeight: '600', color: ACCENT_COLOR },
  locationAddress: { fontSize: 15, color: '#1f2937', marginBottom: 8, fontWeight: '500' },
  serviceRadius: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  mapBtn: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  mapBtnText: { fontSize: 14, fontWeight: '700', color: ACCENT_COLOR },

  // Notices
  noticeCard: { borderRadius: 14, padding: 16, marginBottom: 12 },
  noticeWarning: { backgroundColor: '#fef3c7' },
  noticeSuccess: { backgroundColor: '#dcfce7' },
  noticeText: { fontSize: 14, fontWeight: '600', color: '#1f2937', textAlign: 'center' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  primaryBtn: { borderRadius: 16 },
  btnContent: { paddingVertical: 10 },
  btnLabel: { fontSize: 17, fontWeight: '700' },
  ownerActions: { gap: 10 },
  ownerBtnRow: { flexDirection: 'row', gap: 10 },
  halfBtn: { flex: 1, borderRadius: 14 },
  boostBtn: { backgroundColor: '#f59e0b' },
  dangerBtn: { borderColor: '#fecaca' },

  // Dialog
  dialogSubtitle: { color: '#6b7280', marginBottom: 16 },
  dialogInput: { minHeight: 100 },
});
