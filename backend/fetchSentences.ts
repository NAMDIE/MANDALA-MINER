import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";

// --------------------------------------------------------------------------
// Types for Populated Response
// --------------------------------------------------------------------------

export interface PopulatedSentence {
  _id: Id<"sentences">;
  _creationTime: number;
  userId: Id<"users">;
  journalId?: Id<"journals">;
  original: string;
  pinyin: string;
  translation: string;
  difficulty?: string;
  tags?: string[];
  source: string;
  audioUrl?: string;
  createdAt: number;
  
  // Enriched Data
  relatedGrammar: Doc<"grammar">[];
  characterDetails: Doc<"characters">[];
}

// --------------------------------------------------------------------------
// Query Definition
// --------------------------------------------------------------------------

export const get = query({
  args: {
    userId: v.id("users"),
    difficulty: v.optional(v.string()), // e.g., "Easy", "Medium", "Hard"
    topic: v.optional(v.string()), // Search string for tags or content
    hasAudio: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Fetch Sentences for the User
    // We use the 'by_user' index for efficiency
    const sentencesQuery = ctx.db
      .query("sentences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    let sentences = await sentencesQuery.collect();

    // 2. Apply In-Memory Filters
    // Note: specific filtering beyond the index is done in application logic
    if (args.difficulty) {
      sentences = sentences.filter((s) => s.difficulty === args.difficulty);
    }

    if (args.hasAudio) {
      sentences = sentences.filter((s) => !!s.audioUrl);
    }

    if (args.topic) {
      const search = args.topic.toLowerCase();
      sentences = sentences.filter((s) => {
        const inTags = s.tags?.some((t) => t.toLowerCase().includes(search));
        const inTrans = s.translation.toLowerCase().includes(search);
        return inTags || inTrans;
      });
    }

    // Apply Limit (Default to 20 if not specified to prevent massive joins)
    const limit = args.limit ?? 20;
    const limitedSentences = sentences.slice(0, limit);

    // 3. Populate Grammar and Characters
    // We process each sentence to find related dictionary entries.
    
    const populatedSentences: PopulatedSentence[] = await Promise.all(
      limitedSentences.map(async (sentence) => {
        
        // --- Join Grammar ---
        // Strategy: Check if any of the sentence tags match a known grammar point.
        // In a production app, we might store grammar IDs on the sentence, 
        // but here we infer connection via tags (as set by the AI in submitJournal).
        let relatedGrammar: Doc<"grammar">[] = [];
        
        if (sentence.tags && sentence.tags.length > 0) {
          // We can't do an "IN" query easily, so we map the tags.
          // Optimization: This performs N queries per sentence. 
          // Acceptable for small page sizes (limit=20).
          const grammarPromises = sentence.tags.map(async (tag) => {
            // Check if this tag exists as a grammar point
            // Note: Schema doesn't enforce unique points, so we take first match
            const g = await ctx.db
              .query("grammar")
              .filter((q) => q.eq(q.field("point"), tag))
              .first();
            return g;
          });
          
          const results = await Promise.all(grammarPromises);
          relatedGrammar = results.filter((g): g is Doc<"grammar"> => g !== null);
        }

        // --- Join Characters ---
        // Strategy: Break down the 'original' string into unique characters 
        // and fetch their details from the 'characters' table.
        const uniqueChars = Array.from(new Set(sentence.original.split("")));
        
        // Filter out punctuation or non-Chinese characters roughly if needed,
        // but for now, we just query the table. If it's not there, it's ignored.
        const charPromises = uniqueChars.map(async (char) => {
          return await ctx.db
            .query("characters")
            .withIndex("by_char", (q) => q.eq("char", char))
            .first();
        });

        const charResults = await Promise.all(charPromises);
        const characterDetails = charResults.filter(
          (c): c is Doc<"characters"> => c !== null
        );

        return {
          ...sentence,
          relatedGrammar,
          characterDetails,
        };
      })
    );

    return populatedSentences;
  },
});
