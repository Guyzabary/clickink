import { create } from 'zustand';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  clientId: string;
  artistId: string;
  date: string;
  time: string;
  description: string;
  status: 'pending' | 'price_proposed' | 'confirmed' | 'cancelled' | 'rejected' | 'cancelled_by_client';
  price?: number;
  imageUrl?: string;
  createdAt: any;
  viewed: boolean;
  hiddenBy?: string[];
  // Contact details
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  client?: {
    fullName: string;
    email: string;
  };
  artist?: {
    fullName: string;
    studioName: string;
    city: string;
  };
}

interface AppointmentStore {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  fetchAppointments: (userId: string, role: 'client' | 'artist') => () => void;
  createAppointment: (data: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'viewed' | 'hiddenBy'>) => Promise<void>;
  proposePrice: (appointmentId: string, price: number) => Promise<void>;
  respondToPrice: (appointmentId: string, accepted: boolean) => Promise<void>;
  rejectAppointment: (appointmentId: string) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  markAppointmentsAsViewed: () => Promise<void>;
  hideAppointment: (appointmentId: string, userId: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: [],
  loading: true,
  error: null,
  unreadCount: 0,

  fetchAppointments: (userId, role) => {
    const q = query(
      collection(db, 'appointments'),
      where(role === 'client' ? 'clientId' : 'artistId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const appointmentsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data() as Appointment;
            
            // Skip appointments hidden by this user
            if (data.hiddenBy?.includes(userId)) {
              return null;
            }

            if (role === 'artist') {
              const clientDoc = await getDocs(
                query(collection(db, 'users'), where('uid', '==', data.clientId))
              );
              if (clientDoc.docs[0]) {
                data.client = clientDoc.docs[0].data() as Appointment['client'];
              }
            }
            
            if (role === 'client') {
              const artistDoc = await getDocs(
                query(collection(db, 'users'), where('uid', '==', data.artistId))
              );
              if (artistDoc.docs[0]) {
                data.artist = artistDoc.docs[0].data() as Appointment['artist'];
              }
            }

            return {
              id: doc.id,
              ...data,
              date: format(new Date(data.date), 'yyyy-MM-dd')
            };
          })
        );

        // Filter out null values (hidden appointments)
        const filteredAppointments = appointmentsData.filter((apt): apt is Appointment => apt !== null);

        const unreadCount = filteredAppointments.filter(apt => !apt.viewed).length;
        
        set({ 
          appointments: filteredAppointments,
          loading: false, 
          error: null,
          unreadCount 
        });
      } catch (error) {
        console.error('Error fetching appointments:', error);
        set({ loading: false, error: 'Failed to fetch appointments' });
      }
    });

    return unsubscribe;
  },

  createAppointment: async (data) => {
    try {
      set({ loading: true, error: null });

      await addDoc(collection(db, 'appointments'), {
        ...data,
        status: 'pending',
        viewed: false,
        hiddenBy: [],
        createdAt: serverTimestamp()
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error creating appointment:', error);
      set({ loading: false, error: 'Failed to create appointment' });
      throw error;
    }
  },

  proposePrice: async (appointmentId, price) => {
    try {
      set({ loading: true, error: null });

      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'price_proposed',
        price,
        viewed: false
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error proposing price:', error);
      set({ loading: false, error: 'Failed to propose price' });
      throw error;
    }
  },

  respondToPrice: async (appointmentId, accepted) => {
    try {
      set({ loading: true, error: null });

      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: accepted ? 'confirmed' : 'cancelled',
        viewed: false
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error responding to price:', error);
      set({ loading: false, error: 'Failed to respond to price' });
      throw error;
    }
  },

  rejectAppointment: async (appointmentId) => {
    try {
      set({ loading: true, error: null });

      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'rejected',
        viewed: false
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      set({ loading: false, error: 'Failed to reject appointment' });
      throw error;
    }
  },

  cancelAppointment: async (appointmentId) => {
    try {
      set({ loading: true, error: null });

      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled_by_client',
        viewed: false
      });

      set({ loading: false });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      set({ loading: false, error: 'Failed to cancel appointment' });
      throw error;
    }
  },

  hideAppointment: async (appointmentId, userId) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      const appointmentDoc = await getDocs(
        query(collection(db, 'appointments'), where('__name__', '==', appointmentId))
      );
      
      if (appointmentDoc.docs[0]) {
        const currentHiddenBy = appointmentDoc.docs[0].data().hiddenBy || [];
        await updateDoc(appointmentRef, {
          hiddenBy: [...currentHiddenBy, userId]
        });
      }
    } catch (error) {
      console.error('Error hiding appointment:', error);
      throw error;
    }
  },

  markAppointmentsAsViewed: async () => {
    const { appointments } = get();
    try {
      await Promise.all(
        appointments
          .filter(apt => !apt.viewed)
          .map(apt => 
            updateDoc(doc(db, 'appointments', apt.id), {
              viewed: true
            })
          )
      );
    } catch (error) {
      console.error('Error marking appointments as viewed:', error);
    }
  }
}));