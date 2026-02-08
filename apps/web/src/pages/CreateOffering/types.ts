export interface OfferingFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  price_type: string;
  location: string;
  latitude: number;
  longitude: number;
  availability: string;
  experience: string;
  service_radius: string;
}

export const INITIAL_FORM_DATA: OfferingFormData = {
  title: '',
  description: '',
  category: '',
  price: '',
  price_type: 'hourly',
  location: '',
  latitude: 56.9496,
  longitude: 24.1052,
  availability: '',
  experience: '',
  service_radius: '25',
};

export const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const;

export const TIME_SLOTS = [
  { key: 'morning', label: 'Morning', desc: '8–12' },
  { key: 'afternoon', label: 'Afternoon', desc: '12–17' },
  { key: 'evening', label: 'Evening', desc: '17–21' },
  { key: 'flexible', label: 'Flexible', desc: 'Anytime' },
] as const;

export const RADIUS_OPTIONS = [
  { value: '5', label: '5 km', desc: 'Nearby' },
  { value: '10', label: '10 km', desc: 'Local' },
  { value: '25', label: '25 km', desc: 'City' },
  { value: '50', label: '50 km', desc: 'Regional' },
  { value: '100', label: '100 km', desc: 'Will travel' },
] as const;

export const PRICE_TYPES = [
  { value: 'hourly', label: 'Per Hour', icon: '⏱️' },
  { value: 'fixed', label: 'Fixed Price', icon: '🎯' },
  { value: 'negotiable', label: 'Negotiable', icon: '🤝' },
] as const;
