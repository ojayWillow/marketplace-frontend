import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getTask, Task, applyToTask, markTaskDone, confirmTaskCompletion, cancelTask, disputeTask } from '../api/tasks';
import { startConversation } from '../api/messages';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const taskData = await getTask(Number(id));
      setTask(taskData);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageCreator = async () => {
    if (!isAuthenticated) {
      toast.warning('Please login to send messages');
      navigate('/login');
      return;
    }
    if (!task?.creator_id) return;

    try {
      setMessageLoading(true);
      const { conversation } = await startConversation(task.creator_id, undefined, task.id);
      navigate(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast.error(error?.response?.data?.error || 'Failed to start conversation');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleApplyTask = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.warning('Please login to apply');
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      await applyToTask(Number(id), applicationMessage);
      toast.success('✅ Application submitted! The task owner will review your application and get back to you.');
      setShowApplicationForm(false);
      setApplicationMessage('');
      setTimeout(() => {
        navigate('/tasks');
      }, 2000);
    } catch (error: any) {
      console.error('Error applying to task:', error);
      toast.error(error?.response?.data?.error || 'Failed to apply. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDone = async () => {
    try {
      setActionLoading(true);
      await markTaskDone(Number(id));
      toast.success('Task marked as done! Waiting for creator confirmation.');
      fetchTask();
    } catch (error: any) {
      console.error('Error marking task done:', error);
      toast.error(error?.response?.data?.error || 'Failed to mark task as done');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDone = async () => {
    try {
      setActionLoading(true);
      await confirmTaskCompletion(Number(id));
      toast.success('Task completed! Thank you for using our service.');
      fetchTask();
    } catch (error: any) {
      console.error('Error confirming task:', error);
      toast.error(error?.response?.data?.error || 'Failed to confirm task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    const reason = window.prompt('Please provide a reason for the dispute:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await disputeTask(Number(id), reason);
      toast.warning('Task has been disputed. Please resolve with the worker.');
      fetchTask();
    } catch (error: any) {
      console.error('Error disputing task:', error);
      toast.error(error?.response?.data?.error || 'Failed to dispute task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this task?')) return;

    try {
      setActionLoading(true);
      await cancelTask(Number(id));
      toast.success('Task cancelled.');
      fetchTask();
    } catch (error: any) {
      console.error('Error cancelling task:', error);
      toast.error(error?.response?.data?.error || 'Failed to cancel task');
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'pet-care': '🐕',
      'moving': '📦',
      'shopping': '🛒',
      'cleaning': '🧹',
      'delivery': '📄',
      'outdoor': '🌿',
    };
    return icons[category] || '📋';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'pet-care': 'Pet Care',
      'moving': 'Moving',
      'shopping': 'Shopping',
      'cleaning': 'Cleaning',
      'delivery': 'Delivery',
      'outdoor': 'Outdoor',
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'open': 'bg-green-100 text-green-700',
      'assigned': 'bg-yellow-100 text-yellow-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'pending_confirmation': 'bg-purple-100 text-purple-700',
      'completed': 'bg-gray-100 text-gray-700',
      'cancelled': 'bg-red-100 text-red-700',
      'disputed': 'bg-orange-100 text-orange-700',
    };
    const labels: Record<string, string> = {
      'open': 'Open',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'pending_confirmation': 'Pending Confirmation',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'disputed': 'Disputed',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-600',
      'normal': 'bg-blue-100 text-blue-600',
      'high': 'bg-red-100 text-red-600',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority] || 'bg-gray-100 text-gray-600'}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task not found</h2>
          <p className="text-gray-600 mb-4">This task may have been removed or doesn't exist.</p>
          <Link to="/tasks" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Browse Tasks
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === task.creator_id;
  const isAssigned = user?.id === task.assigned_to_id;
  const canApply = isAuthenticated && !isCreator && task.status === 'open';
  const canMarkDone = isAssigned && (task.status === 'assigned' || task.status === 'in_progress');
  const canConfirm = isCreator && task.status === 'pending_confirmation';
  const canDispute = isCreator && task.status === 'pending_confirmation';
  const canCancel = isCreator && task.status === 'open';
  const canEdit = isCreator && task.status === 'open';
  const canMessageCreator = isAuthenticated && !isCreator && task.creator_id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/tasks" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tasks
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getCategoryIcon(task.category)}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                    <p className="text-gray-500">{getCategoryLabel(task.category)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority || 'normal')}
                  {task.is_urgent && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500 text-white">⚡ Urgent</span>
                  )}
                </div>
              </div>
              {task.budget && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-3xl font-bold text-green-600">€{task.budget}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap mb-6">{task.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">📍 Location</p>
                <p className="font-medium text-gray-900">{task.location}</p>
              </div>
              {task.deadline && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">📅 Deadline</p>
                  <p className="font-medium text-gray-900">
                    {new Date(task.deadline).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">📆 Posted</p>
                <p className="font-medium text-gray-900">
                  {task.created_at && new Date(task.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {/* Posted by section with message button */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">👤 Posted by</p>
                <div className="flex items-center justify-between">
                  <Link to={`/users/${task.creator_id}`} className="font-medium text-blue-600 hover:text-blue-700">
                    {task.creator_name || 'Unknown'}
                  </Link>
                  {canMessageCreator && (
                    <button
                      onClick={handleMessageCreator}
                      disabled={messageLoading}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {messageLoading ? '...' : '💬 Message'}
                    </button>
                  )}
                </div>
              </div>
              {task.assigned_to_name && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">🛠️ Assigned to</p>
                  <Link to={`/users/${task.assigned_to_id}`} className="font-medium text-blue-600 hover:text-blue-700">
                    {task.assigned_to_name}
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="flex flex-col gap-3">
                {/* Apply button with form */}
                {canApply && (
                  <>
                    {!showApplicationForm ? (
                      <button onClick={() => setShowApplicationForm(true)} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium text-lg">
                        📝 Apply for This Task
                      </button>
                    ) : (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Submit Your Application</h3>
                        <textarea value={applicationMessage} onChange={(e) => setApplicationMessage(e.target.value)} placeholder="Introduce yourself and explain why you're a good fit for this task (optional)..." className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <div className="flex gap-2">
                          <button onClick={handleApplyTask} disabled={actionLoading} className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium">
                            {actionLoading ? '⏳ Submitting...' : '✅ Submit Application'}
                          </button>
                          <button onClick={() => { setShowApplicationForm(false); setApplicationMessage(''); }} className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {canMarkDone && (
                  <button onClick={handleMarkDone} disabled={actionLoading} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium">
                    {actionLoading ? 'Processing...' : '✓ Mark as Done'}
                  </button>
                )}

                {canConfirm && (
                  <button onClick={handleConfirmDone} disabled={actionLoading} className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-medium">
                    {actionLoading ? 'Processing...' : '✓ Confirm Completed'}
                  </button>
                )}

                {canDispute && (
                  <button onClick={handleDispute} disabled={actionLoading} className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-medium">
                    {actionLoading ? 'Processing...' : '⚠️ Dispute'}
                  </button>
                )}

                {canEdit && (
                  <Link to={`/tasks/${task.id}/edit`} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium text-center">
                    ✏️ Edit Task
                  </Link>
                )}

                {canCancel && (
                  <button onClick={handleCancel} disabled={actionLoading} className="bg-red-100 text-red-700 px-6 py-3 rounded-lg hover:bg-red-200 disabled:bg-gray-200 font-medium">
                    {actionLoading ? 'Processing...' : 'Cancel Task'}
                  </button>
                )}

                {!isAuthenticated && task.status === 'open' && (
                  <Link to="/login" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium text-center">
                    Login to Apply
                  </Link>
                )}

                {isCreator && task.status === 'assigned' && (
                  <div className="flex items-center text-yellow-600 bg-yellow-50 px-4 py-3 rounded-lg">
                    <span className="mr-2">⏳</span> Waiting for worker to complete this task
                  </div>
                )}
                {isAssigned && task.status === 'pending_confirmation' && (
                  <div className="flex items-center text-purple-600 bg-purple-50 px-4 py-3 rounded-lg">
                    <span className="mr-2">⏳</span> Waiting for creator to confirm completion
                  </div>
                )}
                {task.status === 'completed' && (
                  <div className="flex items-center text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                    <span className="mr-2">✅</span> This task has been completed
                  </div>
                )}
                {task.status === 'cancelled' && (
                  <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                    <span className="mr-2">❌</span> This task has been cancelled
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {task.latitude && task.longitude && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">🗺️ Location</h2>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-2xl mb-2">📍</p>
                <p>{task.location}</p>
                <p className="text-sm mt-1">Lat: {task.latitude.toFixed(4)}, Lng: {task.longitude.toFixed(4)}</p>
                <a href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-blue-600 hover:text-blue-700 text-sm">
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
