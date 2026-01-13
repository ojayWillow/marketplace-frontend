import type { Offering } from '@/api/offerings';

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface OfferingCardProps {
  offering: Offering;
  userLocation: UserLocation;
}
