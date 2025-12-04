import { action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// --------------------------------------------------------------------------
// Internal Functions (Database Access)
// --------------------------------------------------------------------------

/**
 * Fetches the sentence data required for audio generation.
 */
export const getSentenceData = internalQuery({
  args: { sentenceId: v.id("sentences") },
  handler: async (ctx, args) => {
    const sentence = await ctx.db.get(args.sentenceId);
    if (!sentence) {
      throw new Error(`Sentence not found: ${args.sentenceId}`);
    }
    return {
      text: sentence.original,
      existingAudio: sentence.audioUrl,
    };
  },
});

/**
 * Updates the sentence document with the generated audio URL.
 */
export const saveAudioUrl = internalMutation({
  args: {
    sentenceId: v.id("sentences"),
    audioUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sentenceId, {
      audioUrl: args.audioUrl,
    });
  },
});

// --------------------------------------------------------------------------
// Action: Audio Generation Logic
// --------------------------------------------------------------------------

/**
 * Generates audio for a specific sentence using MiniMax TTS (Placeholder).
 * Includes retry logic for API reliability.
 */
export const generate = action({
  args: {
    sentenceId: v.id("sentences"),
  },
  handler: async (ctx, args): Promise<{ status: string; url?: string }> => {
    // 1. Fetch Sentence Data
    const { text, existingAudio } = await ctx.runQuery(internal.generateAudio.getSentenceData, {
      sentenceId: args.sentenceId,
    }) as { text: string; existingAudio?: string };

    // Optimization: Skip if audio already exists
    if (existingAudio) {
      console.log(`Audio already exists for sentence ${args.sentenceId}`);
      return { status: "skipped", url: existingAudio };
    }

    // 2. Call TTS API with Retry Logic
    const audioUrl = await fetchMiniMaxWithRetry(text);

    // 3. Save Result
    await ctx.runMutation(internal.generateAudio.saveAudioUrl, {
      sentenceId: args.sentenceId,
      audioUrl: audioUrl,
    });

    return { status: "success", url: audioUrl };
  },
});

// --------------------------------------------------------------------------
// Helper: MiniMax API Integration
// --------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Placeholder function for MiniMax TTS API call.
 * Retries on failure with exponential backoff.
 */
async function fetchMiniMaxWithRetry(text: string): Promise<string> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      return await callMiniMaxAPI(text);
    } catch (error) {
      attempt++;
      console.error(`TTS Generation attempt ${attempt} failed:`, error);

      if (attempt >= MAX_RETRIES) {
        throw new Error(`Failed to generate audio after ${MAX_RETRIES} attempts.`);
      }

      // Exponential backoff: 1s, 2s, 4s...
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unexpected retry loop exit");
}

/**
 * Mock implementation of the specific MiniMax API call.
 * Replace with actual fetch implementation in production.
 */
async function callMiniMaxAPI(text: string): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  const groupId = process.env.MINIMAX_GROUP_ID;

  if (!apiKey || !groupId) {
    console.warn("MiniMax credentials not found. Returning mock URL.");
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `https://mock-storage.example.com/audio/${Date.now()}.mp3`;
  }

  // --- Real Implementation Placeholder ---
  /*
  const response = await fetch(`https://api.minimax.chat/v1/text_to_speech?GroupId=${groupId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      voice_id: "male-qn-qingse", 
      text: text,
      model: "speech-01",
      speed: 1.0,
      vol: 1.0,
      pitch: 0,
    }),
  });

  if (!response.ok) {
    throw new Error(`MiniMax API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Note: MiniMax usually returns a buffer or a temporary URL. 
  // In a real app, you would upload this buffer to Convex File Storage 
  // (ctx.storage) and return the storage ID/URL.
  
  if (data.base64) {
     // Upload to storage logic would go here
     return "https://convex.storage/uploaded-file-url"; 
  }
  */

  // Return dummy for now to satisfy TypeScript flow
  return `https://api.minimax.chat/generated/${Date.now()}.mp3`;
}
