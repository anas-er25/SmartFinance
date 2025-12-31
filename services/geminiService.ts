import { GoogleGenAI, Type } from "@google/genai";
import { ParseResult, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseTransactionText = async (text: string, language: Language): Promise<ParseResult | null> => {
  try {
    const langContext = language === 'ar' ? 'Arabic' : (language === 'fr' ? 'French' : 'English');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following financial transaction text into structured data.
      Today is ${new Date().toLocaleDateString()}.
      User input: "${text}"
      User Language Context: ${langContext}
      Default Currency: Moroccan Dirham (DH/MAD).
      
      Rules:
      1. Extract the amount.
      2. Extract a short description in the same language as the input.
      3. Infer a specific category (e.g., Food, Transport, Salary, Utilities, Health, Entertainment, Loans) in English.
      4. Determine 'income' (salary, freelance, sold item) or 'expense'. Default to 'expense'.
         - Note: Lending money is an 'expense' (money leaving wallet), receiving money is 'income'.
      5. If no description is provided, use 'General'.
      
      Advanced Analysis Rules:
      6. 'Harmful' Analysis: Set isHarmful to true if the item is damaging to health OR financial well-being.
         - Health: Tobacco, Alcohol, Shisha, Drugs.
         - Financial Risk: Gambling, Betting, Lottery, Casinos.
      
      7. 'Unnecessary' Analysis: Set isUnnecessary to true if it is a 'want' not a 'need'.
         - 'Impulse Buy': Cheap, unplanned, e.g., candy, trinkets.
         - 'Luxury': Expensive, high-end brands, designer items.
         - 'Subscription': Recurring entertainment services (Netflix, Spotify) if not essential.
      
      8. 'analysisReasoning': Provide a concise reason (max 10 words).
      
      9. 'Recurrence': Detect if the user mentions repetition.
         - Keywords: "monthly", "every month", "weekly", "daily", "every week".
         - Return enum: 'daily', 'weekly', 'monthly', or 'none'.

      10. 'Lending/Debt': Detect if the user is lending money.
         - If user says "Lent 500 to Ahmed" or "Gave 200 to John to return later".
         - Set 'isLoan' to true.
         - Extract 'borrower' name.
         - Extract 'repaymentDate' if specified (return as ISO string or simplified date string).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["income", "expense"] },
            recurrence: { type: Type.STRING, enum: ["none", "daily", "weekly", "monthly"] },
            isHarmful: { type: Type.BOOLEAN },
            isUnnecessary: { type: Type.BOOLEAN },
            analysisReasoning: { type: Type.STRING },
            isLoan: { type: Type.BOOLEAN },
            borrower: { type: Type.STRING },
            repaymentDate: { type: Type.STRING }
          },
          required: ["amount", "description", "category", "type", "isHarmful", "isUnnecessary", "analysisReasoning"]
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