import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClientInstance: GoogleGenerativeAI | null = null;

/**
 * Exports a function to initialize the GoogleGenerativeAI client using the GEMINI_API_KEY from process.env.
 * Uses lazy initialization and safe environment variable access.
 */
export function initializeGoogleGenerativeAI(customKey?: string): GoogleGenerativeAI {
  const apiKey = 
    customKey || 
    (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '') || 
    '';

  if (!apiKey) {
    console.warn(
      'GEMINI_API_KEY environment variable is not defined in process.env. ' +
      'Please ensure GEMINI_API_KEY is configured in your .env file or platform secrets.'
    );
  }

  geminiClientInstance = new GoogleGenerativeAI(apiKey);
  return geminiClientInstance;
}

/**
 * Returns the initialized GoogleGenerativeAI client, creating one lazily if needed.
 */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClientInstance) {
    return initializeGoogleGenerativeAI();
  }
  return geminiClientInstance;
}

/**
 * Utility function to generate trip insights for Kerala responsible travel.
 * Calls the resilient server-side endpoint which includes automatic retries,
 * model tier cascades (to handle 503 high demand), and fallback matrices.
 *
 * @param query The traveler's query or itinerary objective
 * @param context Additional trip preferences (budget, days, traveler type, destinations)
 */
export async function generateTripInsights(
  query: string, 
  context?: Record<string, any>
): Promise<string> {
  try {
    const res = await fetch('/api/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, preferences: context })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.insights) {
        return data.insights;
      }
    }
  } catch (error: any) {
    console.warn('generateTripInsights server call encountered an issue; returning curated corridor insight:', error);
  }

  return (
    'Responsible Route Insight: Take the coastal passenger train (₹15) or green KSRTC bus (₹45) between ' +
    'Thiruvananthapuram and Varkala. This cuts carbon footprints by ~80% and avoids taxi surge pricing. ' +
    'Ensure arrival at Varkala North Cliff before 5:30 PM for safe daylight walking along the cliff paths.'
  );
}

export default initializeGoogleGenerativeAI;
