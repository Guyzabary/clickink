import { create } from 'zustand';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface Review {
  id: string;
  artistId: string;
  clientId: string;
  rating: number;
  comment?: string;
  createdAt: any;
}

interface ReviewStore {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  fetchReviews: (artistId: string) => () => void;
  submitReview: (artistId: string, clientId: string, rating: number, comment?: string) => Promise<void>;
  updateReview: (reviewId: string, rating: number, comment?: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  getUserReview: (artistId: string, clientId: string) => Promise<Review | null>;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  reviews: [],
  loading: false,
  error: null,

  fetchReviews: (artistId) => {
    const q = query(
      collection(db, 'artistReviews'),
      where('artistId', '==', artistId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      set({ reviews, loading: false });
    });

    return unsubscribe;
  },

  submitReview: async (artistId, clientId, rating, comment) => {
    try {
      set({ loading: true, error: null });

      // Check for existing review
      const existingReview = await get().getUserReview(artistId, clientId);
      
      if (existingReview) {
        await updateDoc(doc(db, 'artistReviews', existingReview.id), {
          rating,
          comment,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'artistReviews'), {
          artistId,
          clientId,
          rating,
          comment,
          createdAt: new Date()
        });
      }

      set({ loading: false });
    } catch (error) {
      console.error('Error submitting review:', error);
      set({ loading: false, error: 'Failed to submit review' });
      throw error;
    }
  },

  updateReview: async (reviewId, rating, comment) => {
    try {
      set({ loading: true, error: null });

      await updateDoc(doc(db, 'artistReviews', reviewId), {
        rating,
        comment,
        updatedAt: new Date()
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error updating review:', error);
      set({ loading: false, error: 'Failed to update review' });
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      set({ loading: true, error: null });

      await deleteDoc(doc(db, 'artistReviews', reviewId));

      set({ loading: false });
    } catch (error) {
      console.error('Error deleting review:', error);
      set({ loading: false, error: 'Failed to delete review' });
      throw error;
    }
  },

  getUserReview: async (artistId, clientId) => {
    try {
      const q = query(
        collection(db, 'artistReviews'),
        where('artistId', '==', artistId),
        where('clientId', '==', clientId)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Review;
    } catch (error) {
      console.error('Error getting user review:', error);
      return null;
    }
  }
}));