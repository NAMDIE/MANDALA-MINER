
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../backend/_generated/api";
import { Id, Doc } from "../backend/_generated/dataModel";
import { safeAction, safeMutation, safeQuery } from "../utils/convexClient";
import { useState, useCallback } from "react";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export type UserId = Id<"users">;
export type JournalId = Id<"journals">;
export type SentenceId = Id<"sentences">;

export interface SRSItem {
  _id: string;
  type: "sentence" | "grammar" | "character";
  nextReview: number;
  interval: number;
  easeFactor: number;
  status: "new" | "learning" | "review" | "mastered";
}

// --------------------------------------------------------------------------
// Imperative Service (Non-Reactive)
// Use these inside event handlers, standard functions, or async logic.
// --------------------------------------------------------------------------

export const ConvexService = {
  
  /**
   * Triggers the AI journal analysis pipeline.
   */
  async submitJournal(userId: string, text: string) {
    return safeAction(api.submitJournal.submit, {
      userId: userId as UserId,
      journalText: text,
    });
  },

  /**
   * Fetches sentences with optional filters.
   * Note: For reactive UI, use the useSentences hook instead.
   */
  async fetchSentences(userId: string, limit = 20) {
    return safeQuery(api.fetchSentences.get, {
      userId: userId as UserId,
      limit,
    });
  },

  /**
   * Persists an SRS review result.
   */
  async saveToSRS(userId: string, item: SRSItem) {
    return safeMutation(api.saveToSRS.saveItem, {
      userId: userId as UserId,
      itemId: item._id,
      itemType: item.type,
      nextReview: item.nextReview,
      interval: item.interval,
      easeFactor: item.easeFactor,
      status: item.status,
    });
  },

  /**
   * Generates audio for a sentence.
   */
  async generateAudio(sentenceId: string) {
    return safeAction(api.generateAudio.generate, {
      sentenceId: sentenceId as SentenceId,
    });
  }
};

// --------------------------------------------------------------------------
// Reusable Hooks (Reactive)
// Use these inside React components.
// --------------------------------------------------------------------------

/**
 * Hook to fetch sentences with built-in filtering state.
 */
export function useSentences(userId: string, initialLimit = 50) {
  const [filters, setFilters] = useState({
    difficulty: undefined as string | undefined,
    topic: undefined as string | undefined,
    hasAudio: undefined as boolean | undefined,
  });

  const data = useQuery(api.fetchSentences.get, {
    userId: userId as UserId,
    limit: initialLimit,
    difficulty: filters.difficulty,
    topic: filters.topic,
    hasAudio: filters.hasAudio,
  });

  return {
    sentences: data,
    isLoading: data === undefined,
    filters,
    setFilter: (key: keyof typeof filters, value: any) => 
      setFilters(prev => ({ ...prev, [key]: value })),
  };
}

/**
 * Hook for Journal Submission with automatic loading/error state management.
 */
export function useSubmitJournal() {
  const submitAction = useAction(api.submitJournal.submit);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const submit = useCallback(async (userId: string, text: string) => {
    setStatus("loading");
    setError(null);
    try {
      const res = await submitAction({ userId: userId as UserId, journalText: text });
      setResult(res);
      setStatus("success");
      return res;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit journal");
      setStatus("error");
      throw err;
    }
  }, [submitAction]);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setResult(null);
  }, []);

  return { submit, status, error, result, reset };
}

/**
 * Hook for SRS updates.
 */
export function useSRS() {
  const saveMutation = useMutation(api.saveToSRS.saveItem);
  
  const save = useCallback(async (userId: string, item: SRSItem) => {
    return saveMutation({
      userId: userId as UserId,
      itemId: item._id,
      itemType: item.type,
      nextReview: item.nextReview,
      interval: item.interval,
      easeFactor: item.easeFactor,
      status: item.status,
    });
  }, [saveMutation]);

  return { save };
}

/**
 * Hook for Audio Generation.
 */
export function useAudioGenerator() {
  const generateAction = useAction(api.generateAudio.generate);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (sentenceId: string) => {
    setIsGenerating(true);
    try {
      const result = await generateAction({ sentenceId: sentenceId as SentenceId });
      return result; // { status, url }
    } catch (err) {
      console.error("Audio generation failed", err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [generateAction]);

  return { generate, isGenerating };
}
