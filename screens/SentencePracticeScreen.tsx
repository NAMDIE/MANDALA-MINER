
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../backend/_generated/api";
import { Doc, Id } from "../backend/_generated/dataModel";
import { Volume2, RotateCcw, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';

// --------------------------------------------------------------------------
// Types & Constants
// --------------------------------------------------------------------------

type ReviewGrade = 1 | 2 | 3 | 5; // Mapped to SuperMemo-2 logic (Again, Hard, Good, Easy)

interface ReviewButton {
  label: string;
  grade: ReviewGrade;
  color: string;
  subtext: string;
}

const REVIEW_OPTIONS: ReviewButton[] = [
  { label: "Again", grade: 1, color: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200", subtext: "< 1m" },
  { label: "Hard", grade: 2, color: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200", subtext: "2d" },
  { label: "Good", grade: 3, color: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200", subtext: "4d" },
  { label: "Easy", grade: 5, color: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200", subtext: "7d" },
];

/**
 * SentencePracticeScreen
 * 
 * Purpose:
 * - The core study interface.
 * - Presents sentences as flashcards (Front: Hanzi, Back: Pinyin/English).
 * - Handles Spaced Repetition grading.
 * - Plays/Generates audio on demand.
 */
export const SentencePracticeScreen = () => {
  // --- Context & Data ---
  const USER_ID = "users:123" as any; // Mocked ID
  
  // Fetch sentences to review. 
  // In a real app, this would use a dedicated `api.reviews.getDue` query.
  // For now, we fetch recent sentences and filter/shuffle them client-side for the demo.
  const sentences = useQuery(api.fetchSentences.get, { userId: USER_ID, limit: 20 });
  const saveToSRS = useMutation(api.saveToSRS.saveItem);
  const generateAudio = useAction(api.generateAudio.generate);

  // --- Local State ---
  const [queue, setQueue] = useState<any[]>([]); // The active review session queue
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Effects ---
  
  // Initialize Queue when sentences load
  useEffect(() => {
    if (sentences && queue.length === 0) {
      // Shuffle sentences for random practice
      const shuffled = [...sentences].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
    }
  }, [sentences]);

  // Reset audio ref when card changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, [currentIndex]);

  // --- Handlers ---

  const currentCard = queue[currentIndex];
  const isFinished = queue.length > 0 && currentIndex >= queue.length;

  const handleFlip = () => {
    setIsFlipped(true);
    // Auto-play audio on flip if available? Optional preference.
    // handlePlayAudio(); 
  };

  const handlePlayAudio = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (!currentCard) return;

    // Case 1: Audio URL exists in DB
    if (currentCard.audioUrl) {
      playAudio(currentCard.audioUrl);
      return;
    }

    // Case 2: Generate Audio on the fly
    setIsGeneratingAudio(true);
    try {
      const result = await generateAudio({ sentenceId: currentCard._id });
      if (result.status === "success" || result.status === "skipped") {
        // Update local queue with new URL so we don't re-generate
        const updatedQueue = [...queue];
        updatedQueue[currentIndex] = { ...currentCard, audioUrl: result.url };
        setQueue(updatedQueue);
        playAudio(result.url);
      }
    } catch (err) {
      console.error("Audio generation failed:", err);
      alert("Could not generate audio.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.play().catch(e => {
      console.error("Playback failed", e);
      setIsPlaying(false);
    });
  };

  const handleGrade = async (grade: ReviewGrade) => {
    if (!currentCard) return;

    // 1. Calculate new SRS stats (Client-side helper mock or server logic)
    // Here we just pass the grade to the server mutation which handles the algo
    // We need to estimate previous state. For this demo, we assume "New".
    
    // In a real app, we would query `user_review_deck` for this specific item first.
    // We'll pass default params for now.
    
    await saveToSRS({
      userId: USER_ID,
      itemId: currentCard._id,
      itemType: "sentence",
      nextReview: Date.now() + 86400000, // Dummy next date
      interval: 1,
      easeFactor: 2.5,
      status: grade < 3 ? "learning" : "review",
    });

    // 2. Update Stats
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: grade >= 3 ? prev.correct + 1 : prev.correct
    }));

    // 3. Next Card
    setIsFlipped(false);
    setCurrentIndex(prev => prev + 1);
  };

  // --- Render: Loading / Empty / Finished ---

  if (!sentences) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500">Preparing your deck...</p>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="text-slate-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No cards due</h2>
        <p className="text-slate-500 mt-2">You're all caught up! Great job.</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="p-8 max-w-md mx-auto animate-fade-in">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Check className="text-emerald-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Session Complete!</h2>
          <p className="text-slate-500 mb-8">You reviewed {sessionStats.reviewed} cards.</p>
          
          <div className="flex justify-center space-x-4">
             <button 
               onClick={() => window.location.reload()} // Simple reset for demo
               className="flex items-center space-x-2 text-slate-600 font-medium hover:text-indigo-600 transition-colors"
             >
               <RotateCcw size={18} />
               <span>Review Again</span>
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Active Card ---

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto flex flex-col h-[calc(100vh-100px)]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-slate-400 font-medium text-sm">
          Card {currentIndex + 1} of {queue.length}
        </span>
        <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIndex) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card Container */}
      <div className="flex-1 relative perspective-1000 group">
        <div 
          className={`
            relative w-full h-full duration-500 preserve-3d transition-all
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
        >
          {/* Front Face */}
          <div className="
            absolute inset-0 backface-hidden
            bg-white rounded-3xl shadow-xl border border-slate-200
            flex flex-col items-center justify-center p-8 text-center
            hover:shadow-2xl transition-shadow cursor-pointer
          " onClick={handleFlip}>
            <span className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-8">
              Translate this
            </span>
            <h2 className="text-4xl md:text-5xl font-chinese font-medium text-slate-800 leading-relaxed select-none">
              {currentCard.original}
            </h2>
            <p className="mt-12 text-indigo-500 font-medium animate-pulse text-sm">
              Tap to flip
            </p>
          </div>

          {/* Back Face */}
          <div className={`
            absolute inset-0 backface-hidden rotate-y-180
            bg-slate-900 rounded-3xl shadow-xl
            flex flex-col items-center justify-center p-8 text-center
            text-white
          `}>
            {/* Audio Control */}
            <button 
              onClick={handlePlayAudio}
              disabled={isGeneratingAudio}
              className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {isGeneratingAudio ? (
                <Loader2 className="animate-spin text-white" size={24} />
              ) : (
                <Volume2 className={`${isPlaying ? 'text-indigo-400' : 'text-white'}`} size={24} />
              )}
            </button>

            <h2 className="text-3xl font-chinese font-medium mb-4 select-text">
              {currentCard.original}
            </h2>
            <p className="text-xl text-indigo-300 font-mono mb-6">
              {currentCard.pinyin}
            </p>
            
            <div className="w-12 h-1 bg-white/20 rounded-full mb-6" />
            
            <p className="text-lg text-slate-200 leading-relaxed max-w-xs">
              {currentCard.translation}
            </p>

            {currentCard.tags && (
              <div className="mt-8 flex flex-wrap gap-2 justify-center">
                {currentCard.tags.map((tag: string, i: number) => (
                  <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300 border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 h-24">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="w-full h-14 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Show Answer
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {REVIEW_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleGrade(opt.grade)}
                className={`
                  flex flex-col items-center justify-center h-20 rounded-2xl border transition-all hover:scale-105 active:scale-95
                  ${opt.color}
                `}
              >
                <span className="font-bold text-sm">{opt.label}</span>
                <span className="text-[10px] opacity-70 font-medium mt-1">{opt.subtext}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
};
