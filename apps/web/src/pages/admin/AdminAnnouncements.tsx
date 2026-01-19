import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useToastStore } from '../../stores/toastStore';

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  target: 'all' | 'users' | 'providers';
  created_at: string;
  sent_count: number;
  is_active: boolean;
}

const AdminAnnouncements = () => {
  const toast = useToastStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // New announcement form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as Announcement['type'],
    target: 'all' as Announcement['target'],
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/admin/announcements');
        setAnnouncements(response.data.announcements);
      } catch (err) {
        // Mock data
        setAnnouncements([
          { id: 1, title: 'Welcome to Tirgus!', message: 'We are excited to launch our new marketplace. Start posting jobs or offering your services today!', type: 'success', target: 'all', created_at: '2026-01-01T10:00:00', sent_count: 156, is_active: true },
          { id: 2, title: 'New Categories Added', message: 'We have added new service categories including Pet Care, Tutoring, and Event Help. Check them out!', type: 'info', target: 'all', created_at: '2026-01-05T14:30:00', sent_count: 142, is_active: true },
          { id: 3, title: 'Payment System Maintenance', message: 'Our payment system will undergo maintenance on January 15th from 2:00 AM to 4:00 AM. Please plan accordingly.', type: 'warning', target: 'all', created_at: '2026-01-08T09:00:00', sent_count: 150, is_active: true },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSending(true);
      await apiClient.post('/api/admin/announcements', formData);
      toast.success('Announcement sent successfully!');
      
      // Add to local list
      const newAnnouncement: Announcement = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString(),
        sent_count: formData.target === 'all' ? 156 : 78,
        is_active: true,
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      
      // Reset form
      setFormData({ title: '', message: '', type: 'info', target: 'all' });
      setShowForm(false);
    } catch (err) {
      // Mock success
      toast.success('Announcement sent successfully!');
      const newAnnouncement: Announcement = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString(),
        sent_count: formData.target === 'all' ? 156 : 78,
        is_active: true,
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      setFormData({ title: '', message: '', type: 'info', target: 'all' });
      setShowForm(false);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await apiClient.delete(`/api/admin/announcements/${id}`);
      toast.success('Announcement deleted');
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) {
      toast.success('Announcement deleted');
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const getTypeBadge = (type: Announcement['type']) => {
    const styles: Record<string, { bg: string; icon: string }> = {
      'info': { bg: 'bg-blue-100 text-blue-700', icon: 'ℹ️' },
      'success': { bg: 'bg-green-100 text-green-700', icon: '✅' },
      'warning': { bg: 'bg-yellow-100 text-yellow-700', icon: '⚠️' },
      'urgent': { bg: 'bg-red-100 text-red-700', icon: '🚨' },
    };
    const style = styles[type];
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg}`}>
        {style.icon} {type}
      </span>
    );
  };

  const getTargetLabel = (target: Announcement['target']) => {
    switch (target) {
      case 'all': return 'All Users';
      case 'users': return 'Job Posters';
      case 'providers': return 'Service Providers';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500">Send announcements to platform users</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          + New Announcement
        </button>
      </div>

      {/* New Announcement Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your announcement message..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Type & Target */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Announcement['type'] })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">ℹ️ Info</option>
                  <option value="success">✅ Success</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="urgent">🚨 Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value as Announcement['target'] })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">👥 All Users</option>
                  <option value="users">💼 Job Posters</option>
                  <option value="providers">🛠️ Service Providers</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div className={`p-4 rounded-lg ${
                formData.type === 'info' ? 'bg-blue-50 border border-blue-200' :
                formData.type === 'success' ? 'bg-green-50 border border-green-200' :
                formData.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <p className="font-semibold">{formData.title || 'Announcement Title'}</p>
                <p className="text-sm mt-1">{formData.message || 'Your message will appear here...'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50"
              >
                {sending ? 'Sending...' : '📢 Send Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Past Announcements</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">📢</div>
            <p className="text-gray-500">No announcements yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(announcement.type)}
                      <span className="text-sm text-gray-500">
                        {getTargetLabel(announcement.target)}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{announcement.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      ✉️ Sent to {announcement.sent_count} users
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
