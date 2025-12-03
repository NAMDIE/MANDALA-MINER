
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Book, PenTool, Layers, Volume2, Share2, Star } from 'lucide-react';

interface CharacterDetailProps {
  char?: string;
  onBack?: () => void;
}

// --------------------------------------------------------------------------
// Mock Data (Simulating api.characters.get)
// --------------------------------------------------------------------------

const MOCK_DB: Record<string, any> = {
  "爱": {
    char: "爱",
    pinyin: ["ài"],
    meaning: ["love", "affection", "to be fond of", "to like"],
    hskLevel: 1,
    strokes: 10,
    components: ["爫 (claw)", "冖 (cover)", "友 (friend)"],
    etymology: "Originally depicting a person offering their heart.",
    examples: [
      { word: "爱情", pinyin: "ài qíng", meaning: "romance / love (romantic)" },
      { word: "可爱", pinyin: "kě ài", meaning: "cute / lovely" },
      { word: "爱好", pinyin: "ài hào", meaning: "hobby / interest" },
      { word: "热爱", pinyin: "rè ài", meaning: "to love ardently / to adore" }
    ]
  },
  "Default": {
    char: "中",
    pinyin: ["zhōng", "zhòng"],
    meaning: ["center", "middle", "China", "hit (the mark)"],
    hskLevel: 1,
    strokes: 4,
    components: ["口 (mouth)", "丨 (vertical line)"],
    etymology: "Representation of a flagpole in the center of a circle.",
    examples: [
      { word: "中国", pinyin: "Zhōng guó", meaning: "China" },
      { word: "中文", pinyin: "Zhōng wén", meaning: "Chinese language" },
      { word: "中间", pinyin: "zhōng jiān", meaning: "between / intermediate" }
    ]
  }
};

/**
 * CharacterDetailScreen
 * 
 * Purpose:
 * - Displays deep lexical information about a single character.
 * - Shows strokes, HSK level, decomposition, and examples.
 * 
 * Inputs:
 * - char: The character string to look up (optional, defaults to demo).
 * - onBack: Navigation callback.
 */
export const CharacterDetailScreen: React.FC<CharacterDetailProps> = ({ char, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulate Data Fetching
  useEffect(() => {
    setLoading(true);
    // In a real app: const data = useQuery(api.characters.get, { char });
    const timer = setTimeout(() => {
      const result = MOCK_DB[char || ""] || MOCK_DB["Default"];
      setData(result);
      setLoading(false);
    }, 400); // Simulate network delay

    return () => clearTimeout(timer);
  }, [char]);

  // --- Handlers ---

  const playAudio = () => {
    // Placeholder for TTS logic
    console.log(`Playing audio for ${data?.char}`);
  };

  // --- Render: Loading ---
  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Consulting the dictionary...</p>
      </div>
    );
  }

  // --- Render: Main ---
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fade-in bg-white md:bg-transparent min-h-screen">
      
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
        <div className="flex space-x-2">
          <button className="p-2 text-slate-400 hover:text-yellow-500 transition-colors">
            <Star size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* --- Top Card: Character & Pronunciation --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center md:items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center md:items-start z-10">
            <h1 className="text-8xl md:text-9xl font-chinese text-slate-800 leading-none mb-4 md:mb-0">
              {data.char}
            </h1>
          </div>

          <div className="flex flex-col items-center md:items-end z-10 space-y-4 flex-1">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end space-x-3 mb-1">
                <h2 className="text-4xl font-mono text-indigo-600 font-medium">
                  {data.pinyin.join(", ")}
                </h2>
                <button 
                  onClick={playAudio}
                  className="p-2 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  <Volume2 size={24} />
                </button>
              </div>
              <p className="text-slate-500">Pinyin Pronunciation</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-4">
              <div className="flex items-center space-x-1 px-3 py-1 bg-slate-100 rounded-lg text-slate-600 text-sm font-medium">
                <Book size={14} />
                <span>HSK {data.hskLevel}</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1 bg-slate-100 rounded-lg text-slate-600 text-sm font-medium">
                <PenTool size={14} />
                <span>{data.strokes} Strokes</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Meanings --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            Meanings
          </h3>
          <ul className="space-y-2">
            {data.meaning.map((m: string, i: number) => (
              <li key={i} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-lg text-slate-800">{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* --- Decomposition --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Layers size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Decomposition
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.components.map((comp: string, i: number) => (
              <div key={i} className="flex flex-col items-center bg-slate-50 border border-slate-100 p-3 rounded-xl min-w-[80px]">
                <span className="font-chinese text-2xl text-slate-700 mb-1">
                  {comp.split(" ")[0]}
                </span>
                <span className="text-xs text-slate-400">
                  {comp.split(" ").slice(1).join(" ").replace(/[()]/g, "")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Examples --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            Common Words
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.examples.map((ex: any, i: number) => (
              <div key={i} className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="mr-4">
                  <div className="font-chinese text-xl font-medium text-slate-800">
                    {ex.word}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-mono text-indigo-500">
                    {ex.pinyin}
                  </div>
                  <div className="text-sm text-slate-600">
                    {ex.meaning}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
