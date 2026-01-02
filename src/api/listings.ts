import apiClient from './client';
import { Listing, CreateListingData, ListingsFilter, PaginatedResponse } from '../types';

export const listingsApi = {
  getAll: async (filters?: ListingsFilter, page = 1, perPage = 20): Promise<Listing[]> => {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.condition) params.append('condition', filters.condition);
    if (filters?.min_price) params.append('min_price', filters.min_price.toString());
    if (filters?.max_price) params.append('max_price', filters.max_price.toString());
    if (filters?.location) params.append('location', filters.location);
    if (filters?.search) params.append('search', filters.search);
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    const response = await apiClient.get<Listing[]>(`/api/listings?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Listing> => {
    const response = await apiClient.get<Listing>(`/api/listings/${id}`);
    return response.data;
  },

  create: async (data: CreateListingData): Promise<Listing> => {
    const response = await apiClient.post<Listing>('/api/listings', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateListingData>): Promise<Listing> => {
    const response = await apiClient.put<Listing>(`/api/listings/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/listings/${id}`);
  },

  getMyListings: async (): Promise<Listing[]> => {
    const response = await apiClient.get<Listing[]>('/api/listings?my_listings=true');
    return response.data;
  },
};
