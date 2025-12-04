
import { Sentence, ReviewItem } from "../convex/backend/types";
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * OfflineCache Utility
 * 
 * Provides a persistence layer for offline functionality.
 * 
 * ADAPTER NOTE:
 * Uses `@react-native-async-storage/async-storage` for persistence.
 */

// --------------------------------------------------------------------------
// Constants & Keys
// --------------------------------------------------------------------------

const STORAGE_KEYS = {
  SENTENCES: 'mandarin_mine_sentences_v1',
  REVIEW_DECK: 'mandarin_mine_deck_v1',
  PENDING_SYNC: 'mandarin_mine_pending_sync_v1',
  LAST_SYNC: 'mandarin_mine_last_sync_timestamp',
};

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface PendingReviewAction {
  id: string; // UUID for the action
  itemId: string; // The ID of the item reviewed
  itemType: "sentence" | "grammar" | "character";
  grade: number; // 0-5
  timestamp: number;
}

// --------------------------------------------------------------------------
// Storage Engine (AsyncStorage Interface)
// --------------------------------------------------------------------------

const Storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error("Storage Read Error:", e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("Storage Write Error:", e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Storage Delete Error:", e);
    }
  }
};

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

export const OfflineCache = {

  // --- Sentences ---

  /**
   * Saves a batch of sentences to local storage for offline reading.
   * Typically called after a successful `fetchSentences` query.
   */
  async saveSentences(sentences: Sentence[]): Promise<void> {
    if (!sentences || sentences.length === 0) return;
    const json = JSON.stringify(sentences);
    await Storage.setItem(STORAGE_KEYS.SENTENCES, json);
    console.debug(`[OfflineCache] Saved ${sentences.length} sentences.`);
  },

  /**
   * Retrieves cached sentences.
   * Returns empty array if nothing is cached.
   */
  async loadSentences(): Promise<Sentence[]> {
    const json = await Storage.getItem(STORAGE_KEYS.SENTENCES);
    if (!json) return [];
    try {
      return JSON.parse(json) as Sentence[];
    } catch {
      return [];
    }
  },

  // --- Review Deck ---

  /**
   * Saves the user's current review deck (SRS state).
   */
  async saveReviewDeck(deck: ReviewItem[]): Promise<void> {
    const json = JSON.stringify(deck);
    await Storage.setItem(STORAGE_KEYS.REVIEW_DECK, json);
    console.debug(`[OfflineCache] Saved ${deck.length} review items.`);
  },

  /**
   * Loads the review deck for offline practice.
   */
  async loadReviewDeck(): Promise<ReviewItem[]> {
    const json = await Storage.getItem(STORAGE_KEYS.REVIEW_DECK);
    if (!json) return [];
    try {
      return JSON.parse(json) as ReviewItem[];
    } catch {
      return [];
    }
  },

  // --- Sync Queue (Offline Actions) ---

  /**
   * Queues a review action (grade) performed while offline.
   * These will be sent to the backend when connection is restored.
   */
  async queuePendingReview(action: Omit<PendingReviewAction, "id" | "timestamp">): Promise<void> {
    const pending = await this.getPendingReviews();

    const newAction: PendingReviewAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    pending.push(newAction);
    await Storage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
    console.debug(`[OfflineCache] Queued review for item ${action.itemId}`);
  },

  /**
   * Returns all pending actions waiting to be synced.
   */
  async getPendingReviews(): Promise<PendingReviewAction[]> {
    const json = await Storage.getItem(STORAGE_KEYS.PENDING_SYNC);
    if (!json) return [];
    try {
      return JSON.parse(json) as PendingReviewAction[];
    } catch {
      return [];
    }
  },

  /**
   * Clears the pending queue. 
   * Call this ONLY after successfully sending data to the backend.
   */
  async clearPendingReviews(): Promise<void> {
    await Storage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    console.debug(`[OfflineCache] Pending queue cleared.`);
  },

  // --- Sync State ---

  async setLastSyncTime(timestamp: number): Promise<void> {
    await Storage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
  },

  async getLastSyncTime(): Promise<number | null> {
    const val = await Storage.getItem(STORAGE_KEYS.LAST_SYNC);
    return val ? parseInt(val, 10) : null;
  }
};
