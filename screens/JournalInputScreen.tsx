
import React, { useState } from 'react';
import { useAction } from "convex/react";
import { api } from "../backend/_generated/api";
import { Loader2, Send, CheckCircle, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { Id } from "../backend/_generated/dataModel";

/**
 * JournalInputScreen
 * 
 * Purpose:
 * - Allows user to input raw text (Mandarin or mixed).
 * - Calls the AI backend to analyze and mine sentences.
 * - Displays the results (Generated Sentences) immediately.
 * 
 * Convex Actions:
 * - api.submitJournal.submit
 */
export const JournalInputScreen = () => {
  // --- State ---
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<{
    journalId: Id<"journals">;
    sentences: any[];
  } | null>(null);

  // --- Convex Action ---
  const submitJournal = useAction(api.submitJournal.submit);

  // --- Handlers ---
  const handleSubmit = async () => {
    if (!content.trim()) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      // Call the server action (which calls Gemini)
      // Hardcoded user ID for Phase 4/5 demo
      const response = await submitJournal({
        userId: "users:123" as any, 
        journalText: content
      });

      setResult(response);
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Failed to process journal.");
    }
  };

  const handleReset = () => {
    setContent("");
    setStatus("idle");
    setResult(null);
  };

  // --- Render: Success View ---
  if (status === "success" && result) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fade-in">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-green-800">Mining Complete!</h2>
          <p className="text-green-700 mt-2">
            We've extracted 3 sentences from your journal and added them to your deck.
          </p>
          <button 
            onClick={handleReset}
            className="mt-6 bg-white text-green-700 border border-green-200 px-6 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors"
          >
            Write Another Entry
          </button>
        </div>

        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <Sparkles className="text-indigo-500" size={20} />
          Generated Sentences
        </h3>

        <div className="space-y-4">
          {result.sentences.map((s, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className={`
                  text-xs px-2 py-1 rounded-full font-medium border
                  ${s.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' : ''}
                  ${s.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : ''}
                  ${s.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                `}>
                  {s.difficulty}
                </span>
                <span className="text-xs text-slate-400">Added just now</span>
              </div>
              
              <p className="font-chinese text-xl text-slate-900 font-medium mb-1 leading-relaxed">
                {s.original}
              </p>
              <p className="text-sm text-slate-500 font-mono mb-2">{s.pinyin}</p>
              <p className="text-slate-700">{s.translation}</p>

              {s.tags && s.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.tags.map((tag: string, i: number) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Render: Input Form ---
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">New Journal Entry</h1>
        <p className="text-slate-500">Write about your day. AI will mine sentences for you.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden relative">
        <textarea
          className="w-full h-full p-6 text-lg resize-none outline-none text-slate-700 font-chinese leading-relaxed placeholder:text-slate-300"
          placeholder="今天发生了什么？(What happened today?)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={status === "submitting"}
        />

        {/* Bottom Toolbar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium">
            {content.length} characters
          </span>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || status === "submitting"}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-white transition-all
              ${!content.trim() || status === "submitting" 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95'
              }
            `}
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Mine Sentences</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Overlay */}
        {status === "submitting" && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 text-center max-w-xs">
              <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
              <h3 className="font-bold text-slate-800 mb-2">Analyzing Context</h3>
              <p className="text-slate-500 text-sm">
                Gemini is extracting grammar points and generating study sentences...
              </p>
            </div>
          </div>
        )}
      </div>

      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center space-x-3 border border-red-100 animate-slide-up">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
