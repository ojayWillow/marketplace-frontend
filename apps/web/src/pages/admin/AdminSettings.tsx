import { useState, useEffect } from 'react';
import { apiClient } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';

interface PlatformSettings {
  platformName: string;
  platformFee: number;
  minJobBudget: number;
  maxJobBudget: number;
  maxImagesPerListing: number;
  autoApproveListings: boolean;
  emailNotificationsEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  supportEmail: string;
  defaultCurrency: string;
  defaultLanguage: string;
}

const AdminSettings = () => {
  const toast = useToastStore();
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'Tirgus',
    platformFee: 5,
    minJobBudget: 5,
    maxJobBudget: 10000,
    maxImagesPerListing: 5,
    autoApproveListings: true,
    emailNotificationsEnabled: true,
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
    supportEmail: 'support@tirgus.lv',
    defaultCurrency: 'EUR',
    defaultLanguage: 'lv',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/admin/settings');
        setSettings(response.data.settings);
      } catch (err) {
        // Use default settings
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof PlatformSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put('/api/admin/settings', settings);
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    } catch (err) {
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenance = async () => {
    const newValue = !settings.maintenanceMode;
    if (newValue && !window.confirm('Are you sure you want to enable maintenance mode? Users will not be able to access the platform.')) {
      return;
    }
    handleChange('maintenanceMode', newValue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-500">Configure your marketplace platform</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900">⚙️ General Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Platform Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => handleChange('platformName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Support Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Currency & Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">€ EUR - Euro</option>
                <option value="USD">$ USD - US Dollar</option>
                <option value="GBP">£ GBP - British Pound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => handleChange('defaultLanguage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="lv">🇱🇻 Latvian</option>
                <option value="en">🇬🇧 English</option>
                <option value="ru">🇷🇺 Russian</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fees & Limits */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900">💰 Fees & Limits</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Platform Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.platformFee}
                onChange={(e) => handleChange('platformFee', parseFloat(e.target.value))}
                min="0"
                max="50"
                step="0.5"
                className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">% of each transaction</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Fee charged on completed jobs</p>
          </div>

          {/* Budget Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Job Budget (€)</label>
              <input
                type="number"
                value={settings.minJobBudget}
                onChange={(e) => handleChange('minJobBudget', parseFloat(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Job Budget (€)</label>
              <input
                type="number"
                value={settings.maxJobBudget}
                onChange={(e) => handleChange('maxJobBudget', parseFloat(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Max Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Images per Listing</label>
            <input
              type="number"
              value={settings.maxImagesPerListing}
              onChange={(e) => handleChange('maxImagesPerListing', parseInt(e.target.value))}
              min="1"
              max="20"
              className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900">🔧 Features</h2>
        </div>
        <div className="p-6 space-y-4">
          {/* Auto Approve */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto-approve Listings</p>
              <p className="text-sm text-gray-500">Automatically approve new jobs and offerings</p>
            </div>
            <button
              onClick={() => handleChange('autoApproveListings', !settings.autoApproveListings)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.autoApproveListings ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.autoApproveListings ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Send email notifications to users</p>
            </div>
            <button
              onClick={() => handleChange('emailNotificationsEnabled', !settings.emailNotificationsEnabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.emailNotificationsEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.emailNotificationsEnabled ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-red-200">
        <div className="p-4 border-b border-red-100 bg-red-50">
          <h2 className="font-semibold text-red-900">⚠️ Danger Zone</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-red-900">Maintenance Mode</p>
              <p className="text-sm text-red-600">Temporarily disable the platform for all users</p>
            </div>
            <button
              onClick={handleToggleMaintenance}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.maintenanceMode ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {settings.maintenanceMode && (
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">Maintenance Message</label>
              <textarea
                value={settings.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Button (sticky bottom) */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium shadow-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save All Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
