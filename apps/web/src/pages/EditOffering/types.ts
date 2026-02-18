export interface EditOfferingFormData {
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
  status: string;
}

export const INITIAL_EDIT_FORM: EditOfferingFormData = {
  title: '',
  description: '',
  category: 'cleaning',
  price: '',
  price_type: 'hourly',
  location: '',
  latitude: 56.9496,
  longitude: 24.1052,
  availability: '',
  experience: '',
  service_radius: '25',
  status: 'active',
};

export const PRICE_TYPES = [
  { value: 'hourly', labelKey: 'offerings.priceTypes.hourly', labelDefault: 'Per Hour', descKey: 'editOffering.priceTypeHourlyDesc', descDefault: 'Charge by the hour (e.g., \u20AC15/hr)' },
  { value: 'fixed', labelKey: 'offerings.priceTypes.fixed', labelDefault: 'Fixed Price', descKey: 'editOffering.priceTypeFixedDesc', descDefault: 'Set price for the whole service' },
  { value: 'negotiable', labelKey: 'offerings.priceTypes.negotiable', labelDefault: 'Negotiable', descKey: 'editOffering.priceTypeNegotiableDesc', descDefault: 'Price depends on the job' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'active', labelKey: 'offerings.status.active', labelDefault: 'Active', descKey: 'editOffering.statusActiveDesc', descDefault: 'Visible to everyone' },
  { value: 'paused', labelKey: 'offerings.status.paused', labelDefault: 'Paused', descKey: 'editOffering.statusPausedDesc', descDefault: 'Temporarily hidden' },
] as const;

export const RADIUS_OPTIONS = [
  { value: '5', labelKey: 'editOffering.radiusNearby', labelDefault: 'Nearby only' },
  { value: '10', labelKey: 'editOffering.radiusLocal', labelDefault: 'Local area' },
  { value: '25', labelKey: 'editOffering.radiusCity', labelDefault: 'City-wide' },
  { value: '50', labelKey: 'editOffering.radiusRegional', labelDefault: 'Regional' },
  { value: '100', labelKey: 'editOffering.radiusFar', labelDefault: 'Will travel far' },
] as const;
