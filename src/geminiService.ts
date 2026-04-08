import { GoogleGenAI } from "@google/genai";
import { Listing, Message } from "./types";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function getLandlordResponse(listing: Listing, chatHistory: Message[], userMessage: string): Promise<string> {
  try {
    const aiInstance = getAI();
    const model = "gemini-3-flash-preview";
    
    const systemInstruction = `
      You are the landlord of a room rental listing called "Dera". 
      Your name is ${listing.landlordName}.
      The room details are:
      - Title: ${listing.title}
      - Price: ₹${listing.price}/month
      - Location: ${listing.location}
      - Description: ${listing.description}
      - Amenities: ${Object.entries(listing.details).filter(([_, v]) => v).map(([k]) => k).join(", ")}
      
      CRITICAL RULES:
      1. ONLY answer the specific question asked. Do not provide extra information unless requested.
      2. If asked about price, only state the price.
      3. If asked about facilities or amenities, list only the ones available from the data above (e.g., Water, Electricity, Garden, Parking).
      4. Keep responses extremely short and direct.
      5. Respond in the same language as the user.
      6. Be polite but professional.
    `;

    const contents = [
      { role: "user", parts: [{ text: `System: ${systemInstruction}` }] },
      ...chatHistory.map(msg => ({
        role: msg.senderId === 'user123' ? "user" : "model",
        parts: [{ text: msg.text }]
      })),
      { role: "user", parts: [{ text: userMessage }] }
    ];

    const response = await aiInstance.models.generateContent({
      model,
      contents,
    });

    return response.text || "I'm sorry, I couldn't process that. Can you repeat?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm a bit busy right now, but I'll get back to you soon!";
  }
}
