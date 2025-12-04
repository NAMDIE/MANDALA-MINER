import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

if (!API_KEY) {
    console.warn("EXPO_PUBLIC_GEMINI_KEY is not set");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const GeminiService = {
    async analyzeSentence(sentence: string) {
        const MAX_RETRIES = 3;
        let attempt = 0;

        while (attempt < MAX_RETRIES) {
            try {
                const prompt = `Analyze the following Mandarin sentence: "${sentence}". 
      Provide a JSON response with:
      - original: the sentence
      - translation: English translation
      - pinyin: Pinyin with tone marks
      - difficulty: "Easy", "Medium", or "Hard"
      - breakdown: array of characters with pinyin and meaning
      `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                // Clean up markdown code blocks if present
                const jsonStr = text.replace(/```json/g, "").replace(/```/g, "");
                return JSON.parse(jsonStr);
            } catch (error) {
                attempt++;
                console.warn(`Gemini analysis attempt ${attempt} failed:`, error);
                if (attempt >= MAX_RETRIES) {
                    console.error("Gemini analysis failed after max retries:", error);
                    throw error;
                }
                // Exponential backoff: 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
            }
        }
    },

    async generateExample(word: string) {
        // Implementation for generating examples
        return null;
    }
};
