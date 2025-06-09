import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, X, MapPin, Share2, MoreVertical, Users } from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface Post {
  postId: string;
  artistId: string;
  artistName: string;
  studioName: string;
  city: string;
  imageUrl: string;
  title: string;
  description: string;
  createdAt: Timestamp;
  likes: string[];
  comments: Comment[];
}

interface Comment {
  userId: string;
  userName: string;
  text: string;
  timestamp: Timestamp;
}

const Gallery: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const { userData, isFollowing, followArtist, unfollowArtist } = useAuth();
  const navigate = useNavigate();

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    try {
      return format(timestamp.toDate(), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          postId: doc.id,
          ...doc.data()
        })) as Post[];

        const filteredPosts = userData
          ? postsData.filter(post => 
              post.artistId === userData.uid ||
              (userData.followedArtists && userData.followedArtists.includes(post.artistId))
            )
          : [];

        setPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userData]);

  const handleLike = async (post: Post) => {
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const postRef = doc(db, 'posts', post.postId);
      if (post.likes.includes(userData.uid)) {
        await updateDoc(postRef, {
          likes: arrayRemove(userData.uid)
        });
        setPosts(posts.map(p => 
          p.postId === post.postId 
            ? { ...p, likes: p.likes.filter(id => id !== userData.uid) }
            : p
        ));
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userData.uid)
        });
        setPosts(posts.map(p => 
          p.postId === post.postId 
            ? { ...p, likes: [...p.likes, userData.uid] }
            : p
        ));
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = async (post: Post) => {
    if (!userData) {
      navigate('/login');
      return;
    }

    const commentText = comments[post.postId]?.trim();
    if (!commentText) return;

    try {
      const newComment = {
        userId: userData.uid,
        userName: userData.fullName,
        text: commentText,
        timestamp: Timestamp.now()
      };

      const postRef = doc(db, 'posts', post.postId);
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });

      setPosts(posts.map(p => 
        p.postId === post.postId 
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      ));

      setComments(prev => ({
        ...prev,
        [post.postId]: ''
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleMessage = (artistId: string) => {
    if (!userData) {
      navigate('/login');
      return;
    }
    navigate(`/messages?artist=${artistId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          Sign in to view posts
        </h2>
        <p className="text-gray-500 mb-4">
          Follow artists to see their work in your feed
        </p>
        <Link
          to="/login"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          No posts to show
        </h2>
        <p className="text-gray-500 mb-4">
          Follow artists to see their work in your feed
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
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Feed</h1>
        <Link
          to="/gallery"
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          View Gallery Layout
        </Link>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-4 flex items-center justify-between">
              <Link
                to={`/artist/${post.artistId}`}
                className="flex items-center group"
              >
                <div>
                  <h3 className="font-semibold group-hover:text-purple-600">
                    {post.artistName}
                  </h3>
                  <div className="text-sm text-gray-500 flex items-center">
                    <span>{post.studioName}</span>
                    <span className="mx-1">•</span>
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{post.city}</span>
                  </div>
                </div>
              </Link>
              <div className="flex items-center space-x-2">
                {post.artistId !== userData.uid && (
                  <button
                    onClick={() => isFollowing(post.artistId) ? unfollowArtist(post.artistId) : followArtist(post.artistId)}
                    className={`px-3 py-1 rounded-lg transition flex items-center text-sm ${
                      isFollowing(post.artistId)
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    {isFollowing(post.artistId) ? 'Unfollow' : 'Follow'}
                  </button>
                )}
                <button
                  onClick={() => handleMessage(post.artistId)}
                  className="text-gray-500 hover:text-purple-600"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button className="text-gray-500 hover:text-purple-600">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="text-gray-500 hover:text-purple-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full aspect-square object-cover"
              onClick={() => setSelectedPost(post)}
            />

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post)}
                    className="flex items-center space-x-1"
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        userData && post.likes.includes(userData.uid)
                          ? 'text-red-500 fill-current'
                          : 'text-gray-500'
                      }`}
                    />
                    <span className="text-sm text-gray-600">
                      {post.likes.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center space-x-1 text-gray-500"
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-sm">{post.comments.length}</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-1">{post.title}</h4>
                <p className="text-gray-600">{post.description}</p>
              </div>

              {post.comments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {post.comments.slice(0, 2).map((comment, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{comment.userName}</span>
                      <span className="ml-2 text-gray-600">{comment.text}</span>
                    </div>
                  ))}
                  {post.comments.length > 2 && (
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="text-sm text-gray-500"
                    >
                      View all {post.comments.length} comments
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
                  value={comments[post.postId] || ''}
                  onChange={(e) => setComments(prev => ({
                    ...prev,
                    [post.postId]: e.target.value
                  }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleComment(post);
                    }
                  }}
                />
                <button
                  onClick={() => handleComment(post)}
                  disabled={!comments[post.postId]?.trim()}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center">
                <Link
                  to={`/artist/${selectedPost.artistId}`}
                  className="font-semibold hover:text-purple-600"
                >
                  {selectedPost.artistName}
                </Link>
                <span className="mx-2">•</span>
                <span className="text-gray-500">{selectedPost.studioName}</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid md:grid-cols-2">
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.title}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedPost.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{selectedPost.description}</p>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Comments</h4>
                    {selectedPost.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium">{comment.userName}</div>
                        <p className="text-gray-600">{comment.text}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(comment.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(selectedPost)}
                        className="flex items-center"
                      >
                        <Heart
                          className={`h-6 w-6 mr-1 ${
                            userData && selectedPost.likes.includes(userData.uid)
                              ? 'text-red-500 fill-current'
                              : 'text-gray-400'
                          }`}
                        />
                        {selectedPost.likes.length}
                      </button>
                      <button
                        onClick={() => handleMessage(selectedPost.artistId)}
                        className="flex items-center text-gray-400 hover:text-purple-600"
                      >
                        <MessageCircle className="h-6 w-6 mr-1" />
                        Message Artist
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={comments[selectedPost.postId] || ''}
                      onChange={(e) => setComments(prev => ({
                        ...prev,
                        [selectedPost.postId]: e.target.value
                      }))}
                      placeholder="Add a comment..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(selectedPost);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleComment(selectedPost)}
                      disabled={!comments[selectedPost.postId]?.trim()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;