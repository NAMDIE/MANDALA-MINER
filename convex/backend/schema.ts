import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Store mined Mandarin sentences
  sentences: defineTable({
    original: v.string(), // Renamed from chineseText to match code
    pinyin: v.optional(v.string()),
    translation: v.string(), // Renamed from englishTranslation to match code usage in some places, or keep both? fetchSentences uses translation.
    englishTranslation: v.optional(v.string()), // Keeping this for safety if used elsewhere
    difficulty: v.optional(v.string()), // "Easy", "Medium", "Hard"
    tags: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(), // timestamp
    userId: v.string(),
    audioUrl: v.optional(v.string()),
    journalId: v.optional(v.id("journals")),
  })
    .index("by_user", ["userId"])
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

  // Journals
  journals: defineTable({
    userId: v.string(),
    title: v.optional(v.string()),
    content: v.string(),
    createdAt: v.number(),
    processed: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  // SRS Deck
  user_review_deck: defineTable({
    userId: v.string(),
    sentenceId: v.optional(v.id("sentences")),
    characterId: v.optional(v.id("characters")),
    grammarId: v.optional(v.id("grammar")),
    type: v.string(), // "sentence", "character", "grammar"
    nextReview: v.number(),
    lastReview: v.optional(v.number()),
    interval: v.number(),
    easeFactor: v.number(),
    status: v.optional(v.string()), // "learning", "review", "relearning"
    history: v.optional(v.array(v.object({
      date: v.number(),
      grade: v.number(),
    }))),
  })
    .index("by_user", ["userId"])
    .index("by_next_review", ["userId", "nextReview"]),

  // Grammar Points
  grammar: defineTable({
    point: v.string(),
    explanation: v.string(),
    level: v.optional(v.string()),
  }).index("point", ["point"]), // Assuming point is unique enough for lookup

  // Characters
  characters: defineTable({
    char: v.string(),
    pinyin: v.string(),
    meaning: v.string(),
    components: v.optional(v.array(v.string())),
  }).index("by_char", ["char"]),
});
