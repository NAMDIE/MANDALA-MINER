
import React, { useState, useEffect } from 'react';
import { X, Layout, Book, Zap, PlayCircle, Loader2, Bookmark } from 'lucide-react';

// --------------------------------------------------------------------------
// Interfaces
// --------------------------------------------------------------------------

interface GrammarPopupProps {
  /** The grammar point key/title to look up (e.g., "把 Structure") */
  point: string | null;
  /** Whether the modal is currently visible */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

// --------------------------------------------------------------------------
// Mock Data (Simulating api.grammar.get)
// --------------------------------------------------------------------------

const MOCK_GRAMMAR_DB: Record<string, any> = {
  "把 Structure": {
    point: "把 Structure",
    level: "HSK 3",
    explanation: "The '把' (bǎ) sentence structure is used to indicate that an action is performed on a specific object, changing its state or position. It emphasizes the *disposal* of the object.",
    structure: "Subj + 把 + Obj + Verb + Result",
    structureBlocks: ["Subject", "把", "Object", "Verb", "Result"],
    examples: [
      {
        original: "我把书放在桌子上了。",
        pinyin: "Wǒ bǎ shū fàng zài zhuōzi shàng le.",
        translation: "I put the book on the table."
      },
      {
        original: "请把门打开。",
        pinyin: "Qǐng bǎ mén dǎkāi.",
        translation: "Please open the door."
      }
    ]
  },
  "是...的 Structure": {
    point: "是...的 Structure",
    level: "HSK 2",
    explanation: "The '是...的' (shì...de) construction is used to emphasize specific details (time, place, manner) about a past event that is already known to have happened.",
    structure: "Subj + 是 + [Detail] + Verb + 的",
    structureBlocks: ["Subj", "是", "Emphasis", "Verb", "的"],
    examples: [
      {
        original: "我是昨天来的。",
        pinyin: "Wǒ shì zuótiān lái de.",
        translation: "It was yesterday that I came."
      }
    ]
  },
  "Default": {
    point: "Grammar Point",
    level: "General",
    explanation: "Detailed grammar explanation not available in demo mode.",
    structure: "Pattern + Usage",
    structureBlocks: ["Pattern", "Usage"],
    examples: []
  }
};

/**
 * GrammarPopup
 * 
 * A modal component that displays structured grammar information.
 * Used for quick reference during reviews or journaling.
 */
export const GrammarPopup: React.FC<GrammarPopupProps> = ({ point, isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // --- Effects ---

  useEffect(() => {
    if (isOpen && point) {
      setLoading(true);
      // Simulate API fetch
      const timer = setTimeout(() => {
        // Simple fuzzy match or fallback for demo
        const key = Object.keys(MOCK_GRAMMAR_DB).find(k => k.includes(point)) || "Default";
        const result = MOCK_GRAMMAR_DB[key] || { ...MOCK_GRAMMAR_DB["Default"], point };
        setData(result);
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, point]);

  // Lock body scroll
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
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-slate-50 rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-slide-up border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white border-b border-slate-100">
          <div className="flex items-center space-x-2">
             <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
               Grammar
             </span>
             {data && (
               <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                 {data.level}
               </span>
             )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-slate-400 text-sm">Consulting grammar guide...</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Title */}
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-slate-800 font-chinese mb-2">
                  {data.point}
                </h2>
              </div>

              {/* Structure Pattern */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <Layout size={16} className="text-indigo-500" />
                  <h3 className="font-bold text-slate-500 uppercase tracking-wide text-xs">
                    Structure
                  </h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {data.structureBlocks.map((block: string, index: number) => (
                    <React.Fragment key={index}>
                      <span className={`
                        px-3 py-1.5 rounded-lg font-medium text-sm border
                        ${['把', '是', '的'].includes(block) 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                          : 'bg-slate-50 text-slate-600 border-slate-100'
                        }
                      `}>
                        {block}
                      </span>
                      {index < data.structureBlocks.length - 1 && (
                        <span className="text-slate-300 font-bold">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <p className="mt-3 text-slate-400 text-xs font-mono">
                  {data.structure}
                </p>
              </div>

              {/* Explanation */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Book size={16} className="text-indigo-500" />
                  <h3 className="font-bold text-slate-500 uppercase tracking-wide text-xs">
                    Explanation
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {data.explanation}
                </p>
              </div>

              {/* Examples */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap size={16} className="text-indigo-500" />
                  <h3 className="font-bold text-slate-500 uppercase tracking-wide text-xs">
                    Examples
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {data.examples.map((ex: any, i: number) => (
                    <div key={i} className="group flex justify-between items-start pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                      <div>
                        <p className="font-chinese text-lg font-medium text-slate-800 mb-0.5">
                          {ex.original}
                        </p>
                        <p className="text-xs font-mono text-indigo-500 mb-1">
                          {ex.pinyin}
                        </p>
                        <p className="text-sm text-slate-500">
                          {ex.translation}
                        </p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-indigo-600 transition-opacity">
                        <PlayCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400">Grammar point not found.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors text-sm font-medium">
            <Bookmark size={16} />
            <span>Save to Notebook</span>
          </button>
        </div>

      </div>
    </div>
  );
};
