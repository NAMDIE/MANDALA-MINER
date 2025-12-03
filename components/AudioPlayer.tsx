
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Pause, Loader2, Play } from 'lucide-react';

// --------------------------------------------------------------------------
// Interfaces
// --------------------------------------------------------------------------

interface AudioPlayerProps {
  /** 
   * The URL of the audio file. 
   * If undefined/null, the player assumes audio needs to be generated.
   */
  src?: string | null;

  /** 
   * Callback to trigger audio generation if src is missing. 
   * Should return the new URL or void.
   */
  onGenerate?: () => Promise<string | void>;

  /** 
   * Optional visual customization for the button.
   * Default: p-2 rounded-full
   */
  className?: string;

  /** 
   * External loading state (e.g. if parent is fetching data).
   */
  isLoading?: boolean;

  /** 
   * If true, audio plays automatically when `src` becomes available.
   */
  autoPlay?: boolean;
}

/**
 * AudioPlayer
 * 
 * A self-contained component for playing short audio clips.
 * Features:
 * - Play/Pause toggling
 * - Audio Generation triggering (if source is missing)
 * - Loading states
 * - Auto-play capability
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  onGenerate,
  className = "",
  isLoading: externalLoading = false,
  autoPlay = false,
}) => {
  // --- State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  
  // Reference to the HTML Audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Effects ---

  // Handle src changes (e.g., auto-play new audio)
  useEffect(() => {
    // Stop previous audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    if (src) {
      audioRef.current = new Audio(src);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setInternalLoading(false);
        console.error("Audio playback error");
      };

      // Handle AutoPlay
      if (autoPlay) {
        handlePlay();
      }
    } else {
      audioRef.current = null;
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [src]);

  // --- Handlers ---

  const handlePlay = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    // 1. If currently loading, do nothing
    if (externalLoading || internalLoading) return;

    // 2. If playing, pause it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // 3. If no source, try to generate
    if (!src) {
      if (onGenerate) {
        setInternalLoading(true);
        try {
          await onGenerate();
          // The parent should update `src`, triggering the useEffect to create Audio and optionally autoPlay
        } catch (error) {
          console.error("Failed to generate audio:", error);
        } finally {
          setInternalLoading(false);
        }
      }
      return;
    }

    // 4. Play existing source
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Playback failed:", err);
        setIsPlaying(false);
      }
    }
  };

  // --- Render ---

  const isLoading = externalLoading || internalLoading;

  // Default styles if no specific class provided
  const baseStyles = className || "p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors";

  return (
    <button
      onClick={handlePlay}
      disabled={isLoading}
      className={`${baseStyles} ${isLoading ? 'opacity-70 cursor-wait' : ''} flex items-center justify-center`}
      aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
      title={src ? "Play Audio" : "Generate & Play Audio"}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : isPlaying ? (
        <Pause size={20} fill="currentColor" />
      ) : (
        <Volume2 size={20} />
      )}
    </button>
  );
};
