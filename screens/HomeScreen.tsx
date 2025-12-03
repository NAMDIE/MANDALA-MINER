
import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../backend/_generated/api";
import { BookOpen, Layers, Plus, TrendingUp, Zap } from 'lucide-react';
import { Doc } from "../backend/_generated/dataModel";

/**
 * HomeScreen / Dashboard
 * 
 * Purpose:
 * - Serves as the landing page for the user.
 * - Displays daily progress against learning goals.
 * - Provides quick access to key actions (Review, Journal).
 * 
 * Inputs:
 * - User ID (Derived/Mocked for this phase)
 * 
 * Convex Queries:
 * - api.fetchSentences.get (to calculate daily mining progress)
 */
export const HomeScreen = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  // 1. User Context (Mocked for now, usually ctx.auth.getUserIdentity)
  const USER_ID = "users:123" as any; 
  const USER_NAME = "Alex";
  const DAILY_GOAL = 5;

  // 2. Data Fetching
  // We fetch sentences to calculate how many were added "today".
  // Use conditional fetching or safe defaults if query is undefined initially
  const sentences = useQuery(api.fetchSentences.get, { 
    userId: USER_ID,
    limit: 100 // Fetch enough to count today's activity
  });

  // 3. Logic: Calculate Daily Progress
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sentencesToday = sentences 
    ? sentences.filter(s => s.createdAt >= today.getTime()).length 
    : 0;
  
  const progressPercentage = Math.min((sentencesToday / DAILY_GOAL) * 100, 100);

  // 4. Mock Data for Reviews (SRS Query not yet implemented in frontend)
  const reviewsDue = 12;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 animate-fade-in">
      
      {/* --- Header Section --- */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 font-serif">
            Good Morning, {USER_NAME}
          </h1>
          <p className="text-slate-500 mt-1">Ready to expand your vocabulary?</p>
        </div>
        {/* Streak Badge (Visual Only) */}
        <div className="hidden md:flex flex-col items-center bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
          <Zap className="text-orange-500 fill-orange-500" size={20} />
          <span className="text-xs font-bold text-orange-700 mt-1">12 Days</span>
        </div>
      </header>

      {/* --- Daily Goal Card --- */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <BookOpen size={120} />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-500" />
                Daily Mining Goal
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                You've mined <strong className="text-slate-800">{sentencesToday}</strong> out of <strong className="text-slate-800">{DAILY_GOAL}</strong> sentences today.
              </p>
            </div>
            <span className="text-3xl font-bold text-indigo-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </section>

      {/* --- Main Action Grid --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Review Action */}
        <button 
          onClick={() => onNavigate?.('Review')}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white text-left shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 group"
        >
          <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
            <Layers size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-bold">Review Deck</h3>
          <p className="text-emerald-100 text-sm mt-1 mb-3">
            {reviewsDue} cards waiting for you
          </p>
          <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
            Start Session
          </span>
        </button>

        {/* Journal Action */}
        <button 
          onClick={() => onNavigate?.('Journal')}
          className="bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
            <Plus size={24} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">New Entry</h3>
          <p className="text-slate-500 text-sm mt-1">
            Write about your day to generate new sentences.
          </p>
        </button>
      </section>

      {/* --- Recent Sentences Preview --- */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-700">Recent Mined Sentences</h3>
          <button onClick={() => onNavigate?.('Journal')} className="text-indigo-600 text-sm font-medium hover:underline">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {!sentences ? (
            // Loading Skeletons
            [1, 2].map(i => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 h-20 animate-pulse" />
            ))
          ) : sentences.length === 0 ? (
            <div className="bg-slate-50 p-6 rounded-xl text-center text-slate-400 border border-dashed border-slate-200">
              No sentences yet. Start journaling!
            </div>
          ) : (
            sentences.slice(0, 3).map((s) => (
              <div key={s._id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-chinese text-lg text-slate-800 font-medium">{s.original}</p>
                  <p className="text-slate-500 text-sm">{s.translation}</p>
                </div>
                <span className={`
                  text-xs px-2 py-1 rounded-full border
                  ${s.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' : ''}
                  ${s.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : ''}
                  ${s.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                `}>
                  {s.difficulty || 'Easy'}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
};
