
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Book, Layout, Zap, PlayCircle, Bookmark } from 'lucide-react';

interface GrammarPopupProps {
  point?: string;
  onBack?: () => void;
}

// --------------------------------------------------------------------------
// Mock Data (Simulating api.grammar.get)
// --------------------------------------------------------------------------

const MOCK_GRAMMAR_DB: Record<string, any> = {
  "把 Structure": {
    point: "把 Structure",
    level: "HSK 3",
    explanation: "The '把' (bǎ) sentence structure is a key feature of Mandarin grammar. It is used to indicate that an action is performed on a specific object, often resulting in a change of state or position. It focuses on the 'disposal' or handling of the object.",
    structure: "Subject + 把 + Object + Verb + Complement",
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
      },
      {
        original: "他把蛋糕吃完了。",
        pinyin: "Tā bǎ dàngāo chī wán le.",
        translation: "He finished eating the cake."
      }
    ]
  },
  "Default": {
    point: "是...的 Structure",
    level: "HSK 2",
    explanation: "The '是...的' (shì...de) construction is used to emphasize specific details about a past event, such as the time, place, manner, or purpose. The event itself is already known to have happened.",
    structure: "Subject + 是 + [Time/Place/Manner] + Verb + 的",
    structureBlocks: ["Subj", "是", "Emphasis", "Verb", "的"],
    examples: [
      {
        original: "我是昨天来的。",
        pinyin: "Wǒ shì zuótiān lái de.",
        translation: "It was yesterday that I came."
      },
      {
        original: "他是坐飞机去的。",
        pinyin: "Tā shì zuò fēijī qù de.",
        translation: "He went by plane."
      }
    ]
  }
};

/**
 * GrammarPopupScreen
 * 
 * Purpose:
 * - A detailed view for a specific grammar point.
 * - Shows the structural formula, explanation, and example sentences.
 * 
 * Inputs:
 * - point: The grammar point key to look up.
 * - onBack: Navigation callback.
 */
export const GrammarPopupScreen: React.FC<GrammarPopupProps> = ({ point, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate API fetch
    const timer = setTimeout(() => {
      const key = point && MOCK_GRAMMAR_DB[point] ? point : "Default";
      setData(MOCK_GRAMMAR_DB[key]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [point]);

  // --- Render: Loading ---
  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Analyzing structure...</p>
      </div>
    );
  }

  // --- Render: Main ---
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fade-in bg-slate-50 min-h-screen md:bg-transparent">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
        <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
          <Bookmark size={20} />
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Title Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-emerald-50 rounded-full -mr-10 -mt-10 opacity-60 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Grammar Point
              </span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {data.level}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 font-chinese mt-2">
              {data.point}
            </h1>
          </div>
        </div>

        {/* Structure Visualization */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Layout size={18} className="text-indigo-500" />
            <h3 className="font-bold text-slate-700 uppercase tracking-wide text-sm">
              Structure Pattern
            </h3>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4 md:p-6 overflow-x-auto">
            <div className="flex items-center space-x-2 min-w-max">
              {data.structureBlocks.map((block: string, index: number) => (
                <React.Fragment key={index}>
                  <div className={`
                    px-4 py-2 rounded-lg font-medium text-sm md:text-base border
                    ${block === '把' || block === '是' || block === '的' 
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200'
                    }
                  `}>
                    {block}
                  </div>
                  {index < data.structureBlocks.length - 1 && (
                    <div className="w-4 h-0.5 bg-slate-300 rounded-full" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="mt-4 text-slate-500 text-sm font-mono bg-white inline-block px-2 py-1 rounded border border-slate-100">
              {data.structure}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Book size={18} className="text-indigo-500" />
            <h3 className="font-bold text-slate-700 uppercase tracking-wide text-sm">
              Explanation
            </h3>
          </div>
          <p className="text-slate-700 leading-relaxed text-lg">
            {data.explanation}
          </p>
        </div>

        {/* Examples */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Zap size={18} className="text-indigo-500" />
            <h3 className="font-bold text-slate-700 uppercase tracking-wide text-sm">
              Examples
            </h3>
          </div>
          
          <div className="space-y-4">
            {data.examples.map((ex: any, i: number) => (
              <div key={i} className="group p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-chinese text-xl font-medium text-slate-800 mb-1">
                      {ex.original}
                    </p>
                    <p className="text-sm font-mono text-indigo-500 mb-1">
                      {ex.pinyin}
                    </p>
                    <p className="text-slate-600 text-sm">
                      {ex.translation}
                    </p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-indigo-400 hover:text-indigo-600 transition-all">
                    <PlayCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
    