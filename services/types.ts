// types.ts

export interface Incident {
  id?: string;
  type: "harassment" | "following" | "domestic_violence" | "general_fear";
  time: string;            // ISO timestamp
  locationName: string;    // human-readable location
  userMessage?: string;
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
export enum Urgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}