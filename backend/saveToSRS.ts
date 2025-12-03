import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Updates or Creates a Review Card in the User's SRS Deck.
 * 
 * This function accepts the calculated state of a review item (next review date, interval, etc.)
 * and persists it to the database. It handles the polymorphic relationship between
 * the review deck and Sentences, Grammar, or Characters.
 */
export const saveItem = mutation({
  args: {
    userId: v.id("users"),
    itemId: v.string(), // The ID of the Sentence, Grammar, or Character being reviewed
    itemType: v.union(
      v.literal("sentence"), 
      v.literal("grammar"), 
      v.literal("character")
    ),
    
    // SRS Algorithm Results
    // These values are typically calculated by the client or a utility helper
    // before being sent to this mutation.
    nextReview: v.number(), // Unix timestamp
    interval: v.number(),   // Days
    easeFactor: v.number(), // Multiplier (e.g., 2.5)
    status: v.union(
      v.literal("new"), 
      v.literal("learning"), 
      v.literal("review"), 
      v.literal("mastered")
    ),
  },
  handler: async (ctx, args) => {
    // 1. Determine the specific ID field based on itemType
    // This maps the generic 'itemId' to the specific schema column
    let idField: "sentenceId" | "grammarId" | "characterId";
    let normalizedId: string = args.itemId;

    switch (args.itemType) {
      case "sentence":
        idField = "sentenceId";
        break;
      case "grammar":
        idField = "grammarId";
        break;
      case "character":
        idField = "characterId";
        break;
    }

    // 2. Check for existing review card
    // We filter by User and the specific Item ID.
    // Note: optimizing this with a compound index [userId, type, itemId] 
    // would be better for scale, but filtering is acceptable for Phase 2.
    const existingCard = await ctx.db
      .query("user_review_deck")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field(idField), normalizedId))
      .first();

    const now = Date.now();

    if (existingCard) {
      // 3a. Update existing card
      await ctx.db.patch(existingCard._id, {
        nextReview: args.nextReview,
        interval: args.interval,
        easeFactor: args.easeFactor,
        status: args.status,
        lastReview: now,
      });
      return { action: "updated", id: existingCard._id };
    } else {
      // 3b. Create new card
      // We explicitly construct the object to satisfy the union type requirements
      const newCardData: any = {
        userId: args.userId,
        type: args.itemType,
        nextReview: args.nextReview,
        interval: args.interval,
        easeFactor: args.easeFactor,
        status: args.status,
        lastReview: now,
      };

      // Assign the specific ID field (e.g., sentenceId: "...")
      newCardData[idField] = normalizedId;

      const newId = await ctx.db.insert("user_review_deck", newCardData);
      return { action: "created", id: newId };
    }
  },
});