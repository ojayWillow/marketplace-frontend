// Status badge utilities

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'active':
    case 'open':
      return 'bg-green-100 text-green-700';
    case 'sold':
    case 'completed':
      return 'bg-blue-100 text-blue-700';
    case 'assigned':
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-700';
    case 'pending_confirmation':
    case 'pending':
      return 'bg-purple-100 text-purple-700';
    case 'cancelled':
    case 'expired':
    case 'rejected':
    case 'paused':
      return 'bg-gray-100 text-gray-700';
    case 'disputed':
      return 'bg-red-100 text-red-700';
    case 'accepted':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};
