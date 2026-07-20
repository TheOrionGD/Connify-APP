export enum ConnifyPage {
  PROTOCOL_FEATURES = 'PROTOCOL_FEATURES',
  URGENT_SERENITY = 'URGENT_SERENITY',
  HOW_IT_WORKS = 'HOW_IT_WORKS',
  SAFETY_COORDINATED = 'SAFETY_COORDINATED',
  GOVERNANCE = 'GOVERNANCE',
  DOWNLOAD_APK = 'DOWNLOAD_APK',
  ADMIN_PORTAL = 'ADMIN_PORTAL',
}

export interface Guardian {
  id: string;
  name: string;
  distance: number; // in meters
  status: 'idle' | 'notified' | 'responding' | 'arrived';
  avatar: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'protocol' | 'privacy' | 'community' | 'hardware';
  votesFor: number;
  votesAgainst: number;
  status: 'active' | 'passed' | 'defeated';
}

export interface SafetyRule {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  triggerType: 'timer' | 'geofence' | 'deviation' | 'heartrate';
  triggerValue: string;
}

export interface SafeSpot {
  id: string;
  name: string;
  type: 'business' | 'shelter' | 'police' | 'guardian_node';
  lat: number;
  lng: number;
  status: 'active' | 'closed';
}
