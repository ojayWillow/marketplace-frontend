import apiClient from './client'
import type { Listing, CreateListingData } from './types'

export type { Listing }

export interface ListingsQueryParams {
  category?: string
  location?: string
  search?: string
  page?: number
  per_page?: number
  status?: string
}

export interface MyListingsResponse {
  listings: Listing[]
  total: number
  pages: number
  current_page: number
}

export const listingsApi = {
  getAll: async (params?: ListingsQueryParams): Promise<Listing[]> => {
    const response = await apiClient.get('/api/listings', { params })
    return response.data
  },

  getById: async (id: number): Promise<Listing> => {
    const response = await apiClient.get(`/api/listings/${id}`)
    return response.data
  },

  getMy: async (params?: { page?: number; per_page?: number; status?: string }): Promise<MyListingsResponse> => {
    const response = await apiClient.get('/api/listings/my', { params })
    return response.data
  },

  create: async (data: CreateListingData): Promise<Listing> => {
    const response = await apiClient.post('/api/listings', data)
    return response.data
  },

  update: async (id: number, data: Partial<CreateListingData>): Promise<Listing> => {
    const response = await apiClient.put(`/api/listings/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/listings/${id}`)
  },
}

// Legacy export for backward compatibility
export const getListings = listingsApi.getAll
