import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listingsApi, type ListingsQueryParams } from '@marketplace/shared'
import type { CreateListingData } from '@marketplace/shared'

export function useListings(params?: ListingsQueryParams) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => listingsApi.getAll(params),
  })
}

export function useListing(id: number) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id),
    enabled: !!id,
  })
}

export function useMyListings(params?: { page?: number; per_page?: number; status?: string }) {
  return useQuery({
    queryKey: ['myListings', params],
    queryFn: () => listingsApi.getMy(params),
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateListingData) => listingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
    },
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateListingData> }) =>
      listingsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      queryClient.invalidateQueries({ queryKey: ['listing', id] })
    },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => listingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
    },
  })
}
