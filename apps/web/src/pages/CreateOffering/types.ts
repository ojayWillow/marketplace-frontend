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
  images: File[];
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
  images: [],
};

export const DAYS_OF_WEEK = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
] as const;

export const TIME_SLOTS = [
  { key: 'morning', label: 'Morning', desc: '8–12' },
  { key: 'afternoon', label: 'Afternoon', desc: '12–17' },
  { key: 'evening', label: 'Evening', desc: '17–21' },
  { key: 'flexible', label: 'Flexible', desc: 'Any' },
] as const;

export const RADIUS_OPTIONS = [
  { value: '5', label: '5km' },
  { value: '10', label: '10km' },
  { value: '25', label: '25km' },
  { value: '50', label: '50km' },
  { value: '100', label: '100km' },
  { value: '250', label: 'All Latvia' },
] as const;

export const PRICE_TYPES = [
  { value: 'hourly', label: '/hr', icon: '⏱️' },
  { value: 'fixed', label: 'Fixed', icon: '🎯' },
  { value: 'negotiable', label: 'Nego', icon: '🤝' },
] as const;
