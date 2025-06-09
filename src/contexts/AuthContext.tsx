import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';

export interface UserData {
  uid: string;
  email: string;
  fullName: string;
  role?: 'client' | 'artist';
  studioName?: string;
  city?: string;
  address?: string;
  bio?: string;
  styles?: string[];
  followedArtists?: string[];
  createdAt: Date;
  unreadMessages?: number;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  setUserRole: (role: 'client' | 'artist') => Promise<void>;
  followArtist: (artistId: string) => Promise<void>;
  unfollowArtist: (artistId: string) => Promise<void>;
  isFollowing: (artistId: string) => boolean;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  updateUnreadMessages: (count: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  setUserRole: async () => {},
  followArtist: async () => {},
  unfollowArtist: async () => {},
  isFollowing: () => false,
  updateUserProfile: async () => {},
  updateUnreadMessages: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Clean up previous user data listener if it exists
        if (unsubscribeUser) {
          unsubscribeUser();
        }

        // Set up new user data listener
        const userDocRef = doc(db, 'users', user.uid);
        const setupUserData = async () => {
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Create new user document
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              fullName: user.displayName || '',
              followedArtists: [],
              createdAt: serverTimestamp()
            });
            navigate('/select-role');
          } else {
            const userData = userDoc.data() as UserData;
            setUserData(userData);
            
            if (!userData.role) {
              navigate('/select-role');
            } else if (['/login', '/register'].includes(location.pathname)) {
              navigate('/');
            }
          }
        };

        await setupUserData();
      } else {
        // User logged out - clean up
        if (unsubscribeUser) {
          unsubscribeUser();
          unsubscribeUser = undefined;
        }
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Handle redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Signed in via redirect');
        }
      })
      .catch((error) => {
        console.error('Redirect sign-in error:', error);
      });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, [navigate, location.pathname]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        // Fallback to redirect if popup was blocked
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.error('Error signing in with Google:', error);
        throw error;
      }
    }
  };

  const setUserRole = async (role: 'client' | 'artist') => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, { role });
    
    const updatedDoc = await getDoc(userRef);
    setUserData(updatedDoc.data() as UserData);
    
    navigate('/');
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    navigate('/');
  };

  const followArtist = async (artistId: string) => {
    if (!currentUser || !userData) return;

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      followedArtists: arrayUnion(artistId)
    });

    setUserData(prev => ({
      ...prev!,
      followedArtists: [...(prev?.followedArtists || []), artistId]
    }));
  };

  const unfollowArtist = async (artistId: string) => {
    if (!currentUser || !userData) return;

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      followedArtists: arrayRemove(artistId)
    });

    setUserData(prev => ({
      ...prev!,
      followedArtists: prev?.followedArtists?.filter(id => id !== artistId) || []
    }));
  };

  const isFollowing = (artistId: string): boolean => {
    return userData?.followedArtists?.includes(artistId) || false;
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, data);
    
    setUserData(prev => prev ? { ...prev, ...data } : null);
  };

  const updateUnreadMessages = (count: number) => {
    setUserData(prev => prev ? { ...prev, unreadMessages: count } : null);
  };

  const value = {
    currentUser,
    userData,
    loading,
    signOut,
    signInWithGoogle,
    setUserRole,
    followArtist,
    unfollowArtist,
    isFollowing,
    updateUserProfile,
    updateUnreadMessages
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};