import { GoogleGenAI, Type } from "@google/genai";
import { ParseResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseTransactionText = async (text: string, language: 'en' | 'ar'): Promise<ParseResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following financial transaction text into structured data.
      Today is ${new Date().toLocaleDateString()}.
      User input: "${text}"
      User Language Context: ${language === 'ar' ? 'Arabic' : 'English'}
      Default Currency: Moroccan Dirham (DH/MAD).
      
      Rules:
      1. Extract the amount. Ignore currency symbols unless they indicate a specific conversion is needed (but just return the number).
      2. Extract a short description in the same language as the input.
      3. Infer a specific category (e.g., Food, Transport, Salary, Utilities, Health, Entertainment) in English (to match system keys) or the input language if appropriate, but standardizing on English capitalized keys is preferred for the system.
      4. Determine if it is 'income' (salary, received) or 'expense' (spent, paid).
      5. If the type is ambiguous, default to 'expense'.
      6. If no description is provided, use 'General'.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["income", "expense"] }
          },
          required: ["amount", "description", "category", "type"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ParseResult;
    }
    return null;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};
