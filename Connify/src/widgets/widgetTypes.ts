export interface WidgetData {
  isAuthenticated: boolean;
  isOnline: boolean;
  protectionStatus: 'READY' | 'OFFLINE' | 'UNAUTHENTICATED' | 'ACTIVE_EPISODE' | 'UNAVAILABLE';
  statusText: string;
  nearbyHelpersCount: number;
  guardianName: string;
  guardianPhone: string;
  activeEpisodeId?: string;
  lastUpdated: string;
}

export const DEFAULT_WIDGET_DATA: WidgetData = {
  isAuthenticated: false,
  isOnline: true,
  protectionStatus: 'UNAUTHENTICATED',
  statusText: 'Sign in Required',
  nearbyHelpersCount: 0,
  guardianName: '',
  guardianPhone: '',
  lastUpdated: new Date().toISOString(),
};
