import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsApi } from '../listings';
import { ListingsFilter, CreateListingData } from '../../types';

export const useListings = (filters?: ListingsFilter) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingsApi.getAll(filters),
  });
};

export const useListing = (id: number) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id),
    enabled: !!id,
  });
};

export const useMyListings = () => {
  return useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listingsApi.getMyListings(),
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListingData) => listingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateListingData> }) =>
      listingsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => listingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};
