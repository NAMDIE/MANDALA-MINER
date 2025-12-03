import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { GoogleGenAI, Type } from "@google/genai";

// --------------------------------------------------------------------------
// Schema & Types for AI Response
// --------------------------------------------------------------------------

// We define the expected JSON structure for Gemini here to ensure type safety
const GeneratedSentenceSchema = {
  type: Type.OBJECT,
  properties: {
    original: { type: Type.STRING, description: "The sentence in Chinese characters" },
    pinyin: { type: Type.STRING, description: "Pinyin with tone marks" },
    translation: { type: Type.STRING, description: "English translation" },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"], description: "Difficulty level" },
    grammarPoint: { type: Type.STRING, description: "Key grammar point used in this sentence" },
    newCharacters: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of potentially new characters" },
  },
  required: ["original", "pinyin", "translation", "difficulty"],
};

const AnalysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A concise title for the journal entry" },
    sentences: {
      type: Type.ARRAY,
      items: GeneratedSentenceSchema,
      description: "3 generated sentences (Beginner, Intermediate, Advanced) based on the journal topic",
    },
  },
  required: ["title", "sentences"],
};

// --------------------------------------------------------------------------
// Internal Mutation: Database Writes
// --------------------------------------------------------------------------

/**
 * Saves the analyzed journal and generated sentences to the database.
 * This is an internal mutation, so it can only be called by functions within the app.
 */
export const saveJournalData = internalMutation({
  args: {
    userId: v.id("users"),
    content: v.string(),
    analysis: v.object({
      title: v.string(),
      sentences: v.array(
        v.object({
          original: v.string(),
          pinyin: v.string(),
          translation: v.string(),
          difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
          grammarPoint: v.optional(v.string()),
          newCharacters: v.optional(v.array(v.string())),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    // 1. Save the Journal Entry
    const journalId = await ctx.db.insert("journals", {
      userId: args.userId,
      title: args.analysis.title,
      content: args.content,
      createdAt: Date.now(),
      processed: true,
    });

    // 2. Save the Generated Sentences
    const savedSentences = [];
    for (const s of args.analysis.sentences) {
      // Construct tags from grammar and difficulty
      const tags = [];
      if (s.grammarPoint) tags.push(s.grammarPoint);
      if (s.newCharacters && s.newCharacters.length > 0) tags.push("New Char");

      const sentenceId = await ctx.db.insert("sentences", {
        userId: args.userId,
        journalId: journalId,
        original: s.original,
        pinyin: s.pinyin,
        translation: s.translation,
        difficulty: s.difficulty,
        tags: tags,
        source: "Journal",
        createdAt: Date.now(),
      });

      savedSentences.push({ ...s, _id: sentenceId });
    }

    return { journalId, sentences: savedSentences };
  },
});

// --------------------------------------------------------------------------
// Action: Gemini Integration
// --------------------------------------------------------------------------

/**
 * Public action to submit a journal entry.
 * It calls Gemini to analyze the text and then triggers an internal mutation to save it.
 */
export const submit = action({
  args: {
    userId: v.id("users"),
    journalText: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Initialize Gemini
    // Note: API Key must be set in the Convex Dashboard Environment Variables
    if (!process.env.API_KEY) {
      throw new Error("Missing API_KEY in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Construct the Prompt
    // We explicitly ask for 3 levels of sentences to seed the user's study deck.
    const prompt = `
      Analyze the following Mandarin journal entry provided by a learner.
      
      Journal Content:
      "${args.journalText}"

      Tasks:
      1. Extract a short, relevant title.
      2. Generate 3 example sentences related to the topic of this journal:
         - One "Easy" (HSK 1-2 level)
         - One "Medium" (HSK 3-4 level)
         - One "Hard" (HSK 5-6 level)
      3. For each sentence, identify the key grammar point and any potentially difficult characters.
    `;

    // 3. Call Gemini 3 Pro (Preview) for complex reasoning and JSON output
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: AnalysisResponseSchema,
        },
      });

      const jsonText = response.text;
      if (!jsonText) {
        throw new Error("Empty response from AI model.");
      }

      // 4. Parse Response
      const analysis = JSON.parse(jsonText);

      // 5. Save to Database via Internal Mutation
      const result = await ctx.runMutation(internal.submitJournal.saveJournalData, {
        userId: args.userId,
        content: args.journalText,
        analysis: analysis,
      });

      return result;

    } catch (error) {
      console.error("Gemini API Error:", error);
      // Determine if it's a transient API error or a logic error
      if (error instanceof Error) {
        throw new Error(`Journal processing failed: ${error.message}`);
      }
      throw new Error("An unexpected error occurred during journal processing.");
    }
  },
});
