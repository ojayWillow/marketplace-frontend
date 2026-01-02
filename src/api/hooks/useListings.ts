import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '../client'

export interface Listing {
  id: number
  title: string
  description: string
  price: number
  category: string
  location: string
  created_at: string
  user_id: number
  seller?: {
    id: number
    name: string
    email: string
  }
}

interface ListingsParams {
  category?: string
  location?: string
  limit?: number
}

interface CreateListingData {
  title: string
  description: string
  price: number
  category: string
  location: string
}

export function useListings(params?: ListingsParams) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      const response = await apiClient.get<Listing[]>('/api/listings', { params })
      return response.data
    },
  })
}

export function useListing(id: number) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await apiClient.get<Listing>(`/api/listings/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateListing() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateListingData) => {
      const response = await apiClient.post<Listing>('/api/listings', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      navigate(`/listings/${data.id}`)
    },
  })
}

export function useUpdateListing(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<CreateListingData>) => {
      const response = await apiClient.put<Listing>(`/api/listings/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/listings/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      navigate('/listings')
    },
  })
}
