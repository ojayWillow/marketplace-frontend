import { View, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { type Offering } from '@marketplace/shared';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCategories } from '../../../hooks/useCategories';

interface FocusedOfferingCardProps {
  offering: Offering;
  onViewDetails: (id: number) => void;
  styles: any;
}

export function FocusedOfferingCard({
  offering,
  onViewDetails,
  styles,
}: FocusedOfferingCardProps) {
  const { getCategoryLabel, getCategoryIcon, getCategoryByKey } = useCategories();
  const category = getCategoryByKey(offering.category);
  const categoryColor = '#ec4899'; // Default pink for offerings
  const avatarLabel = offering.provider?.username?.charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.focusedCard}>
      {/* Top Row - Category & Price */}
      <View style={styles.focusedTopRow}>
        <View style={[styles.focusedCategoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.focusedCategoryIcon}>{getCategoryIcon(offering.category)}</Text>
          <Text style={styles.focusedCategoryText}>{getCategoryLabel(offering.category)}</Text>
        </View>
        <Text style={[styles.focusedPrice, { color: categoryColor }]}>
          €{offering.price?.toFixed(0) || '0'}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.focusedTitle} numberOfLines={2}>
        {offering.title}
      </Text>

      {/* Provider Info */}
      <View style={styles.offeringProviderRow}>
        <Avatar.Text size={40} label={avatarLabel} style={styles.providerAvatar} />
        <View style={styles.providerInfo}>
          <Text style={styles.providerLabel}>Service Provider</Text>
          <Text style={styles.providerName}>{offering.provider?.username || 'Unknown'}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>EXPERIENCE</Text>
          <Text style={styles.statValue}>{offering.experience_years || 0} years</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>RATING</Text>
          <Text style={styles.statValue}>⭐ {offering.rating?.toFixed(1) || 'New'}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>LOCATION</Text>
          <Text style={styles.statValue}>{offering.location || 'Nearby'}</Text>
        </View>
      </View>

      {/* View Details Button */}
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => onViewDetails(offering.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[categoryColor, categoryColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 12 }}
        />
        <Text style={styles.viewButtonText}>View Details</Text>
        <Icon name="arrow-forward" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
