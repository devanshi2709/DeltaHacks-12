// constants.ts
import { Incident, PredictiveInsight, Volunteer, Urgency } from "./services/types";

//
// INCIDENT MOCK DATA — New Schema (demo-friendly + predictable patterns)
//

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
  },
  {
    id: '1044',
    type: 'unsafe_situation_reported',
    location: { area: 'Jackson Square', lat: 43.2569, lng: -79.8691 },
    time: '22:55',
    dayOfWeek: 'Friday',
    category: 'HARASSMENT',
    urgency: Urgency.HIGH,
    urgencyScore: 8,
    description: 'someone shouted obscene stuff while passing',
    status: 'open'
  },
  {
    id: '1045',
    type: 'unsafe_situation_reported',
    location: { area: 'Beasley North', lat: 43.2573, lng: -79.8683 },
    time: '22:15',
    dayOfWeek: 'Friday',
    category: 'FOLLOWED',
    urgency: Urgency.HIGH,
    urgencyScore: 9,
    description: 'guy waiting near bus stop stared for minutes',
    status: 'open'
  },
  {
    id: '1046',
    type: 'unsafe_situation_reported',
    location: { area: 'Main St & James', lat: 43.2571, lng: -79.8707 },
    time: '01:30',
    dayOfWeek: 'Saturday',
    category: 'HARASSMENT',
    urgency: Urgency.LOW,
    urgencyScore: 3,
    description: 'group yelling while bars closing',
    status: 'resolved'
  },
  {
    id: '1047',
    type: 'unsafe_situation_reported',
    location: { area: 'Jackson Square', lat: 43.2569, lng: -79.8691 },
    time: '19:05',
    dayOfWeek: 'Wednesday',
    category: 'SUSPICIOUS ACTIVITY',
    urgency: Urgency.MEDIUM,
    urgencyScore: 5,
    description: 'someone pacing near bus terminal for 20 mins',
    status: 'open'
  }
];

//
// VOLUNTEERS MOCK DATA — Matches UI + eventual geospatial logic
//

export const MOCK_VOLUNTEERS: Volunteer[] = [
  {
    id: 'v1',
    name: 'Sarah M.',
    skills: ['de-escalation', 'first-aid'],
    isAvailable: true,
    status: 'busy',
    location: { lat: 43.2560, lng: -79.8680 },
    gender: 'female',
    rating: 4.9,
  },
  {
    id: 'v2',
    name: 'Maria R.',
    skills: ['crisis-counseling'],
    isAvailable: true,
    status: 'idle',
    location: { lat: 43.2580, lng: -79.8695 },
    gender: 'female',
    rating: 5.0,
  },
  {
    id: 'v3',
    name: 'Jessica T.',
    skills: ['legal-advocacy'],
    isAvailable: true,
    status: 'idle',
    location: { lat: 43.2550, lng: -79.8720 },
    gender: 'female',
    rating: 4.8,
  }
];

//
// PREDICTIVE INSIGHTS — Makes the dashboard look "smart" for judges
//

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
    pattern: 'Rising discomfort near Main St & James during bar closing',
    risk: 'Low',
    when: 'Saturday 1–2 AM',
    where: 'Main St & James',
    prevention: 'Volunteer check-ins recommended.'
  }
];

//
// THEME — UI cohesion (keeps aesthetic consistent)
//

export const APP_THEME = {
  primary: '#7c3aed',
  secondary: '#db2777',
  accent: '#f43f5e',
  background: '#f8fafc',
  text: '#1e293b'
};
