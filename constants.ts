import { Incident, Urgency, Volunteer } from "./services/types";

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'unsafe_situation_reported',
    location: { area: 'Beasley North', lat: 43.2570, lng: -79.8660 },
    time: '22:30',
    dayOfWeek: 'Friday',
    category: 'harassment',
    resolvedBy: 'safety_escort',
    urgency: Urgency.MEDIUM,
    urgencyScore: 5,
    description: 'User reported being followed while walking from Main St.',
    status: 'resolved'
  },
  {
    id: '2',
    type: 'unsafe_situation_reported',
    location: { area: 'Jackson Square', lat: 43.2575, lng: -79.8700 },
    time: '19:15',
    dayOfWeek: 'Monday',
    category: 'suspicious_activity',
    resolvedBy: 'peer_buddy',
    urgency: Urgency.LOW,
    urgencyScore: 2,
    description: 'Suspicious individual loitering near the bus terminal.',
    status: 'open'
  },
  {
    id: '3',
    type: 'crisis_intervention',
    location: { area: 'Main St & James', lat: 43.2555, lng: -79.8715 },
    time: '01:45',
    dayOfWeek: 'Saturday',
    category: 'harassment',
    resolvedBy: 'emergency_volunteer',
    urgency: Urgency.CRITICAL,
    urgencyScore: 10,
    description: 'Multiple reports of harassment near bar closing.',
    status: 'accepted'
  }
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
    status: 'idle'
  },
  {
    id: 'v2',
    name: 'Maria R.',
    skills: ['crisis-counseling'],
    isAvailable: true,
    location: { lat: 43.2580, lng: -79.8695 },
    gender: 'female',
    rating: 5.0,
    status: 'idle'
  },
  {
    id: 'v3',
    name: 'Jessica T.',
    skills: ['legal-advocacy'],
    isAvailable: false,
    location: { lat: 43.2550, lng: -79.8720 },
    gender: 'female',
    rating: 4.8,
    status: 'offline'
  }
];

export const APP_THEME = {
  primary: '#7c3aed', // Purple
  secondary: '#db2777', // Pink
  accent: '#f43f5e', // Rose
  background: '#f8fafc',
  text: '#1e293b'
};
