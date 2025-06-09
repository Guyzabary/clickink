export interface User {
  id: string;
  name: string;
  email: string;
  type: 'client' | 'artist';
  profileImage?: string;
}

export interface TattooDesign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  artistId: string;
  tags: string[];
}

export interface Appointment {
  id: string;
  clientId: string;
  artistId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  designId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}