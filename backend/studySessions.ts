import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Record a study session
export const recordSession = mutation({
  args: {
    userId: v.optional(v.string()),
    sentenceId: v.id("sentences"),
    correct: v.boolean(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("studySessions", {
      ...args,
      timestamp: Date.now(),
    });
    return sessionId;
  },
});

// Get all study sessions for a user
export const getUserSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studySessions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get study statistics for a user
export const getUserStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("studySessions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    const totalSessions = sessions.length;
    const correctSessions = sessions.filter(s => s.correct).length;
    const accuracy = totalSessions > 0 ? (correctSessions / totalSessions) * 100 : 0;
    
    return {
      totalSessions,
      correctSessions,
      incorrectSessions: totalSessions - correctSessions,
      accuracy: Math.round(accuracy * 10) / 10, // Round to 1 decimal place
    };
  },
});

// Get sessions for a specific sentence
export const getSentenceSessions = query({
  args: { sentenceId: v.id("sentences") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studySessions")
      .withIndex("sentenceId", (q) => q.eq("sentenceId", args.sentenceId))
      .collect();
  },
});

// Get recent study sessions (last N sessions)
export const getRecentSessions = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db.query("studySessions").collect();
    
    // Sort by timestamp (newest first) and limit
    return sessions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, args.limit);
  },
});
