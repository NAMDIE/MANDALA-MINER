import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema for Mandarin Sentence-Mining App
 * 
 * Collections:
 * - users: App users and their settings.
 * - journals: Raw text input by users.
 * - sentences: Processed/Mined sentences with metadata.
 * - grammar: Reference table for grammar points.
 * - characters: Reference table for character breakdown.
 * - user_review_deck: SRS (Spaced Repetition System) state for users.
 */
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(), // Auth provider ID
    targetLevel: v.optional(v.string()), // e.g., 'HSK3'
    dailyGoal: v.optional(v.number()), // Target sentences to mine/review per day
  }).index("by_token", ["tokenIdentifier"]),

  journals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(), // The raw text entry
    createdAt: v.number(),
    processed: v.boolean(), // True if sentences have been extracted
  }).index("by_user", ["userId"]),

  sentences: defineTable({
    userId: v.id("users"),
    journalId: v.optional(v.id("journals")), // Optional: manually created sentences might not have a journal
    original: v.string(), // The sentence in Hanzi
    pinyin: v.string(),
    translation: v.string(),
    difficulty: v.optional(v.string()), // 'Easy', 'Medium', 'Hard'
    tags: v.optional(v.array(v.string())), // e.g., ['business', 'casual', 'idiom']
    source: v.string(), // e.g., 'Journal', 'Manual', 'Import'
    audioUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_journal", ["journalId"]),

  grammar: defineTable({
    point: v.string(), // The core pattern, e.g., "把..."
    level: v.string(), // e.g., "HSK3"
    explanation: v.string(),
    structure: v.string(), // Visual structure representation
    exampleSentences: v.array(
      v.object({
        original: v.string(),
        translation: v.string(),
      })
    ),
  }).index("by_level", ["level"]),

  characters: defineTable({
    char: v.string(),
    pinyin: v.array(v.string()), // Can have multiple pronunciations
    meaning: v.array(v.string()),
    hskLevel: v.number(),
    components: v.optional(v.array(v.string())), // Radicals or sub-components
    strokes: v.optional(v.number()),
  }).index("by_char", ["char"]),

  user_review_deck: defineTable({
    userId: v.id("users"),
    
    // Polymorphic relationship to the item being reviewed
    type: v.union(
      v.literal("sentence"), 
      v.literal("grammar"), 
      v.literal("character")
    ),
    sentenceId: v.optional(v.id("sentences")),
    grammarId: v.optional(v.id("grammar")),
    characterId: v.optional(v.id("characters")),

    // SRS Algorithm Fields (SuperMemo-2 / Anki style)
    nextReview: v.number(), // Timestamp for next review eligibility
    interval: v.number(), // Current interval in days
    easeFactor: v.number(), // Multiplier for interval growth (default usually 2.5)
    status: v.union(
      v.literal("new"), 
      v.literal("learning"), 
      v.literal("review"), 
      v.literal("mastered")
    ),
    lastReview: v.optional(v.number()),
  })
  .index("by_user", ["userId"])
  .index("by_user_next_review", ["userId", "nextReview"]),
});