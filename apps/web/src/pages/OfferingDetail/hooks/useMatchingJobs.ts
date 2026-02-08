import { useState, useEffect } from 'react';
import { Offering, getTasks, Task } from '@marketplace/shared';

export const useMatchingJobs = (offering: Offering | undefined, userId?: number) => {
  const [matchingJobs, setMatchingJobs] = useState<Task[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    if (offering && userId === offering.creator_id) {
      fetchMatchingJobs();
    }
  }, [offering, userId]);

  const fetchMatchingJobs = async () => {
    if (!offering || !offering.latitude || !offering.longitude) return;
    try {
      setJobsLoading(true);
      const response = await getTasks({
        category: offering.category,
        latitude: offering.latitude,
        longitude: offering.longitude,
        radius: offering.service_radius || 50,
        status: 'open',
        per_page: 6
      });
      const filtered = (response.tasks || []).filter(t => t.creator_id !== offering.creator_id);
      setMatchingJobs(filtered);
    } catch (error) {
      console.error('Error fetching matching jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  return { matchingJobs, jobsLoading };
};
