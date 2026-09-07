import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type ConnectivityListener = (isOnline: boolean) => void;

class ConnectivityService {
  private _isOnline: boolean = true; // Assume true initially
  private listeners: ConnectivityListener[] = [];
  private unsubscribeNetInfo: (() => void) | null = null;

  public init() {
    if (this.unsubscribeNetInfo) return; // Already initialized

    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      // isInternetReachable can be null on first load or if unable to determine. 
      // Defaulting to isConnected if isInternetReachable is strictly false to mean "offline"
      const currentlyOnline = state.isConnected && state.isInternetReachable !== false;
      
      if (currentlyOnline !== this._isOnline) {
        this._isOnline = !!currentlyOnline;
        this.emit(this._isOnline);
      }
    });

    // Fetch initial state
    NetInfo.fetch().then((state) => {
      const currentlyOnline = state.isConnected && state.isInternetReachable !== false;
      this._isOnline = !!currentlyOnline;
    });
  }

  public get isOnline(): boolean {
    return this._isOnline;
  }

  public subscribe(listener: ConnectivityListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(isOnline: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (err) {
        console.error('Error in ConnectivityService listener:', err);
      }
    });
  }

  public destroy() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    this.listeners = [];
  }
}

export const connectivityService = new ConnectivityService();
// Automatically initialize on import for app-wide single source of truth
connectivityService.init();
