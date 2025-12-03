
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../backend/_generated/api";
import { Id } from "../backend/_generated/dataModel";
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  BrainCircuit, 
  Volume2, 
  Loader2, 
  Award,
  ArrowRight
} from 'lucide-react';

// --------------------------------------------------------------------------
// Types & Interfaces
// --------------------------------------------------------------------------

type ReviewState = 'dashboard' | 'session' | 'summary';

interface ReviewItem {
  _id: string; // Generic ID
  type: 'sentence' | 'grammar' | 'character';
  content: any; // The actual data object
  due: boolean;
  status: 'new' | 'learning' | 'review';
}

// --------------------------------------------------------------------------
// Helper Components
// --------------------------------------------------------------------------

const StatCard = ({ icon, label, value, color }: any) => (
  <div className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4`}>
    <div className={`p-3 rounded-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</p>
    </div>
  </div>
);

// --------------------------------------------------------------------------
// Main Screen Component
// --------------------------------------------------------------------------

export const SRSReviewScreen = () => {
  // --- Data Fetching ---
  const USER_ID = "users:123" as any;
  
  // We fetch sentences to build our deck. 
  // In a real production app, we would query the `user_review_deck` table directly 
  // joined with the items, but for this demo, we infer "Reviews" from the sentences.
  const sentences = useQuery(api.fetchSentences.get, { userId: USER_ID, limit: 50 });
  const saveToSRS = useMutation(api.saveToSRS.saveItem);
  const generateAudio = useAction(api.generateAudio.generate);

  // --- Local State ---
  const [viewState, setViewState] = useState<ReviewState>('dashboard');
  const [sessionQueue, setSessionQueue] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  
  // Stats for the current session
  const [sessionResults, setSessionResults] = useState({
    correct: 0,
    incorrect: 0,
    xpGained: 0
  });

  // --- Logic: Build Review Deck (Mock SRS Calculation) ---
  const reviewDeck = useMemo(() => {
    if (!sentences) return null;

    // Mock Logic: Randomly assign status to sentences to simulate a real deck
    return sentences.map((s, i) => ({
      _id: s._id,
      type: 'sentence' as const,
      content: s,
      due: i % 2 === 0, // Mock: Half are due
      status: i % 3 === 0 ? 'new' : i % 3 === 1 ? 'learning' : 'review'
    } as ReviewItem));
  }, [sentences]);

  const dueItems = reviewDeck?.filter(i => i.due) || [];
  const counts = {
    new: dueItems.filter(i => i.status === 'new').length,
    learning: dueItems.filter(i => i.status === 'learning').length,
    review: dueItems.filter(i => i.status === 'review').length,
  };

  // --- Handlers ---

  const startSession = () => {
    if (dueItems.length === 0) return;
    setSessionQueue(dueItems);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionResults({ correct: 0, incorrect: 0, xpGained: 0 });
    setViewState('session');
  };

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentItem = sessionQueue[currentIndex];
    
    if (isPlaying || !currentItem || currentItem.type !== 'sentence') return;
    
    const sentenceData = currentItem.content;

    // Use existing URL or generate new one
    let url = sentenceData.audioUrl;

    if (!url) {
      setAudioLoading(true);
      try {
        const res = await generateAudio({ sentenceId: sentenceData._id });
        if (res.status === 'success' || res.status === 'skipped') {
          url = res.url;
        }
      } catch (err) {
        console.error("Audio failed", err);
      } finally {
        setAudioLoading(false);
      }
    }

    if (url) {
      const audio = new Audio(url);
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.play();
    }
  };

  const handleGrade = async (grade: number) => {
    const currentItem = sessionQueue[currentIndex];
    
    // 1. Call API
    await saveToSRS({
      userId: USER_ID,
      itemId: currentItem._id,
      itemType: currentItem.type,
      // Mock SRS Calc (In real app, use `srsAlgorithm.ts` logic here or on server)
      nextReview: Date.now() + (grade * 86400000), 
      interval: grade,
      easeFactor: 2.5,
      status: grade < 3 ? 'learning' : 'review',
    });

    // 2. Update Stats
    setSessionResults(prev => ({
      correct: grade >= 3 ? prev.correct + 1 : prev.correct,
      incorrect: grade < 3 ? prev.incorrect + 1 : prev.incorrect,
      xpGained: prev.xpGained + (grade * 10)
    }));

    // 3. Advance or Finish
    if (currentIndex < sessionQueue.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setViewState('summary');
    }
  };

  // ------------------------------------------------------------------------
  // View: Loading
  // ------------------------------------------------------------------------
  if (!reviewDeck) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Calculating reviews...</p>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  // View: Dashboard
  // ------------------------------------------------------------------------
  if (viewState === 'dashboard') {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Review Deck</h1>
          <p className="text-slate-500">Your spaced repetition queue for today.</p>
        </header>

        {/* Main Status Circle */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="relative z-10">
            <h2 className="text-6xl font-bold text-slate-800 mb-2">{dueItems.length}</h2>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-sm mb-8">
              Cards Due
            </p>

            <button 
              onClick={startSession}
              disabled={dueItems.length === 0}
              className={`
                inline-flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all
                ${dueItems.length > 0 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <Play fill="currentColor" />
              <span>Start Session</span>
            </button>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            icon={<CheckCircle size={24} className="text-emerald-600" />}
            label="Review"
            value={counts.review}
            color="bg-emerald-50"
          />
          <StatCard 
            icon={<BrainCircuit size={24} className="text-orange-600" />}
            label="Learning"
            value={counts.learning}
            color="bg-orange-50"
          />
          <StatCard 
            icon={<Clock size={24} className="text-blue-600" />}
            label="New"
            value={counts.new}
            color="bg-blue-50"
          />
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  // View: Summary
  // ------------------------------------------------------------------------
  if (viewState === 'summary') {
    return (
      <div className="p-4 md:p-8 max-w-md mx-auto animate-fade-in h-full flex flex-col justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
          {/* Confetti / Decoration Background */}
          <div className="absolute top-0 right-0 p-32 bg-yellow-50 rounded-full -mr-16 -mt-16 opacity-50" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Award className="text-yellow-600" size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Session Complete!</h2>
            <p className="text-slate-500 mb-8">You've successfully cleared your queue.</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">{sessionResults.correct}</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Correct</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-2xl font-bold text-indigo-600">+{sessionResults.xpGained}</p>
                <p className="text-xs text-slate-400 font-bold uppercase">XP Earned</p>
              </div>
            </div>

            <button 
              onClick={() => setViewState('dashboard')}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  // View: Active Session (Flashcard)
  // ------------------------------------------------------------------------
  const currentItem = sessionQueue[currentIndex];
  const content = currentItem.content; // Assumed Sentence Type for now

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => setViewState('dashboard')}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RotateCcw size={20} />
        </button>
        <div className="flex items-center space-x-3 flex-1 px-4">
          <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((currentIndex) / sessionQueue.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-400">
            {currentIndex + 1} / {sessionQueue.length}
          </span>
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 relative perspective-1000 group">
        <div 
          className={`
            relative w-full h-full duration-500 preserve-3d transition-all
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
        >
          {/* Front */}
          <div 
            onClick={handleFlip}
            className="
              absolute inset-0 backface-hidden
              bg-white rounded-3xl shadow-lg border border-slate-200
              flex flex-col items-center justify-center p-8 text-center
              hover:shadow-xl transition-shadow cursor-pointer
            "
          >
            <span className="text-xs font-bold text-indigo-100 bg-indigo-500 px-3 py-1 rounded-full mb-8">
              {currentItem.status.toUpperCase()}
            </span>
            <h2 className="text-4xl md:text-5xl font-chinese font-medium text-slate-800 leading-relaxed">
              {content.original}
            </h2>
            <p className="mt-12 text-slate-400 text-sm font-medium flex items-center gap-2">
              Tap to show answer <ArrowRight size={14} />
            </p>
          </div>

          {/* Back */}
          <div className={`
            absolute inset-0 backface-hidden rotate-y-180
            bg-slate-900 rounded-3xl shadow-lg
            flex flex-col items-center justify-center p-8 text-center
            text-white relative
          `}>
             <button 
              onClick={handleAudio}
              className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              {audioLoading ? (
                <Loader2 className="animate-spin text-white" size={24} />
              ) : (
                <Volume2 className={`${isPlaying ? 'text-indigo-400' : 'text-white'}`} size={24} />
              )}
            </button>

            <h2 className="text-3xl font-chinese font-medium mb-2">{content.original}</h2>
            <p className="text-xl text-indigo-300 font-mono mb-6">{content.pinyin}</p>
            <div className="w-8 h-1 bg-slate-700 rounded-full mb-6" />
            <p className="text-lg text-slate-300">{content.translation}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 h-24">
        {!isFlipped ? (
          <button
            onClick={handleFlip}
            className="w-full h-16 bg-indigo-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Show Answer
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            <GradeButton label="Again" sub="<1m" color="bg-red-50 text-red-600 border-red-200" onClick={() => handleGrade(1)} />
            <GradeButton label="Hard" sub="2d" color="bg-orange-50 text-orange-600 border-orange-200" onClick={() => handleGrade(2)} />
            <GradeButton label="Good" sub="4d" color="bg-blue-50 text-blue-600 border-blue-200" onClick={() => handleGrade(3)} />
            <GradeButton label="Easy" sub="7d" color="bg-green-50 text-green-600 border-green-200" onClick={() => handleGrade(5)} />
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

const GradeButton = ({ label, sub, color, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center h-20 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all ${color}`}
  >
    <span className="font-bold text-sm">{label}</span>
    <span className="text-[10px] opacity-70 font-medium">{sub}</span>
  </button>
);
