
/**
 * AudioService
 * 
 * A Singleton service for managing audio playback, caching, and preloading.
 * Designed for sentence mining apps where rapid, reliable audio playback is critical.
 * 
 * Features:
 * - Play/Pause control
 * - Variable playback speed (0.5x - 2.0x)
 * - Offline caching using Browser Cache API
 * - Preloading next assets
 */

export class AudioService {
  private static instance: AudioService;
  private audioContext: HTMLAudioElement;
  private playbackRate: number = 1.0;
  private currentUrl: string | null = null;
  private cacheName = 'mandarin-mine-audio-v1';

  private constructor() {
    this.audioContext = new Audio();
    // Default settings
    this.audioContext.preload = "auto";
  }

  /**
   * Access the singleton instance.
   */
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // ------------------------------------------------------------------------
  // Playback Control
  // ------------------------------------------------------------------------

  /**
   * Plays audio from a URL. 
   * Stops any currently playing audio.
   * Checks cache first before network request.
   */
  async play(url: string): Promise<void> {
    try {
      // 1. Resolve URL (Cache or Network)
      const playableUrl = await this.getOrDownloadAudio(url);
      
      // 2. Setup Audio Context
      // If playing the same URL, just restart, otherwise switch source
      if (this.currentUrl !== url || !this.audioContext.src) {
        this.currentUrl = url;
        this.audioContext.src = playableUrl;
        this.audioContext.playbackRate = this.playbackRate;
      } else {
        this.audioContext.currentTime = 0;
      }

      // 3. Play
      await this.audioContext.play();

    } catch (error) {
      console.error("[AudioService] Playback failed:", error);
      throw error;
    }
  }

  /**
   * Pauses current playback.
   */
  pause(): void {
    if (!this.audioContext.paused) {
      this.audioContext.pause();
    }
  }

  /**
   * Sets the global playback speed.
   * Applied immediately to current audio and future plays.
   * @param speed 0.5 to 2.0
   */
  setSpeed(speed: number): void {
    // Clamp values for safety
    const safeSpeed = Math.max(0.5, Math.min(speed, 2.0));
    this.playbackRate = safeSpeed;
    this.audioContext.playbackRate = safeSpeed;
  }

  /**
   * Returns current duration in seconds (or 0 if not loaded)
   */
  getDuration(): number {
    return this.audioContext.duration || 0;
  }

  // ------------------------------------------------------------------------
  // Cache & Network
  // ------------------------------------------------------------------------

  /**
   * Retrieves audio from cache if available, otherwise fetches and caches it.
   * Returns a Blob URL for playback.
   */
  async getOrDownloadAudio(url: string): Promise<string> {
    // If Cache API is not supported, fallback to direct URL
    if (!('caches' in window)) {
      return url;
    }

    try {
      const cache = await caches.open(this.cacheName);
      
      // 1. Check Cache
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }

      // 2. Fetch Network
      // We assume audio URLs are public/CORS-enabled or proxies
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }

      // 3. Store in Cache (clone response because it can only be consumed once)
      await cache.put(url, response.clone());
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);

    } catch (error) {
      console.warn("[AudioService] Cache failed, falling back to direct URL:", error);
      return url;
    }
  }

  /**
   * Preloads an audio file into the cache silently.
   * Useful for queuing the next card in a review session.
   */
  preload(url: string): void {
    // Fire and forget
    this.getOrDownloadAudio(url).catch(err => {
      console.debug("[AudioService] Preload failed:", err);
    });
  }
}

export const audioManager = AudioService.getInstance();
