import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all sentences (ordered by newest first)
export const getSentences = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("sentences")
      .order("desc")
      .collect();
  },
});

// Get sentences filtered by difficulty
export const getSentencesByDifficulty = query({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sentences")
      .withIndex("difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();
  },
});

// Get a single sentence by ID
export const getSentence = query({
  args: { id: v.id("sentences") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Search sentences by Chinese text
export const searchSentences = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allSentences = await ctx.db.query("sentences").collect();
    return allSentences.filter((sentence) =>
      sentence.original.includes(args.searchTerm) ||
      sentence.translation.toLowerCase().includes(args.searchTerm.toLowerCase())
    );
  },
});

// Add a new sentence
export const addSentence = mutation({
  args: {
    original: v.string(),
    pinyin: v.optional(v.string()),
    translation: v.string(),
    difficulty: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sentenceId = await ctx.db.insert("sentences", {
      ...args,
      createdAt: Date.now(),
    });
    return sentenceId;
  },
});

// Update a sentence
export const updateSentence = mutation({
  args: {
    id: v.id("sentences"),
    original: v.optional(v.string()),
    pinyin: v.optional(v.string()),
    translation: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a sentence
export const deleteSentence = mutation({
  args: { id: v.id("sentences") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get random sentences for practice (limit to N sentences)
export const getRandomSentences = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const allSentences = await ctx.db.query("sentences").collect();

    // Shuffle and return limited results
    const shuffled = allSentences.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, args.limit);
  },
});
