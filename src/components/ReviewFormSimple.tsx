import React, { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { Star as FullStarIcon } from "lucide-react";

interface ReviewFormSimpleProps {
  artistId: string;
  onSuccess?: () => void;
}

const ReviewFormSimple: React.FC<ReviewFormSimpleProps> = ({ artistId, onSuccess }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  const handleSubmit = async () => {
    if (!currentUser) {
      alert("You must be signed in to write a review.");
      return;
    }
    const clientId = currentUser.uid;

    // Check if this client already reviewed this artist
    const q = query(
      collection(db, "artistReviews"),
      where("artistId", "==", artistId),
      where("clientId", "==", clientId)
    );
    const snap = await getDocs(q);

    try {
      if (!snap.empty) {
        // Update existing review
        const existingDocRef = snap.docs[0].ref;
        await updateDoc(existingDocRef, {
          rating,
          comment,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new review
        await addDoc(collection(db, "artistReviews"), {
          artistId,
          clientId,
          rating,
          comment,
          createdAt: serverTimestamp()
        });
      }

      // Clear form and notify parent
      setRating(5);
      setComment("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium mb-2">Write a Review</h3>

      {/* Star selector */}
      <div className="flex space-x-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            {star <= rating ? (
              <FullStarIcon className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            ) : (
              <FullStarIcon className="h-6 w-6 text-gray-300" />
            )}
          </button>
        ))}
      </div>

      {/* Comment textarea */}
      <textarea
        className="w-full p-2 border rounded-md mb-2"
        rows={3}
        placeholder="Add a comment (optional)…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Submit Review
      </button>
    </div>
  );
};

export default ReviewFormSimple;