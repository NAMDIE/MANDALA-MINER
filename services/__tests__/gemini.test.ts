const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent,
}));

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: mockGetGenerativeModel,
        })),
    };
});

// The GeminiService needs to be imported after its dependencies are mocked.
// Using require here ensures it's loaded after the mock is set up.
const { GeminiService } = require('../gemini');

describe('GeminiService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should analyze sentence successfully', async () => {
        const mockResponse = {
            text: () => JSON.stringify({
                original: "你好",
                translation: "Hello",
                pinyin: "nǐ hǎo",
                difficulty: "Easy",
                breakdown: []
            })
        };

        mockGenerateContent.mockResolvedValue({
            response: mockResponse
        });

        const result = await GeminiService.analyzeSentence("你好");

        expect(result).toEqual({
            original: "你好",
            translation: "Hello",
            pinyin: "nǐ hǎo",
            difficulty: "Easy",
            breakdown: []
        });
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
        const mockResponse = {
            text: () => JSON.stringify({
                original: "你好",
                translation: "Hello",
                pinyin: "nǐ hǎo",
                difficulty: "Easy",
                breakdown: []
            })
        };

        // Fail twice, then succeed
        mockGenerateContent
            .mockRejectedValueOnce(new Error("API Error"))
            .mockRejectedValueOnce(new Error("API Error"))
            .mockResolvedValue({ response: mockResponse });

        const result = await GeminiService.analyzeSentence("你好");

        expect(result).toEqual({
            original: "你好",
            translation: "Hello",
            pinyin: "nǐ hǎo",
            difficulty: "Easy",
            breakdown: []
        });
        expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
        mockGenerateContent.mockRejectedValue(new Error("API Error"));

        await expect(GeminiService.analyzeSentence("你好")).rejects.toThrow("API Error");
        expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    });
});
