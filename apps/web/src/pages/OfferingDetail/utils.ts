import { Offering } from '@marketplace/shared';
import { getCategoryIcon, getCategoryLabel } from '../../constants/categories';
import { formatTimeAgoLong } from '../Tasks/utils/taskHelpers';
import { SafeOfferingValues } from './types';

export const getBoostTimeRemaining = (boostExpiresAt?: string): string | null => {
  if (!boostExpiresAt) return null;
  const expiresAt = new Date(boostExpiresAt);
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export const getSafeValues = (offering: Offering): SafeOfferingValues => {
  const safeTitle = offering.title || 'Untitled Offering';
  const safeDescription = offering.description || '';
  const safeCreatorName = offering.creator_name || 'Unknown';
  const safeLocation = offering.location || '';
  const safePriceType = offering.price_type || 'fixed';
  const categoryIcon = getCategoryIcon(offering.category);
  const categoryLabel = getCategoryLabel(offering.category);
  const priceDisplay = `\u20ac${offering.price || 0}${safePriceType === 'hourly' ? '/hr' : ''}`;
  const postedDate = offering.created_at
    ? formatTimeAgoLong(offering.created_at)
    : '';
  const seoDescription = `${categoryLabel} service by ${safeCreatorName} - ${priceDisplay}${safeLocation ? ` in ${safeLocation}` : ''}. ${safeDescription.substring(0, 100)}${safeDescription.length > 100 ? '...' : ''}`;

  return {
    safeTitle,
    safeDescription,
    safeCreatorName,
    safeLocation,
    safePriceType,
    categoryIcon,
    categoryLabel,
    priceDisplay,
    postedDate,
    seoDescription,
  };
};
