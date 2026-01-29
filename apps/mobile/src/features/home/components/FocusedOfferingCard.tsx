import { View, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { type Offering, getCategoryByKey } from '@marketplace/shared';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const category = getCategoryByKey(offering.category);
  const categoryColor = category?.color || '#ec4899';
  const avatarLabel = offering.provider?.username?.charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.focusedCard}>
      {/* Subtle Gradient Background - Aceternity Inspired */}
      <LinearGradient
        colors={[`${categoryColor}12`, `${categoryColor}05`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.cardGradientBg}
      />

      {/* Top Row - Category & Price with Depth */}
      <View style={styles.focusedTopRow}>
        <View style={[styles.focusedCategoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.focusedCategoryIcon}>{category?.icon || '💼'}</Text>
          <Text style={styles.focusedCategoryText}>{category?.label || 'Service'}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.focusedPrice, { color: categoryColor }]}>
            €{offering.price?.toFixed(0) || '0'}
          </Text>
          <Text style={styles.priceUnit}>/hr</Text>
        </View>
      </View>

      {/* Title with Better Typography */}
      <Text style={styles.focusedTitle} numberOfLines={2}>
        {offering.title}
      </Text>

      {/* Provider Info with Elevated Card Effect */}
      <View style={[styles.offeringProviderCard, {
        shadowColor: categoryColor,
        borderLeftColor: categoryColor,
      }]}>
        <Avatar.Text 
          size={56} 
          label={avatarLabel} 
          style={[styles.providerAvatar, { backgroundColor: categoryColor }]} 
        />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{offering.provider?.username || 'Unknown'}</Text>
          <View style={styles.providerMetaRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{offering.rating?.toFixed(1) || 'New'}</Text>
            </View>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.providerMeta}>{offering.experience_years || 0} years</Text>
          </View>
          <Text style={styles.providerLocation}>📍 {offering.location || 'Nearby'}</Text>
        </View>
      </View>

      {/* Stats Row with Depth - Aceternity Style */}
      <View style={styles.statsRowEnhanced}>
        <View style={[styles.statBoxEnhanced, { borderTopColor: categoryColor }]}>
          <Text style={styles.statValueEnhanced}>{offering.completed_jobs || 50}+</Text>
          <Text style={styles.statLabelEnhanced}>COMPLETED</Text>
        </View>
        
        <View style={[styles.statBoxEnhanced, { borderTopColor: categoryColor }]}>
          <Text style={styles.statValueEnhanced}>&lt;1hr</Text>
          <Text style={styles.statLabelEnhanced}>RESPONSE</Text>
        </View>
        
        <View style={[styles.statBoxEnhanced, { borderTopColor: categoryColor }]}>
          <Text style={styles.statValueEnhanced}>{offering.success_rate || 95}%</Text>
          <Text style={styles.statLabelEnhanced}>SUCCESS</Text>
        </View>
      </View>

      {/* Action Buttons with Gradients */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity 
          style={styles.secondaryActionButton}
          onPress={() => onViewDetails(offering.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryActionText}>View Profile</Text>
          <Icon name="arrow-forward" size={18} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryActionButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[categoryColor, `${categoryColor}dd`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          />
          <Icon name="chat" size={18} color="#ffffff" style={{ zIndex: 2 }} />
          <Text style={styles.primaryActionText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
