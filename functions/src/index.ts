import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Initialize artistReviews collection with a test document
export const initializeArtistReviews = functions.https.onRequest(async (req, res) => {
  try {
    const db = admin.firestore();
    
    // Create test review document
    await db.collection('artistReviews').add({
      artistId: "testArtistId",
      clientId: "testClientId",
      rating: 5,
      comment: "Test review",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to initialize collection' });
  }
});

// Recalculate artist rating on review changes
export const updateArtistRating = functions.firestore
  .document('artistReviews/{reviewId}')
  .onWrite(async (change, context) => {
    const db = admin.firestore();

    // Get the artist ID from the review document
    const artistId = change.after.exists 
      ? change.after.data()?.artistId 
      : change.before.data()?.artistId;

    if (!artistId) return;

    // Get all reviews for this artist
    const reviewsSnapshot = await db.collection('artistReviews')
      .where('artistId', '==', artistId)
      .get();

    // Calculate new rating
    let totalRating = 0;
    const reviewCount = reviewsSnapshot.size;

    reviewsSnapshot.forEach(doc => {
      totalRating += doc.data().rating;
    });

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    // Update artist document
    await db.collection('users').doc(artistId).update({
      averageRating,
      ratingCount: reviewCount
    });
  });