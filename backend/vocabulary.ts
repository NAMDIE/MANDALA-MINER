import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all vocabulary words
export const getVocabulary = query({
  handler: async (ctx) => {
    return await ctx.db.query("vocabulary").collect();
  },
});

// Get a single vocabulary word by ID
export const getVocabularyWord = query({
  args: { id: v.id("vocabulary") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Search for a vocabulary word
export const searchVocabulary = query({
  args: { word: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vocabulary")
      .withIndex("word", (q) => q.eq("word", args.word))
      .first();
  },
});

// Add a new vocabulary word
export const addVocabulary = mutation({
  args: {
    word: v.string(),
    pinyin: v.string(),
    definition: v.string(),
    sentenceIds: v.array(v.id("sentences")),
  },
  handler: async (ctx, args) => {
    const vocabId = await ctx.db.insert("vocabulary", {
      ...args,
      timesReviewed: 0,
    });
    return vocabId;
  },
});

// Update a vocabulary word
export const updateVocabulary = mutation({
  args: {
    id: v.id("vocabulary"),
    word: v.optional(v.string()),
    pinyin: v.optional(v.string()),
    definition: v.optional(v.string()),
    sentenceIds: v.optional(v.array(v.id("sentences"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Record a review (increment times reviewed)
export const recordReview = mutation({
  args: { id: v.id("vocabulary") },
  handler: async (ctx, args) => {
    const vocab = await ctx.db.get(args.id);
    if (!vocab) throw new Error("Vocabulary word not found");
    
    await ctx.db.patch(args.id, {
      timesReviewed: vocab.timesReviewed + 1,
      lastReviewed: Date.now(),
    });
  },
});

// Delete a vocabulary word
export const deleteVocabulary = mutation({
  args: { id: v.id("vocabulary") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get vocabulary words that need review (least recently reviewed)
export const getVocabularyForReview = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const allVocab = await ctx.db.query("vocabulary").collect();
    
    // Sort by last reviewed (oldest first), or never reviewed
    const sorted = allVocab.sort((a, b) => {
      const aTime = a.lastReviewed ?? 0;
      const bTime = b.lastReviewed ?? 0;
      return aTime - bTime;
    });
    
    return sorted.slice(0, args.limit);
  },
});
