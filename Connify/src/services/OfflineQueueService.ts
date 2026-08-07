import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Alert } from 'react-native';
import { connectivityService } from './ConnectivityService';

const QUEUE_STORAGE_KEY = 'CONNIFY_OFFLINE_QUEUE';

export interface QueuedItem {
  id: string; // unique id
  type: string;
  payload: any;
  createdAt: number; // Unix timestamp
  maxAge?: number; // In milliseconds
}

export type QueueHandler = (payload: any) => Promise<void>;

class OfflineQueueService {
  private queue: QueuedItem[] = [];
  private handlers: Map<string, QueueHandler> = new Map();
  private isFlushing = false;
  private initialized = false;

  constructor() {
    // We will initialize in init() to make sure AsyncStorage is ready
  }

  public async init() {
    if (this.initialized) return;
    await this.loadQueue();
    this.initialized = true;

    // Listen to AppState (foreground)
    if (AppState?.addEventListener) {
      AppState.addEventListener('change', this.handleAppStateChange);
    }

    // Listen to ConnectivityService (came back online)
    connectivityService.subscribe((isOnline) => {
      if (isOnline) {
        this.flush();
      }
    });
  }

  public registerHandler(type: string, handler: QueueHandler) {
    this.handlers.set(type, handler);
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        // Sort oldest first (smallest createdAt)
        this.queue.sort((a, b) => a.createdAt - b.createdAt);
      }
    } catch (err) {
      console.error('Failed to load offline queue:', err);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.error('Failed to save offline queue:', err);
    }
  }

  public async enqueue(type: string, payload: any, maxAgeMs?: number) {
    if (!this.initialized) await this.init();

    const item: QueuedItem = {
      id: Math.random().toString(36).substring(2, 10) + Date.now().toString(),
      type,
      payload,
      createdAt: Date.now(),
      maxAge: maxAgeMs,
    };

    this.queue.push(item);
    // Keep it oldest-first
    this.queue.sort((a, b) => a.createdAt - b.createdAt);
    await this.saveQueue();
    
    // If we're already online when enqueue is called, try to flush immediately
    if (connectivityService.isOnline) {
      this.flush();
    }
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && connectivityService.isOnline) {
      this.flush();
    }
  };

  public async flush() {
    if (this.isFlushing || !this.initialized) return;
    if (!connectivityService.isOnline) return;

    this.isFlushing = true;
    let queueChanged = false;

    // Create a copy to iterate
    const currentQueue = [...this.queue];
    
    for (const item of currentQueue) {
      // Check staleness
      if (item.maxAge !== undefined) {
        const age = Date.now() - item.createdAt;
        if (age > item.maxAge) {
          // It's stale! Surface a warning to the user
          await this.handleStaleItem(item);
          // Assuming we remove it from queue after showing warning (or the user decides in the alert)
          // We'll pause this queue flush until user resolves, or just remove it.
          // For simplicity and to not block the flush without user input, we will pop a dialogue
          // but we will also remove it from the immediate queue so it doesn't block.
          // Let's implement a robust way: ask user. We use a Promise wrapper around Alert.
          const proceed = await this.askUserAboutStaleItem(item);
          if (!proceed) {
            this.removeFromQueue(item.id);
            queueChanged = true;
            continue; // Skip processing
          } else {
            // User said proceed anyway, so we update createdAt to reset staleness
            item.createdAt = Date.now(); 
            // We don't continue; we let it process below
          }
        }
      }

      const handler = this.handlers.get(item.type);
      if (!handler) {
        console.warn(`No handler registered for offline queue type: ${item.type}`);
        // Cannot process, remove it? No, keep it in case handler is registered later.
        break; // Stop flush on first failure to preserve ordering
      }

      try {
        await handler(item.payload);
        // Success: remove from queue
        this.removeFromQueue(item.id);
        queueChanged = true;
      } catch (err) {
        console.error(`Failed to process queued item ${item.type}:`, err);
        // Leave in queue, stop flush
        break; 
      }
    }

    if (queueChanged) {
      await this.saveQueue();
    }
    
    this.isFlushing = false;
  }

  private removeFromQueue(id: string) {
    this.queue = this.queue.filter(q => q.id !== id);
  }

  private askUserAboutStaleItem(item: QueuedItem): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Outdated Action Detected',
        `A previously saved offline action (${item.type}) is now outdated. Do you still want to submit it?`,
        [
          { text: 'Discard', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Submit Anyway', onPress: () => resolve(true) }
        ],
        { cancelable: false }
      );
    });
  }

  private async handleStaleItem(item: QueuedItem) {
    // Kept as a separate function in case we want non-blocking behavior later
  }
}

export const offlineQueueService = new OfflineQueueService();
// Initialize immediately so listeners are attached
offlineQueueService.init();
