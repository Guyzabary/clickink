import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

type UserRole = 'client' | 'artist';

const TATTOO_STYLES = [
  'Geometric',
  'Realistic',
  'Traditional',
  'Neo-Traditional',
  'Minimalist',
  'Watercolor',
  'Tribal',
  'Japanese',
  'Blackwork',
  'Mandala',
  'Old School',
  'New School',
  'Dotwork',
  'Abstract',
  'Illustrative'
];

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [studioName, setStudioName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStyleToggle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (role === 'artist') {
      if (!studioName || !city || !address) {
        setError('Please fill in all artist information');
        return;
      }
      if (selectedStyles.length === 0) {
        setError('Please select at least one tattoo style');
        return;
      }
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        fullName,
        role,
        ...(role === 'artist' && {
          studioName,
          city,
          address,
          styles: selectedStyles,
        }),
        followedArtists: [],
        createdAt: serverTimestamp()
      });

      navigate('/');
    } catch (err) {
      setError('Failed to create account. Please try again.');
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
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter your password"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a: *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`p-4 rounded-lg border ${
                role === 'client'
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-200 text-gray-600'
              }`}
              onClick={() => setRole('client')}
            >
              Client
            </button>
            <button
              type="button"
              className={`p-4 rounded-lg border ${
                role === 'artist'
                  ? 'border-purple-600 bg-purple-50 text-purple-600'
                  : 'border-gray-200 text-gray-600'
              }`}
              onClick={() => setRole('artist')}
            >
              Tattoo Artist
            </button>
          </div>
        </div>

        {role === 'artist' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Studio Name *
              </label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your studio name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your city"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Studio Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your studio address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tattoo Styles *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TATTOO_STYLES.map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleStyleToggle(style)}
                    className={`p-2 text-sm rounded-lg border ${
                      selectedStyles.includes(style)
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
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-purple-600 hover:text-purple-700"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;