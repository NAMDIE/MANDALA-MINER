
import React from 'react';
import { Play, Layers, CheckCircle } from 'lucide-react';

// --------------------------------------------------------------------------
// Interfaces
// --------------------------------------------------------------------------

export type DeckTheme = 'indigo' | 'emerald' | 'orange' | 'blue' | 'rose';

interface ReviewDeckCardProps {
  /** The title of the deck (e.g., "Daily Review", "New Cards") */
  title: string;
  /** Description or subtitle */
  description?: string;
  /** The number of items currently in the queue */
  count: number;
  /** Label for the count (e.g., "Due Now") */
  countLabel?: string;
  /** Visual color theme */
  theme?: DeckTheme;
  /** Callback when the "Start" button is clicked */
  onStart?: () => void;
  /** Optional custom icon */
  icon?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
}

// --------------------------------------------------------------------------
// Helper: Theme Maps
// --------------------------------------------------------------------------

const THEME_STYLES: Record<DeckTheme, { gradient: string; button: string; iconBg: string; text: string }> = {
  indigo: {
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    button: "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700",
    iconBg: "bg-indigo-100 text-indigo-600",
    text: "text-indigo-900",
  },
  emerald: {
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    button: "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-900",
  },
  orange: {
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    button: "bg-orange-600 shadow-orange-200 hover:bg-orange-700",
    iconBg: "bg-orange-100 text-orange-600",
    text: "text-orange-900",
  },
  blue: {
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    button: "bg-blue-600 shadow-blue-200 hover:bg-blue-700",
    iconBg: "bg-blue-100 text-blue-600",
    text: "text-blue-900",
  },
  rose: {
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    button: "bg-rose-600 shadow-rose-200 hover:bg-rose-700",
    iconBg: "bg-rose-100 text-rose-600",
    text: "text-rose-900",
  },
};

/**
 * ReviewDeckCard
 * 
 * A visually engaging card that summarizes a review deck's status.
 * Features a dynamic background gradient, count display, and call-to-action.
 */
export const ReviewDeckCard: React.FC<ReviewDeckCardProps> = ({
  title,
  description = "Ready for review",
  count,
  countLabel = "Cards Due",
  theme = 'indigo',
  onStart,
  icon,
  isLoading = false,
}) => {
  const styles = THEME_STYLES[theme];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      
      {/* Decorative Gradient Bar */}
      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${styles.gradient}`} />
      
      <div className="p-6 md:p-8 relative z-10 flex flex-col items-center text-center">
        
        {/* Header Icon & Title */}
        <div className="mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${styles.iconBg}`}>
            {icon || <Layers size={24} />}
          </div>
          <h3 className={`text-xl font-bold ${styles.text}`}>{title}</h3>
          <p className="text-slate-500 text-sm mt-1">{description}</p>
        </div>

        {/* Count Display */}
        <div className="mb-8">
          {isLoading ? (
            <div className="h-16 w-16 bg-slate-100 rounded-lg animate-pulse mx-auto" />
          ) : (
            <>
              <div className="text-5xl md:text-6xl font-bold text-slate-800 tracking-tight">
                {count}
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                {countLabel}
              </p>
            </>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onStart}
          disabled={count === 0 || isLoading}
          className={`
            w-full py-4 rounded-xl flex items-center justify-center space-x-2 font-bold text-white shadow-lg transition-all
            ${count > 0 && !isLoading
              ? `${styles.button} hover:scale-[1.02] active:scale-95` 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }
          `}
        >
          {count === 0 ? (
            <>
              <CheckCircle size={20} />
              <span>All Done</span>
            </>
          ) : (
            <>
              <Play size={20} fill="currentColor" />
              <span>Start Session</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
