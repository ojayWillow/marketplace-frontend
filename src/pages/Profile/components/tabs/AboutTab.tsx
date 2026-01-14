import type { UserProfile, ProfileFormData } from '../../types';

interface AboutTabProps {
  profile: UserProfile;
  editing: boolean;
  formData: ProfileFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const AboutTab = ({ profile, editing, formData, onChange }: AboutTabProps) => {
  if (editing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={onChange}
              rows={3}
              placeholder="Tell others about yourself..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              placeholder="+371 20000000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={onChange}
                placeholder="Riga"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={onChange}
                placeholder="Latvia"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="space-y-5">
        {profile.bio ? (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">No bio yet. Click "Edit Profile" to add one!</p>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Contact</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400">📧</span>
              <span className="text-gray-700">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">📱</span>
                <span className="text-gray-700">{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
