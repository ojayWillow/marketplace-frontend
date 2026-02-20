import { Offering } from '@marketplace/shared';

export interface SafeOfferingValues {
  safeTitle: string;
  safeDescription: string;
  safeCreatorName: string;
  safeLocation: string;
  safePriceType: string;
  categoryIcon: string;
  categoryLabel: string;
  priceDisplay: string;
  postedDate: string;
  seoDescription: string;
}

export interface OfferingHeaderProps {
  categoryIcon: string;
  categoryLabel: string;
  priceDisplay: string;
  safePriceType: string;
  safeTitle: string;
}

export interface OfferingProfileRowProps {
  offering: Offering;
  safeCreatorName: string;
  isOwner: boolean;
}

export interface OfferingInfoBarProps {
  safePriceType: string;
  serviceRadius: number | undefined;
  postedDate: string;
}

export interface OfferingDetailsSectionProps {
  experience?: string;
  availability?: string;
}

export interface OfferingBoostSectionProps {
  offering: Offering;
  boostTimeRemaining: string | null;
  onBoost: () => void;
  isBoosting: boolean;
}

export interface OfferingLocationMapProps {
  latitude: number;
  longitude: number;
  safeTitle: string;
  safeLocation: string;
  serviceRadius?: number;
}

export interface MatchingJobsSectionProps {
  offering: Offering;
  userId?: number;
}
