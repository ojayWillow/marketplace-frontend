import type { Offering } from '@marketplace/shared';

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface OfferingCardProps {
  offering: Offering;
  userLocation: UserLocation;
}
