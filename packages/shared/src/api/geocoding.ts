/**
 * Geocoding service using OpenStreetMap Nominatim API
 * Converts addresses to latitude/longitude coordinates
 */

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
  const baseUrl = 'https://nominatim.openstreetmap.org/search';
  
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    addressdetails: '1',
    limit: '5',
    countrycodes: 'lv', // Limit to Latvia for better results
  });

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: {
        'User-Agent': 'Marketplace-App/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    return data;
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
  const baseUrl = 'https://nominatim.openstreetmap.org/reverse';
  
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    format: 'json',
    addressdetails: '1',
  });

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: {
        'User-Agent': 'Marketplace-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};