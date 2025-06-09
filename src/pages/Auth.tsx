import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PenTool } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

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

const Auth: React.FC = () => {
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [studioName, setStudioName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

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

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (isRegister) {
      if (!fullName) {
        setError('Please enter your full name');
        return;
      }

      if (role === 'artist' && (!studioName || !city || !address || selectedStyles.length === 0)) {
        setError('Please fill in all artist information');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      try {
        setLoading(true);
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        
        const userData = {
          uid: user.uid,
          email,
          fullName,
          fullNameLower: fullName.toLowerCase(),
          role,
          ...(role === 'artist' && {
            studioName,
            studioNameLower: studioName.toLowerCase(),
            city,
            cityLower: city.toLowerCase(),
            address,
            styles: selectedStyles,
            stylesLower: selectedStyles.map(style => style.toLowerCase())
          }),
          followedArtists: [],
          createdAt: serverTimestamp()
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        navigate('/');
      } catch (err) {
        setError('Failed to create account. Please try again.');
        console.error(err);
      }
    } else {
      try {
        setLoading(true);
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } catch (err) {
        setError('Failed to sign in. Please check your credentials.');
        console.error(err);
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
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
      <h2 className="text-2xl font-bold text-center mb-6">
        {isRegister ? 'Create Account' : 'Welcome Back'}
      </h2>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition mb-6"
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="w-5 h-5"
        />
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
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
        )}

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

        {isRegister && (
          <>
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
          {loading ? (isRegister ? 'Creating Account...' : 'Signing in...') 
            : (isRegister ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        {isRegister ? (
          <Link
            to="/login"
            className="text-purple-600 hover:text-purple-700"
          >
            Already have an account? Sign in
          </Link>
        ) : (
          <Link
            to="/register"
            className="text-purple-600 hover:text-purple-700"
          >
            Don't have an account? Sign up
          </Link>
        )}
      </div>
    </div>
  );
};

export default Auth;