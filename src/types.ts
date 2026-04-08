export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  landlordId: string;
  landlordName: string;
  landlordContact: string;
  details: {
    water: boolean;
    garden: boolean;
    electricity: boolean;
    parking: boolean;
    [key: string]: boolean;
  };
  createdAt: number;
  views?: number;
  clicks?: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  participants: string[];
  listingId?: string;
  lastMessage?: string;
  lastTimestamp?: number;
  messages: Message[];
}

export type AppLanguage = 'English' | 'Hindi' | 'Marathi' | 'Gujarati' | 'Tamil' | 'Telugu' | 'Kannada' | 'Bengali' | 'Punjabi' | 'Malayalam';
