import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface ArtistData {
  uid: string;
  fullName: string;
  studioName: string;
  city: string;
  styles: string[];
  recentPosts?: {
    id: string;
    imageUrl: string;
    title: string;
  }[];
}

const Following: React.FC = () => {
  const [followedArtists, setFollowedArtists] = useState<ArtistData[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, unfollowArtist } = useAuth();

  useEffect(() => {
    const fetchFollowedArtists = async () => {
      if (!userData?.followedArtists?.length) {
        setFollowedArtists([]);
        setLoading(false);
        return;
      }

      try {
        const artistsQuery = query(
          collection(db, 'users'),
          where('uid', 'in', userData.followedArtists)
        );
        const artistsSnapshot = await getDocs(artistsQuery);
        
        const artistsData = await Promise.all(
          artistsSnapshot.docs.map(async (doc) => {
            const artist = doc.data() as ArtistData;
            
            // Fetch recent posts for each artist
            const postsQuery = query(
              collection(db, 'posts'),
              where('artistId', '==', doc.id),
              where('createdAt', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
            );
            const postsSnapshot = await getDocs(postsQuery);
            const recentPosts = postsSnapshot.docs.map(post => ({
              id: post.id,
              ...post.data()
            }));

            return {
              ...artist,
              recentPosts: recentPosts.slice(0, 3) // Only show latest 3 posts
            };
          })
        );

        setFollowedArtists(artistsData);
      } catch (error) {
        console.error('Error fetching followed artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedArtists();
  }, [userData?.followedArtists]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (followedArtists.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          You're not following any artists yet
        </h2>
        <p className="text-gray-500 mb-4">
          Follow artists to see their latest work and updates
        </p>
        <Link
          to="/search"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Discover Artists
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Artists You Follow</h1>

      <div className="space-y-6">
        {followedArtists.map((artist) => (
          <div key={artist.uid} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link
                    to={`/artist/${artist.uid}`}
                    className="text-xl font-semibold hover:text-purple-600"
                  >
                    {artist.fullName}
                  </Link>
                  <p className="text-gray-600">{artist.studioName}</p>
                  <div className="flex items-center text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {artist.city}
                  </div>
                </div>
                <button
                  onClick={() => unfollowArtist(artist.uid)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition flex items-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Unfollow
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {artist.styles.map((style) => (
                  <span
                    key={style}
                    className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                  >
                    {style}
                  </span>
                ))}
              </div>

              {artist.recentPosts && artist.recentPosts.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recent Work</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {artist.recentPosts.map((post) => (
                      <div key={post.id} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Following;