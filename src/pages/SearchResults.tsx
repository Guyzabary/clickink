import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Users, Search, Loader, Image as ImageIcon } from 'lucide-react';
import { collection, query, where, getDocs, limit, startAfter, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import debounce from 'lodash/debounce';

interface ArtistResult {
  uid: string;
  fullName: string;
  studioName: string;
  city: string;
  bio?: string;
  styles: string[];
  recentWork?: {
    id: string;
    imageUrl: string;
    title: string;
  };
}

const RESULTS_PER_PAGE = 12;

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [artists, setArtists] = useState<ArtistResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<any>(null);
  const { userData, isFollowing, followArtist, unfollowArtist } = useAuth();

  const searchQuery = searchParams.get('q') || '';

  const fetchResults = async (isLoadMore = false) => {
    if (!searchQuery.trim()) {
      setArtists([]);
      setLoading(false);
      return;
    }

    try {
      const searchTermLower = searchQuery.toLowerCase();
      const artistsRef = collection(db, 'users');

      // Base query conditions
      const baseConditions = [
        where('role', '==', 'artist'),
        orderBy('fullNameLower'),
        limit(RESULTS_PER_PAGE)
      ];

      // Add startAfter if loading more
      if (isLoadMore && lastDocRef.current) {
        baseConditions.push(startAfter(lastDocRef.current));
      }

      // Separate queries for different fields
      const queries = [
        // Name search
        query(
          artistsRef,
          ...baseConditions,
          where('fullNameLower', '>=', searchTermLower),
          where('fullNameLower', '<=', searchTermLower + '\uf8ff')
        ),
        // Studio name search
        query(
          artistsRef,
          ...baseConditions,
          where('studioNameLower', '>=', searchTermLower),
          where('studioNameLower', '<=', searchTermLower + '\uf8ff')
        ),
        // City search
        query(
          artistsRef,
          ...baseConditions,
          where('cityLower', '>=', searchTermLower),
          where('cityLower', '<=', searchTermLower + '\uf8ff')
        ),
        // Style search
        query(
          artistsRef,
          ...baseConditions,
          where('stylesLower', 'array-contains', searchTermLower)
        )
      ];

      const results = await Promise.all(queries.map(q => getDocs(q)));

      // Combine and deduplicate results
      const uniqueResults = new Map();
      results.forEach(querySnapshot => {
        querySnapshot.docs.forEach(doc => {
          if (!uniqueResults.has(doc.id)) {
            uniqueResults.set(doc.id, {
              uid: doc.id,
              ...doc.data()
            });
            // Update last document reference
            lastDocRef.current = doc;
          }
        });
      });

      // Fetch recent work for each artist
      const artistsWithWork = await Promise.all(
        Array.from(uniqueResults.values()).map(async (artist: ArtistResult) => {
          const postsQuery = query(
            collection(db, 'posts'),
            where('artistId', '==', artist.uid),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          const postsSnapshot = await getDocs(postsQuery);
          const recentPost = postsSnapshot.docs[0];
          
          return {
            ...artist,
            recentWork: recentPost ? {
              id: recentPost.id,
              ...recentPost.data()
            } : undefined
          };
        })
      );

      if (isLoadMore) {
        setArtists(prev => [...prev, ...artistsWithWork]);
      } else {
        setArtists(artistsWithWork);
      }

      setHasMore(artistsWithWork.length === RESULTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchResults(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-600">
          {artists.length} {artists.length === 1 ? 'artist' : 'artists'} found for "{searchQuery}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <div key={artist.uid} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {artist.recentWork?.imageUrl ? (
              <div className="aspect-video">
                <img
                  src={artist.recentWork.imageUrl}
                  alt={artist.recentWork.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-300" />
              </div>
            )}
            
            <div className="p-6">
              <div className="mb-4">
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

              {artist.bio && (
                <p className="text-gray-600 mb-4 line-clamp-2">{artist.bio}</p>
              )}

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

              <div className="flex justify-between items-center">
                <Link
                  to={`/artist/${artist.uid}`}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  View Profile
                </Link>
                {userData && userData.uid !== artist.uid && (
                  <button
                    onClick={() => isFollowing(artist.uid) ? unfollowArtist(artist.uid) : followArtist(artist.uid)}
                    className={`px-4 py-2 rounded-lg transition flex items-center ${
                      isFollowing(artist.uid)
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {isFollowing(artist.uid) ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {artists.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-sm">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No artists found
            </h2>
            <p className="text-gray-500">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Load More</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;