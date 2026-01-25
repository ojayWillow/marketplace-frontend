import { View, ScrollView, StyleSheet, Alert, Linking, TouchableOpacity, Image, Dimensions, Share } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, ActivityIndicator, IconButton, Portal, Dialog, TextInput } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOffering, contactOfferingCreator, deleteOffering, pauseOffering, activateOffering, boostOffering, useAuthStore, getCategoryByKey, getImageUrl } from '@marketplace/shared';
import { useState } from 'react';
import StarRating from '../../components/StarRating';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 180;
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
        
        {/* COMPACT HERO CARD */}
        <View style={styles.heroCard}>
          {/* Row 1: Category + Price */}
          <View style={styles.topRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{categoryData?.icon} {categoryData?.label || offering.category}</Text>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
            <Text style={styles.price}>{priceDisplay}</Text>
          </View>

          {/* Row 2: Title */}
          <Text style={styles.heroTitle}>{offering.title}</Text>

          {/* Row 3: Compact Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {rating > 0 ? rating.toFixed(1) : '–'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>✓ {completedJobs} done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⚡ ~2h reply</Text>
            </View>
          </View>

          {/* Row 4: Provider inline */}
          <TouchableOpacity style={styles.providerRow} onPress={handleViewProfile} activeOpacity={0.7}>
            {offering.creator_avatar ? (
              <Image source={{ uri: getImageUrl(offering.creator_avatar) }} style={styles.avatarSmall} />
            ) : (
              <View style={styles.avatarSmallPlaceholder}>
                <Text style={styles.avatarSmallText}>{offering.creator_name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            )}
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{offering.creator_name}</Text>
              {hasRating && <StarRating rating={rating} reviewCount={offering.creator_review_count} size={12} showCount />}
            </View>
            {!isOwnOffering && (
              <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
                <Text style={styles.messageBtnText}>💬</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Posted + Report */}
          <View style={styles.footerRow}>
            <Text style={styles.postedTime}>Posted {timeAgo}</Text>
            <TouchableOpacity onPress={handleReport} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.reportText}>🚩 Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* IMAGES (if any) */}
        {offeringImages.length > 0 && (
          <View style={styles.imageCard}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {offeringImages.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.offeringImage} resizeMode="cover" />
              ))}
            </ScrollView>
          </View>
        )}

        {/* DESCRIPTION (collapsible feel) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{offering.description}</Text>
        </View>

        {/* LOCATION */}
        {offering.location && (
          <View style={styles.sectionCard}>
            <View style={styles.locationRow}>
              <View style={styles.locationInfo}>
                <Text style={styles.sectionTitle}>Service Area</Text>
                <Text style={styles.locationText}>{offering.location}</Text>
                {offering.service_radius && (
                  <Text style={styles.radiusText}>📍 {offering.service_radius}km radius</Text>
                )}
              </View>
              {distance !== undefined && distance !== null && (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>{distance.toFixed(1)}km</Text>
                </View>
              )}
            </View>
            {offering.latitude && offering.longitude && (
              <TouchableOpacity style={styles.mapBtn} onPress={handleOpenMap}>
                <Text style={styles.mapBtnText}>🗺️ Map</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* OWNER NOTICE */}
        {isOwnOffering && (
          <View style={[styles.noticeCard, offering.status === 'active' ? styles.noticeSuccess : styles.noticeWarning]}>
            <Text style={styles.noticeText}>
              {offering.status === 'active' ? '✅ Live' : '⏸️ Paused'}
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
          >
            Contact Provider
          </Button>
        )}

        {isOwnOffering && (
          <View style={styles.ownerActions}>
            <Button mode="outlined" onPress={handleToggleStatus} style={styles.ownerBtn} compact>
              {offering.status === 'active' ? 'Pause' : 'Activate'}
            </Button>
            <Button mode="outlined" onPress={() => router.push(`/offering/${offeringId}/edit`)} style={styles.ownerBtn} compact>
              Edit
            </Button>
            {!offering.is_boost_active && (
              <Button mode="contained" onPress={handleBoost} style={styles.ownerBtn} buttonColor="#f59e0b" compact>
                ⚡
              </Button>
            )}
            <Button mode="outlined" onPress={handleDelete} textColor="#ef4444" style={styles.ownerBtn} compact>
              🗑️
            </Button>
          </View>
        )}
      </View>

      {/* CONTACT DIALOG */}
      <Portal>
        <Dialog visible={showContactDialog} onDismiss={() => setShowContactDialog(false)}>
          <Dialog.Title>Message</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
              placeholder="Your message..."
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 100 },

  // HERO CARD - COMPACT
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: ACCENT_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  price: { fontSize: 22, fontWeight: '800', color: ACCENT_COLOR },

  heroTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 12 },

  // Stats Row - SIMPLE
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 13, fontWeight: '600', color: '#374151' },
  statDivider: { width: 1, height: 16, backgroundColor: '#e5e7eb' },

  // Provider Row - INLINE
  providerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20 },
  avatarSmallPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: ACCENT_COLOR, justifyContent: 'center', alignItems: 'center' },
  avatarSmallText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  providerInfo: { flex: 1, marginLeft: 10, gap: 2 },
  providerName: { fontSize: 15, fontWeight: '600', color: '#111' },
  messageBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: ACCENT_COLOR, justifyContent: 'center', alignItems: 'center' },
  messageBtnText: { fontSize: 16 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postedTime: { fontSize: 12, color: '#9ca3af' },
  reportText: { fontSize: 12, color: '#9ca3af' },

  // Images
  imageCard: { borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  offeringImage: { width: SCREEN_WIDTH - 24, height: IMAGE_HEIGHT },

  // Section Card - COMPACT
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  descriptionText: { fontSize: 15, color: '#374151', lineHeight: 22 },

  // Location
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  locationInfo: { flex: 1 },
  locationText: { fontSize: 14, color: '#374151', marginBottom: 4 },
  radiusText: { fontSize: 12, color: '#6b7280' },
  distanceBadge: { backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  distanceText: { fontSize: 12, fontWeight: '700', color: ACCENT_COLOR },
  mapBtn: { backgroundColor: '#fff7ed', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
  mapBtnText: { fontSize: 13, fontWeight: '600', color: ACCENT_COLOR },

  // Notice
  noticeCard: { borderRadius: 10, padding: 10, marginBottom: 10, alignItems: 'center' },
  noticeWarning: { backgroundColor: '#fef3c7' },
  noticeSuccess: { backgroundColor: '#dcfce7' },
  noticeText: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  primaryBtn: { borderRadius: 12 },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: 16, fontWeight: '700' },
  ownerActions: { flexDirection: 'row', gap: 8 },
  ownerBtn: { flex: 1, borderRadius: 10 },

  // Dialog
  dialogInput: { minHeight: 80 },
});
