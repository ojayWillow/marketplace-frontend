import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Offering } from '@marketplace/shared';
import { useAuthStore } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';
import { apiClient } from '@marketplace/shared';
import { useBoostOffering } from '../../../api/hooks';

export const useOfferingActions = (offering: Offering | undefined) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const boostMutation = useBoostOffering();
  const [contacting, setContacting] = useState(false);

  const handleContact = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact this person');
      navigate('/login');
      return;
    }
    if (!offering) return;
    try {
      setContacting(true);
      const response = await apiClient.post('/api/messages/conversations', {
        user_id: offering.creator_id,
        message: `Hi! I'm interested in your offering: "${offering.title || 'Untitled'}"`
      });
      navigate(`/messages/${response.data.conversation.id}`);
    } catch (err: any) {
      console.error('Error starting conversation:', err);
      toast.error(err?.response?.data?.error || 'Failed to start conversation');
    } finally {
      setContacting(false);
    }
  };

  const handleBoost = async () => {
    if (!offering) return;
    boostMutation.mutate(offering.id, {
      onSuccess: (response) => {
        toast.success(response.message || 'Offering boosted! It will now appear on the map.');
      },
      onError: (err: any) => {
        console.error('Error boosting offering:', err);
        toast.error(err?.response?.data?.error || 'Failed to boost offering');
      }
    });
  };

  return {
    contacting,
    handleContact,
    handleBoost,
    isBoosting: boostMutation.isPending,
  };
};
