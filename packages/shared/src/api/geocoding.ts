/**
 * Geocoding service - proxied through our backend to avoid CORS issues.
 * Backend forwards requests to OpenStreetMap Nominatim.
 */

import { apiClient } from './client';

export interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    country_code?: string;
  };
}

/**
 * Geocode an address to get coordinates
 * @param address - Address string (e.g., "Riga, Centrs" or "Brivibas iela 1, Riga")
 * @returns Promise with geocoding results
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult[]> => {
  try {
    const params = new URLSearchParams({
      q: address,
      limit: '5',
      countrycodes: 'lv',
    });

    const response = await apiClient.get(`/api/geocode?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Reverse geocode coordinates to get address
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Promise with address information
 */
export const reverseGeocode = async (lat: number, lon: number): Promise<GeocodingResult> => {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
    });

    const response = await apiClient.get(`/api/reverse-geocode?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};
