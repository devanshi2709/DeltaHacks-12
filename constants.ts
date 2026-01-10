
import { Incident, Urgency, Volunteer } from './types';

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1042',
    type: 'unsafe_situation_reported',
    location: { area: 'Main & Jackson', lat: 43.2557, lng: -79.8711 },
    time: '22:41',
    dayOfWeek: 'Friday',
    category: 'FOLLOWED',
    resolvedBy: '',
    urgency: Urgency.HIGH,
    urgencyScore: 9,
    description: 'someone behind me for 2 blocks',
    status: 'open'
  },
  {
    id: '1043',
    type: 'unsafe_situation_reported',
    location: { area: 'King & James', lat: 43.2575, lng: -79.8700 },
    time: '23:10',
    dayOfWeek: 'Friday',
    category: 'ESCORT REQUEST',
    resolvedBy: 'Sarah M.',
    urgency: Urgency.MEDIUM,
    urgencyScore: 6,
    description: 'Walking home from campus, feel uneasy.',
    status: 'accepted'
  }
];

export const MOCK_VOLUNTEERS: Volunteer[] = [
  {
    id: 'v1',
    name: 'Sarah M.',
    skills: ['de-escalation', 'first-aid'],
    isAvailable: true,
    status: 'busy',
    location: { lat: 43.2560, lng: -79.8680 },
    gender: 'female',
    rating: 4.9
  },
  {
    id: 'v2',
    name: 'Maria R.',
    skills: ['crisis-counseling'],
    isAvailable: true,
    status: 'idle',
    location: { lat: 43.2580, lng: -79.8695 },
    gender: 'female',
    rating: 5.0
  },
  {
    id: 'v3',
    name: 'Jessica T.',
    skills: ['legal-advocacy'],
    isAvailable: true,
    status: 'idle',
    location: { lat: 43.2550, lng: -79.8720 },
    gender: 'female',
    rating: 4.8
  }
];

export const APP_THEME = {
  primary: '#7c3aed', 
  secondary: '#db2777',
  accent: '#f43f5e',
  background: '#f8fafc',
  text: '#1e293b'
};
