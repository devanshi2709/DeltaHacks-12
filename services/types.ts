// types.ts

export interface Incident {
  id: string;
  type: string;
  location: {
    area: string;
    lat: number;
    lng: number;
  };
  time: string;
  dayOfWeek: string;
  category: string;
  urgency: Urgency;
  urgencyScore: number;
  description: string;
  resolvedBy?: string;
  status: 'open' | 'accepted' | 'resolved';
}


export interface PredictiveInsight {
  pattern: string;        // short title
  risk: "Low" | "Medium" | "High";
  when: string;           // e.g. "Fridays 9–11 PM"
  where: string;          // location name
  prevention: string;    // suggested action
}
export interface SmsMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: Date;
}
export interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  isAvailable: boolean;
  location: {
    lat: number;
    lng: number;
  };
  gender: string;
  rating: number;
  status: 'idle' | 'busy' | 'offline'; // <-- ADD THIS
}
export enum Urgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}