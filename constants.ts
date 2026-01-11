// constants.ts
import { Incident, PredictiveInsight, Volunteer, Urgency } from "./services/types";

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'harassment',
    locationName: 'Beasley North',
    time: '2026-01-06T22:30',
    userMessage: 'User reported being followed while walking from Main St.',
  },
  {
    id: '2',
    type: 'general_fear',
    locationName: 'Jackson Square',
    time: '2026-01-09T19:15',
    userMessage: 'Suspicious individual loitering near the bus terminal.',
  },
  {
    id: '3',
    type: 'harassment',
    locationName: 'Main St & James',
    time: '2026-01-10T01:45',
    userMessage: 'Multiple reports of harassment near bar closing.',
  },
];

export const MOCK_VOLUNTEERS: Volunteer[] = [
  {
    id: 'v1',
    name: 'Sarah M.',
    skills: ['de-escalation', 'first-aid'],
    isAvailable: true,
    location: { lat: 43.2560, lng: -79.8680 },
    gender: 'female',
    rating: 4.9,
  },
  {
    id: 'v2',
    name: 'Maria R.',
    skills: ['crisis-counseling'],
    isAvailable: true,
    location: { lat: 43.2580, lng: -79.8695 },
    gender: 'female',
    rating: 5.0,
  },
  {
    id: 'v3',
    name: 'Jessica T.',
    skills: ['legal-advocacy'],
    isAvailable: false,
    location: { lat: 43.2550, lng: -79.8720 },
    gender: 'female',
    rating: 4.8,
  },
];

export const MOCK_PREDICTIVE_INSIGHTS: PredictiveInsight[] = [
  {
    pattern: 'Late-night harassment at Beasley North Bus Stop',
    risk: 'High',
    when: 'Fridays 9–11 PM',
    where: 'Beasley North',
    prevention: 'Dispatch 2 volunteers during peak hours, increase lighting in area.'
  },
  {
    pattern: 'Suspicious activity at Jackson Square',
    risk: 'Medium',
    when: 'Weeknights 7–8 PM',
    where: 'Jackson Square',
    prevention: 'Assign monitoring volunteer and alert nearby users.'
  },
  {
    pattern: 'Isolated harassment near Main St & James',
    risk: 'Low',
    when: 'Saturday 1–2 AM',
    where: 'Main St & James',
    prevention: 'Volunteer check-ins recommended.'
  }
];

export const APP_THEME = {
  primary: '#7c3aed',
  secondary: '#db2777',
  accent: '#f43f5e',
  background: '#f8fafc',
  text: '#1e293b'
};
