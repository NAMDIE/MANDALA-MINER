import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Store mined Mandarin sentences
  sentences: defineTable({
    chineseText: v.string(),
    pinyin: v.optional(v.string()),
    englishTranslation: v.string(),
    difficulty: v.optional(v.string()), // "beginner", "intermediate", "advanced"
    tags: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(), // timestamp
    userId: v.optional(v.string()), // if you want user-specific sentences
  })
    .index("createdAt", ["createdAt"])
    .index("difficulty", ["difficulty"]),
  
  // Store vocabulary words from sentences
  vocabulary: defineTable({
    word: v.string(),
    pinyin: v.string(),
    definition: v.string(),
    sentenceIds: v.array(v.id("sentences")), // links to sentences
    timesReviewed: v.number(),
    lastReviewed: v.optional(v.number()),
  })
    .index("word", ["word"]),
    
  // Store user study sessions
  studySessions: defineTable({
    userId: v.optional(v.string()),
    sentenceId: v.id("sentences"),
    correct: v.boolean(),
    timestamp: v.number(),
  })
    .index("userId", ["userId"])
    .index("sentenceId", ["sentenceId"]),
});
