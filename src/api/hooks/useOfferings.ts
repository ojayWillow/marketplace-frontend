import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getOfferings, 
  getBoostedOfferings, 
  getOffering, 
  getMyOfferings, 
  createOffering, 
  updateOffering, 
  boostOffering,
  OfferingsParams 
} from '../offerings';

// Query keys for cache management
export const offeringKeys = {
  all: ['offerings'] as const,
  lists: () => [...offeringKeys.all, 'list'] as const,
  list: (params: OfferingsParams) => [...offeringKeys.lists(), params] as const,
  boosted: (params?: Partial<OfferingsParams>) => [...offeringKeys.all, 'boosted', params] as const,
  details: () => [...offeringKeys.all, 'detail'] as const,
  detail: (id: number) => [...offeringKeys.details(), id] as const,
  myOfferings: () => [...offeringKeys.all, 'my'] as const,
};

// Fetch offerings list with filters
export const useOfferings = (params: OfferingsParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: offeringKeys.list(params),
    queryFn: () => getOfferings(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

// Fetch boosted offerings for map display
export const useBoostedOfferings = (params?: Partial<OfferingsParams>, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: offeringKeys.boosted(params),
    queryFn: () => getBoostedOfferings(params || {}),
    staleTime: 1000 * 60 * 1, // 1 minute (boosted status can change)
    ...options,
  });
};

// Fetch single offering by ID
export const useOffering = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: offeringKeys.detail(id),
    queryFn: () => getOffering(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id && options?.enabled !== false,
  });
};

// Fetch user's own offerings
export const useMyOfferings = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: offeringKeys.myOfferings(),
    queryFn: () => getMyOfferings(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

// Create offering mutation
export const useCreateOffering = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOffering,
    onSuccess: () => {
      // Invalidate all offering lists to refetch
      queryClient.invalidateQueries({ queryKey: offeringKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offeringKeys.myOfferings() });
    },
  });
};

// Update offering mutation
export const useUpdateOffering = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateOffering>[1] }) => 
      updateOffering(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific offering and lists
      queryClient.invalidateQueries({ queryKey: offeringKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: offeringKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offeringKeys.myOfferings() });
    },
  });
};

// Boost offering mutation
export const useBoostOffering = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: boostOffering,
    onSuccess: (_, offeringId) => {
      // Invalidate boosted offerings and specific offering
      queryClient.invalidateQueries({ queryKey: offeringKeys.boosted() });
      queryClient.invalidateQueries({ queryKey: offeringKeys.detail(offeringId) });
      queryClient.invalidateQueries({ queryKey: offeringKeys.myOfferings() });
    },
  });
};
