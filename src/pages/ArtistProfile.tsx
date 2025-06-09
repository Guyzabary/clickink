import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Mail, Users, Calendar, MessageSquare } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AppointmentForm from '../components/AppointmentForm';
import { useAppointmentStore } from '../store/appointmentStore';
import { createOrGetChat } from '../utils/chat';
import StarRating from '../components/StarRating';
import ReviewFormSimple from '../components/ReviewFormSimple';

interface ArtistData {
  uid: string;
  fullName: string;
  studioName: string;
  city: string;
  address: string;
  email: string;
  bio?: string;
  styles: string[];
}

const ArtistProfile: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const { userData, isFollowing, followArtist, unfollowArtist } = useAuth();
  const { createAppointment } = useAppointmentStore();
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const bookingFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        if (!uid) return;
        
        // Fetch artist info
        const artistDoc = await getDoc(doc(db, 'users', uid));
        if (artistDoc.exists()) {
          setArtist(artistDoc.data() as ArtistData);
        }

        // Fetch and compute ratings
        const reviewsQuery = query(
          collection(db, 'artistReviews'),
          where('artistId', '==', uid)
        );
        const reviewsSnap = await getDocs(reviewsQuery);
        let sum = 0;
        reviewsSnap.forEach(doc => {
          const rating = Number(doc.data().rating);
          if (!isNaN(rating) && rating >= 1 && rating <= 5) {
            sum += rating;
          }
        });
        const count = reviewsSnap.size;
        setRatingCount(count);
        setAverageRating(count > 0 ? sum / count : 0);

        // Fetch posts if following
        if (userData && (isFollowing(uid) || userData.uid === uid)) {
          const postsQuery = query(
            collection(db, 'posts'),
            where('artistId', '==', uid)
          );
          const postsSnap = await getDocs(postsQuery);
          setPosts(postsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })));
        }
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [uid, userData, isFollowing]);

  const handleBookAppointment = () => {
    if (!userData) {
      navigate('/login');
      return;
    }
    setShowAppointmentForm(true);
    // Smooth scroll to booking form
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAppointmentSubmit = async (formData: any) => {
    if (!userData || !artist) return;

    try {
      await createAppointment({
        clientId: userData.uid,
        artistId: artist.uid,
        ...formData
      });

      setShowAppointmentForm(false);
      navigate('/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleMessage = async () => {
    if (!userData) {
      navigate('/login');
      return;
    }

    if (!isFollowing(artist!.uid)) {
      return;
    }

    try {
      const chatId = await createOrGetChat(userData.uid, artist!.uid);
      navigate(`/messages?chat=${chatId}`);
    } catch (error) {
      console.error('Error creating/getting chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-600">Artist not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">{artist.fullName}</h1>
            <p className="text-lg sm:text-xl text-gray-600">{artist.studioName}</p>
            <p className="text-sm text-gray-500 mt-2">{artist.email}</p>
            <div className="flex items-center text-gray-600 mt-2">
              <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="break-words">{artist.city} • {artist.address}</span>
            </div>
            <div className="mt-4">
              <StarRating rating={averageRating} count={ratingCount} size="lg" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {artist.styles.map((style) => (
                <span
                  key={style}
                  className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {userData && userData.uid !== artist.uid && (
              <>
                <button
                  onClick={() => isFollowing(artist.uid) ? unfollowArtist(artist.uid) : followArtist(artist.uid)}
                  className={`px-4 sm:px-6 py-2 rounded-lg transition flex items-center ${
                    isFollowing(artist.uid)
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Users className="h-5 w-5 mr-2" />
                  {isFollowing(artist.uid) ? 'Unfollow' : 'Follow'}
                </button>
                {isFollowing(artist.uid) && (
                  <button
                    onClick={handleMessage}
                    className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Message
                  </button>
                )}
                {userData.role === 'client' && (
                  <button
                    onClick={handleBookAppointment}
                    className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {userData && userData.role === 'client' && (
          <div className="mt-6">
            <ReviewFormSimple
              artistId={uid!}
              onSuccess={() => {
                const fetchRatings = async () => {
                  const reviewsQuery = query(
                    collection(db, 'artistReviews'),
                    where('artistId', '==', uid)
                  );
                  const reviewsSnap = await getDocs(reviewsQuery);
                  let sum = 0;
                  reviewsSnap.forEach(doc => {
                    const rating = Number(doc.data().rating);
                    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
                      sum += rating;
                    }
                  });
                  const count = reviewsSnap.size;
                  setRatingCount(count);
                  setAverageRating(count > 0 ? sum / count : 0);
                };
                fetchRatings();
              }}
            />
          </div>
        )}
      </div>

      {/* Portfolio Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Portfolio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {posts.map((post) => (
            <div key={post.id} className="aspect-square rounded-lg overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form Section */}
      {showAppointmentForm && (
        <div ref={bookingFormRef} className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Book Appointment</h2>
          <AppointmentForm
            artistId={artist.uid}
            artistName={artist.fullName}
            onSubmit={handleAppointmentSubmit}
            onCancel={() => setShowAppointmentForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ArtistProfile;