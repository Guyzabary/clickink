import React, { useState } from 'react';
import { User, Mail, MapPin, Building, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TATTOO_STYLES = [
  'Geometric', 'Realistic', 'Traditional', 'Neo-Traditional',
  'Minimalist', 'Watercolor', 'Tribal', 'Japanese',
  'Blackwork', 'Mandala', 'Old School', 'New School',
  'Dotwork', 'Abstract', 'Illustrative'
];

const Profile: React.FC = () => {
  const { userData, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    studioName: userData?.studioName || '',
    city: userData?.city || '',
    address: userData?.address || '',
    bio: userData?.bio || '',
    styles: userData?.styles || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        fullNameLower: formData.fullName.toLowerCase(),
        ...(userData?.role === 'artist' && {
          studioNameLower: formData.studioName.toLowerCase(),
          cityLower: formData.city.toLowerCase(),
          stylesLower: formData.styles.map(style => style.toLowerCase())
        })
      };

      await updateUserProfile(updateData);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStyleToggle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style]
    }));
  };

  if (!userData) return null;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            {userData.role === 'artist' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    rows={4}
                    placeholder="Tell clients about yourself and your work..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Studio Name
                  </label>
                  <input
                    type="text"
                    value={formData.studioName}
                    onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Studio Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tattoo Styles
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TATTOO_STYLES.map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => handleStyleToggle(style)}
                        className={`p-2 text-sm rounded-lg border ${
                          formData.styles.includes(style)
                            ? 'border-purple-600 bg-purple-50 text-purple-600'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg">{userData.fullName}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg">{userData.email}</p>
              </div>
            </div>

            {userData.role === 'artist' && (
              <>
                {userData.bio && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Bio</h3>
                    <p className="text-gray-700">{userData.bio}</p>
                  </div>
                )}

                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Studio Name</p>
                    <p className="text-lg">{userData.studioName}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-lg">{userData.city}</p>
                    <p className="text-gray-600">{userData.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Palette className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tattoo Styles</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.styles?.map((style) => (
                        <span
                          key={style}
                          className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;