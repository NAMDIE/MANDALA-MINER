
import React, { useState, useEffect } from 'react';
import { X, Volume2, Book, PenTool, Layers, Star, Share2, Loader2 } from 'lucide-react';

// --------------------------------------------------------------------------
// Interfaces
// --------------------------------------------------------------------------

interface CharacterModalProps {
  /** The Chinese character to look up */
  char: string | null;
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

// --------------------------------------------------------------------------
// Mock Data (Shared with CharacterDetailScreen for demo purposes)
// --------------------------------------------------------------------------

const MOCK_DB: Record<string, any> = {
  "爱": {
    char: "爱",
    pinyin: ["ài"],
    meaning: ["love", "affection", "to be fond of", "to like"],
    hskLevel: 1,
    strokes: 10,
    components: ["爫 (claw)", "冖 (cover)", "友 (friend)"],
    examples: [
      { word: "爱情", pinyin: "ài qíng", meaning: "romance" },
      { word: "可爱", pinyin: "kě ài", meaning: "cute" }
    ]
  },
  "中": {
    char: "中",
    pinyin: ["zhōng", "zhòng"],
    meaning: ["center", "middle", "China"],
    hskLevel: 1,
    strokes: 4,
    components: ["口 (mouth)", "丨 (vertical)"],
    examples: [
      { word: "中国", pinyin: "Zhōng guó", meaning: "China" },
      { word: "中文", pinyin: "Zhōng wén", meaning: "Chinese" }
    ]
  },
  // Fallback for demo if character not found
  "Default": {
    char: "?",
    pinyin: ["unknown"],
    meaning: ["Character not in demo database"],
    hskLevel: 0,
    strokes: 0,
    components: [],
    examples: []
  }
};

/**
 * CharacterModal
 * 
 * A modal overlay that displays detailed dictionary information for a specific character.
 * useful for quick lookups during review or journaling without losing context.
 */
export const CharacterModal: React.FC<CharacterModalProps> = ({ char, isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // --- Effects ---

  useEffect(() => {
    if (isOpen && char) {
      setLoading(true);
      // Simulate API fetch delay
      const timer = setTimeout(() => {
        const result = MOCK_DB[char] || { ...MOCK_DB["Default"], char: char };
        setData(result);
        setLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, char]);

  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // --- Render ---

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Dictionary Lookup
          </span>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-slate-400 text-sm">Fetching character details...</p>
            </div>
          ) : data ? (
            <div className="space-y-8">
              
              {/* Top Section: Char & Pinyin */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-7xl font-chinese font-medium text-slate-800 leading-none">
                    {data.char}
                  </h1>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center justify-end space-x-2">
                    <span className="text-2xl font-mono text-indigo-600 font-medium">
                      {data.pinyin.join(", ")}
                    </span>
                    <button className="p-1.5 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100">
                      <Volume2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Badge icon={<Book size={12} />} label={`HSK ${data.hskLevel}`} />
                    <Badge icon={<PenTool size={12} />} label={`${data.strokes} Strokes`} />
                  </div>
                </div>
              </div>

              {/* Meanings */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Definitions
                </h3>
                <ul className="space-y-2">
                  {data.meaning.map((m: string, i: number) => (
                    <li key={i} className="flex items-start text-slate-700">
                      <span className="mr-2 text-indigo-400 font-bold">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Components */}
              {data.components && data.components.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers size={14} /> Decomposition
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.components.map((comp: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 text-sm">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {data.examples && data.examples.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Common Words
                  </h3>
                  <div className="space-y-2">
                    {data.examples.map((ex: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                         <div>
                           <span className="font-chinese text-lg text-slate-800 mr-2">{ex.word}</span>
                           <span className="text-xs text-indigo-500 font-mono">{ex.pinyin}</span>
                         </div>
                         <span className="text-sm text-slate-500">{ex.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
             <p className="text-center text-slate-500">Character not found.</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-2">
           <button className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors text-sm font-medium">
             <Share2 size={16} />
             <span>Share</span>
           </button>
           <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors text-sm font-medium">
             <Star size={16} />
             <span>Save to Deck</span>
           </button>
        </div>

      </div>
    </div>
  );
};

// Helper for badges
const Badge = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 rounded text-slate-500 text-xs font-medium">
    {icon}
    <span>{label}</span>
  </span>
);
