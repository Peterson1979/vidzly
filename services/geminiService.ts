
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT, MOCK_API_DELAY } from '../constants';

// The API key is assumed to be pre-configured, valid, and accessible via process.env.API_KEY.
// As per guidelines, this initialization should not fail due to API key issues.
// The '!' asserts that process.env.API_KEY is not undefined, based on this assumption.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getVideoSummary = async (title: string, description: string): Promise<string> => {
  // The 'if (!ai)' check for mock data due to missing key is removed because 'ai' is assumed to be initialized.
  // The try/catch around ai.models.generateContent will handle runtime API errors.
  try {
    const prompt = `Provide a concise, engaging summary (2-3 sentences, max 150 characters) for a YouTube video titled "${title}" with description: "${description}". Highlight its key appeal or what a viewer can expect.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
    });

    let summaryText = response.text;
    
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = summaryText.match(fenceRegex);
    if (match && match[2]) {
      summaryText = match[2].trim();
    }

    return summaryText.trim();

  } catch (error) {
    console.error("Error fetching summary from Gemini:", error);
    // Fallback to mock data or error string if the API call fails for any reason
    if (error instanceof Error && (error.message.includes("API key not valid") || error.message.includes("API key is invalid") || error.message.includes("API_KEY_INVALID"))) {
         return `Could not generate summary: Invalid Gemini API Key. Please check your configuration.`;
    }
    // Generic fallback for other errors
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`This is a mock AI summary for "${title}". Key points: This video seems to be about ${description.substring(0,50)}... It likely offers engaging content, potentially high production value, and a clear message. Viewers often find this type of video informative and entertaining.`);
      }, MOCK_API_DELAY / 2); 
    });
  }
};
