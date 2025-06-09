import React, { useState } from 'react';
import { PenTool } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SelectRole: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUserRole } = useAuth();

  const handleRoleSelect = async (role: 'client' | 'artist') => {
    try {
      setLoading(true);
      setError('');
      await setUserRole(role);
    } catch (err) {
      setError('Failed to set role. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8">
      <div className="flex justify-center mb-6">
        <PenTool className="h-12 w-12 text-purple-600" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">Welcome to ClickInk</h2>
      <p className="text-gray-600 text-center mb-8">
        Please select your role to continue
      </p>

      <div className="space-y-4">
        <button
          onClick={() => handleRoleSelect('client')}
          disabled={loading}
          className="w-full p-6 rounded-lg border-2 border-purple-600 bg-white hover:bg-purple-50 transition flex flex-col items-center gap-2"
        >
          <span className="text-xl font-semibold text-purple-600">I'm a Client</span>
          <span className="text-gray-600">Looking to get a tattoo</span>
        </button>

        <button
          onClick={() => handleRoleSelect('artist')}
          disabled={loading}
          className="w-full p-6 rounded-lg border-2 border-purple-600 bg-white hover:bg-purple-50 transition flex flex-col items-center gap-2"
        >
          <span className="text-xl font-semibold text-purple-600">I'm an Artist</span>
          <span className="text-gray-600">Looking to showcase my work</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 text-red-600 text-sm text-center">{error}</div>
      )}

      {loading && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default SelectRole;