
import React from 'react';
import { Volume2, Loader2, ArrowRight } from 'lucide-react';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface SentenceData {
  _id: string;
  original: string;
  pinyin: string;
  translation: string;
  audioUrl?: string;
  tags?: string[];
}

interface SentenceCardProps {
  /** The sentence data to display */
  data: SentenceData;
  /** Whether the card is currently showing the back side */
  isFlipped: boolean;
  /** Callback to toggle flip state */
  onFlip: () => void;
  /** Callback to handle audio playback */
  onPlayAudio?: (e: React.MouseEvent) => void;
  /** Visual state for audio playback */
  isPlaying?: boolean;
  /** Visual state for audio loading/generation */
  isAudioLoading?: boolean;
  /** Optional header content (e.g. SRS Status badge) */
  header?: React.ReactNode;
  /** Optional footer content (e.g. "Tap to flip") */
  footer?: React.ReactNode;
  /** Height class for the card container (default: h-full) */
  heightClass?: string;
}

/**
 * SentenceCard
 * 
 * A reusable Flashcard component that handles the 3D flip animation
 * and display logic for Mandarin sentences.
 */
export const SentenceCard: React.FC<SentenceCardProps> = ({
  data,
  isFlipped,
  onFlip,
  onPlayAudio,
  isPlaying = false,
  isAudioLoading = false,
  header,
  footer,
  heightClass = "h-96 md:h-full"
}) => {
  return (
    <div className={`relative perspective-1000 group w-full ${heightClass}`}>
      <div 
        className={`
          relative w-full h-full duration-500 preserve-3d transition-all
          ${isFlipped ? 'rotate-y-180' : ''}
        `}
      >
        {/* --- FRONT FACE (Hanzi) --- */}
        <div 
          onClick={onFlip}
          className="
            absolute inset-0 backface-hidden
            bg-white rounded-3xl shadow-lg border border-slate-200
            flex flex-col items-center justify-center p-8 text-center
            hover:shadow-xl transition-shadow cursor-pointer select-none
          "
        >
          {/* Header Slot (e.g. SRS Badge) */}
          {header && <div className="absolute top-8 left-0 right-0">{header}</div>}

          {/* Main Content */}
          <h2 className="text-4xl md:text-5xl font-chinese font-medium text-slate-800 leading-relaxed break-words max-w-full">
            {data.original}
          </h2>

          {/* Footer / Hint */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            {footer || (
              <p className="text-indigo-500 font-medium animate-pulse text-sm flex items-center justify-center gap-2">
                Tap to flip <ArrowRight size={14} />
              </p>
            )}
          </div>
        </div>

        {/* --- BACK FACE (Pinyin + Translation) --- */}
        <div className={`
          absolute inset-0 backface-hidden rotate-y-180
          bg-slate-900 rounded-3xl shadow-lg
          flex flex-col items-center justify-center p-8 text-center
          text-white relative
        `}>
          {/* Audio Button */}
          {onPlayAudio && (
            <button 
              onClick={onPlayAudio}
              disabled={isAudioLoading}
              className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
              title="Play Audio"
            >
              {isAudioLoading ? (
                <Loader2 className="animate-spin text-white" size={24} />
              ) : (
                <Volume2 className={`${isPlaying ? 'text-indigo-400' : 'text-white'}`} size={24} />
              )}
            </button>
          )}

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <h2 className="text-2xl md:text-3xl font-chinese font-medium mb-3 select-text">
              {data.original}
            </h2>
            
            <p className="text-lg md:text-xl text-indigo-300 font-mono mb-6 select-text px-4">
              {data.pinyin}
            </p>
            
            <div className="w-12 h-1 bg-white/20 rounded-full mb-6" />
            
            <p className="text-base md:text-lg text-slate-200 leading-relaxed max-w-xs select-text">
              {data.translation}
            </p>

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 justify-center">
                {data.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300 border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Modules / Styles for 3D Transform */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
};
