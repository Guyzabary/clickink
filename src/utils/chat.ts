import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

export const createOrGetChat = async (userId: string, artistId: string) => {
  try {
    // Check for existing chat
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);
    const existingChat = querySnapshot.docs.find(doc => 
      doc.data().participants.includes(artistId)
    );

    if (existingChat) {
      return existingChat.id;
    }

    // Create new chat
    const newChatRef = await addDoc(chatsRef, {
      participants: [userId, artistId],
      createdAt: Timestamp.now(),
      lastMessageAt: Timestamp.now(),
      lastMessage: '',
      readBy: [userId]
    });

    return newChatRef.id;
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    throw error;
  }
};

export const formatChatTimestamp = (timestamp: any): string => {
  if (!timestamp) return '';
  
  try {
    if (timestamp instanceof Timestamp) {
      return format(timestamp.toDate(), 'MMM d, h:mm a');
    }
    if (timestamp.seconds) {
      return format(new Date(timestamp.seconds * 1000), 'MMM d, h:mm a');
    }
    return format(new Date(timestamp), 'MMM d, h:mm a');
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
};