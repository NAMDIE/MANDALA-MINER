import { GoogleGenAI, Type, Schema } from "@google/genai";

// --------------------------------------------------------------------------
// Type Definitions
// --------------------------------------------------------------------------

export interface AISentenceResult {
  original: string;
  pinyin: string;
  translation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  grammarPoint?: string;
}

export interface AIGrammarResult {
  point: string;
  level: string;
  explanation: string;
  structure: string;
  exampleSentence: {
    original: string;
    translation: string;
  };
}

export interface AICharacterResult {
  char: string;
  pinyin: string[];
  meaning: string[];
  hskLevel: number;
  components: string[];
}

// --------------------------------------------------------------------------
// AI Client Wrapper
// --------------------------------------------------------------------------

export class AIClient {
  private client: GoogleGenAI;
  private modelName: string;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
    // Using Gemini 3 Pro Preview as requested for complex linguistic tasks
    this.modelName = "gemini-3-pro-preview";
  }

  /**
   * Generates example sentences based on a topic or context.
   * 
   * @param context - The topic, keyword, or journal entry to base sentences on.
   * @param count - Number of sentences to generate (default 3).
   */
  async generateSentences(context: string, count: number = 3): Promise<AISentenceResult[]> {
    // TODO: Implement actual Gemini 3 call
    // 1. Define Prompt
    // 2. Define ResponseSchema (Type.ARRAY of Type.OBJECT)
    // 3. Call ai.models.generateContent
    
    console.log(`[AIClient] Generating ${count} sentences for context: "${context.substring(0, 20)}..."`);

    // Dummy Implementation
    const results: AISentenceResult[] = [
      {
        original: "这是一个自动生成的句子。",
        pinyin: "Zhè shì yīgè zìdòng shēngchéng de jùzi.",
        translation: "This is an automatically generated sentence.",
        difficulty: "Easy",
        grammarPoint: "是 (to be)"
      },
      {
        original: "Gemini 3 模型非常强大。",
        pinyin: "Gemini 3 móxíng fēicháng qiángdà.",
        translation: "The Gemini 3 model is very powerful.",
        difficulty: "Medium",
        grammarPoint: "非常 (very)"
      },
      {
        original: "通过上下文学习是最有效的方法之一。",
        pinyin: "Tōngguò shàngxiàwén xuéxí shì zuì yǒuxiào de fāngfǎ zhī yī.",
        translation: "Learning through context is one of the most effective methods.",
        difficulty: "Hard",
        grammarPoint: "之一 (one of)"
      }
    ];
    return results.slice(0, count);
  }

  /**
   * Extracts or explains a specific grammar point found in text.
   * 
   * @param sentence - The sentence containing the grammar.
   * @param point - (Optional) Specific point to analyze, otherwise AI detects it.
   */
  async extractGrammar(sentence: string, point?: string): Promise<AIGrammarResult | null> {
    // TODO: Implement actual Gemini 3 call
    // Goal: return structured grammar explanation for the 'grammar' collection
    
    console.log(`[AIClient] Extracting grammar for: "${sentence}"`);

    // Dummy Implementation
    return {
      point: point || "把 Structure",
      level: "HSK3",
      explanation: "Used when the subject acts upon an object, changing its state or position.",
      structure: "Subject + 把 + Object + Verb + Result",
      exampleSentence: {
        original: "请把门关上。",
        translation: "Please close the door."
      }
    };
  }

  /**
   * Decomposes a character into its details (meanings, components, etc.).
   * 
   * @param char - The single Chinese character to analyze.
   */
  async extractCharacters(char: string): Promise<AICharacterResult | null> {
    // TODO: Implement actual Gemini 3 call
    
    console.log(`[AIClient] Analyzing character: "${char}"`);

    // Dummy Implementation
    return {
      char: char,
      pinyin: ["zì"],
      meaning: ["character", "word", "letter"],
      hskLevel: 1,
      components: ["宀", "子"]
    };
  }
}