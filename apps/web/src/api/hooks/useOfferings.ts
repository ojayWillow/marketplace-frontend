import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  getOfferings, 
  getBoostedOfferings, 
  getOffering, 
  getMyOfferings, 
  createOffering, 
  updateOffering, 
  boostOffering,
  OfferingsParams 
} from '@marketplace/shared/src/api/offerings';

// Query keys for cache management
// Include language in keys that return translated content
export const offeringKeys = {
  all: ['offerings'] as const,
  lists: () => [...offeringKeys.all, 'list'] as const,
  list: (params: OfferingsParams, lang: string) => [...offeringKeys.lists(), params, lang] as const,
  boosted: (params?: Partial<OfferingsParams>, lang?: string) => [...offeringKeys.all, 'boosted', params, lang] as const,
  details: () => [...offeringKeys.all, 'detail'] as const,
  detail: (id: number, lang: string) => [...offeringKeys.details(), id, lang] as const,
  myOfferings: (lang: string) => [...offeringKeys.all, 'my', lang] as const,
};

// Fetch offerings list with filters
export const useOfferings = (params: OfferingsParams, options?: { enabled?: boolean }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'lv';
  
  return useQuery({
    queryKey: offeringKeys.list(params, lang),
    queryFn: () => getOfferings({ ...params, lang }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

// Fetch boosted offerings for map display
export const useBoostedOfferings = (params?: Partial<OfferingsParams>, options?: { enabled?: boolean }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'lv';
  
  return useQuery({
    queryKey: offeringKeys.boosted(params, lang),
    queryFn: () => getBoostedOfferings({ ...params, lang }),
    staleTime: 1000 * 60 * 1, // 1 minute (boosted status can change)
    ...options,
  });
};

// Fetch single offering by ID
export const useOffering = (id: number, options?: { enabled?: boolean }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'lv';
  
  return useQuery({
    queryKey: offeringKeys.detail(id, lang),
    queryFn: () => getOffering(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id && options?.enabled !== false,
  });
};

// Fetch user's own offerings
export const useMyOfferings = (options?: { enabled?: boolean }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.substring(0, 2) || 'lv';
  
  return useQuery({
    queryKey: offeringKeys.myOfferings(lang),
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
      queryClient.invalidateQueries({ queryKey: offeringKeys.all });
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
      // Invalidate all offering queries (including all language variants)
      queryClient.invalidateQueries({ queryKey: offeringKeys.details() });
      queryClient.invalidateQueries({ queryKey: offeringKeys.lists() });
      queryClient.invalidateQueries({ queryKey: offeringKeys.all });
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
      queryClient.invalidateQueries({ queryKey: offeringKeys.all });
    },
  });
};
