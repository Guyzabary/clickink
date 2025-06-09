import { create } from 'zustand';
import { collection, query, where, onSnapshot, orderBy, Timestamp, addDoc, updateDoc, doc, getDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { uploadChatImage } from '../utils/storage';

interface Message {
  id: string;
  content: string;
  imageUrl?: string;
  senderId: string;
  senderName: string;
  createdAt: Timestamp;
}

interface Chat {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  lastMessage: string;
  lastMessageAt: Timestamp;
  readBy: string[];
}

interface MessageStore {
  chats: Chat[];
  currentChat: string | null;
  messages: Message[];
  unreadCount: number;
  setCurrentChat: (chatId: string | null) => void;
  sendMessage: (chatId: string, content: string, senderId: string, senderName: string, image?: File) => Promise<void>;
  markChatAsRead: (chatId: string, userId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  initializeMessageListener: (userId: string) => () => void;
  fetchParticipantNames: (chatId: string, participants: string[]) => Promise<void>;
}

export const useMessageStore = create<MessageStore>((set, get) => {
  let messagesUnsubscribe: (() => void) | undefined;

  return {
    chats: [],
    currentChat: null,
    messages: [],
    unreadCount: 0,

    setCurrentChat: (chatId) => {
      // Clean up previous messages listener if it exists
      if (messagesUnsubscribe) {
        messagesUnsubscribe();
        messagesUnsubscribe = undefined;
      }

      set({ currentChat: chatId });
      
      if (chatId) {
        const messagesQuery = query(
          collection(db, `chats/${chatId}/messages`),
          orderBy('createdAt', 'asc')
        );

        messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[];
          set({ messages });
        });
      } else {
        set({ messages: [] });
      }
    },

    sendMessage: async (chatId, content, senderId, senderName, image?: File) => {
      try {
        let imageUrl: string | undefined;

        if (image) {
          imageUrl = await uploadChatImage(image, (progress) => {
            console.log('Upload progress:', progress);
          });
        }

        const messageData: any = {
          content,
          senderId,
          senderName,
          createdAt: Timestamp.now()
        };

        if (imageUrl) {
          messageData.imageUrl = imageUrl;
        }

        await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
        
        const lastMessage = imageUrl ? '📷 Image' : content;
        
        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage,
          lastMessageAt: Timestamp.now(),
          lastMessageFrom: senderId,
          readBy: [senderId]
        });
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },

    markChatAsRead: async (chatId, userId) => {
      try {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (chatDoc.exists()) {
          const currentReadBy = chatDoc.data().readBy || [];
          if (!currentReadBy.includes(userId)) {
            await updateDoc(chatRef, {
              readBy: [...currentReadBy, userId]
            });
          }
        }
      } catch (error) {
        console.error('Error marking chat as read:', error);
      }
    },

    deleteChat: async (chatId) => {
      try {
        // Delete all messages in the chat
        const messagesQuery = query(collection(db, `chats/${chatId}/messages`));
        const messagesSnapshot = await getDocs(messagesQuery);
        await Promise.all(messagesSnapshot.docs.map(doc => deleteDoc(doc.ref)));

        // Delete the chat document
        await deleteDoc(doc(db, 'chats', chatId));

        // Update local state
        set(state => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          messages: state.currentChat === chatId ? [] : state.messages,
          currentChat: state.currentChat === chatId ? null : state.currentChat
        }));
      } catch (error) {
        console.error('Error deleting chat:', error);
        throw error;
      }
    },

    fetchParticipantNames: async (chatId, participants) => {
      try {
        const participantNames: { [key: string]: string } = {};
        
        await Promise.all(participants.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            participantNames[userId] = userDoc.data().fullName;
          }
        }));

        set(state => ({
          chats: state.chats.map(chat => 
            chat.id === chatId
              ? { ...chat, participantNames }
              : chat
          )
        }));
      } catch (error) {
        console.error('Error fetching participant names:', error);
      }
    },

    initializeMessageListener: (userId) => {
      let chatsUnsubscribe: (() => void) | undefined;

      if (chatsUnsubscribe) {
        chatsUnsubscribe();
      }

      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );

      chatsUnsubscribe = onSnapshot(q, async (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chat[];

        let unreadCount = 0;
        chats.forEach(chat => {
          if (chat.lastMessageFrom !== userId && !chat.readBy?.includes(userId)) {
            unreadCount++;
          }
        });

        set({ chats, unreadCount });

        // Fetch participant names for each chat
        chats.forEach(chat => {
          get().fetchParticipantNames(chat.id, chat.participants);
        });
      });

      // Return cleanup function
      return () => {
        if (chatsUnsubscribe) {
          chatsUnsubscribe();
        }
        if (messagesUnsubscribe) {
          messagesUnsubscribe();
        }
      };
    }
  };
});