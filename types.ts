
export enum Urgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Location {
  lat: number;
  lng: number;
  area: string;
}

export interface Incident {
  id: string;
  type: string;
  location: Location;
  time: string;
  dayOfWeek: string;
  category: string;
  resolvedBy: string;
  urgency: Urgency;
  urgencyScore: number; // 1-10
  description: string;
  status: 'open' | 'accepted' | 'on-scene' | 'resolved';
  userText?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  isAvailable: boolean;
  status: 'idle' | 'busy' | 'en-route';
  location: { lat: number; lng: number };
  gender: 'female' | 'male' | 'non-binary';
  rating: number;
}

export interface SmsMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: Date;
}

export interface PredictiveInsight {
  pattern: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  when: string;
  where: string;
  prevention: string;
}
