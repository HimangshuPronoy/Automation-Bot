import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { ScrapedBusiness } from '@/lib/scraper/google-maps';

// Define the Analysis Schema
export const AnalysisSchema = z.object({
  score: z.number().min(0).max(100).describe("Qualification score from 0-100"),
  summary: z.string().describe("Brief summary of the business status"),
  weakPoints: z.array(z.string()).describe("List of identified weak points (e.g., 'Low rating', 'No website')"),
  qualified: z.boolean().describe("Whether this lead is worth contacting"),
  suggestedPitch: z.string().describe("A suggested opening line for the cold call based on weak points"),
});

export type LeadAnalysis = z.infer<typeof AnalysisSchema>;

export async function analyzeLead(business: ScrapedBusiness): Promise<LeadAnalysis> {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
  });

  // Get qualification settings
  const { db } = await import('@/lib/db');
  const { data: settings } = await db.from('settings').select('*').limit(1).single();
  
  // Check if lead qualifies based on settings
  let disqualified = false;
  if (settings) {
    if (business.rating && (business.rating < settings.min_rating || business.rating > settings.max_rating)) {
      disqualified = true;
    }
    if (business.reviews && (business.reviews < settings.min_reviews || business.reviews > settings.max_reviews)) {
      disqualified = true;
    }
    if (settings.require_website && !business.website) {
      disqualified = true;
    }
  }

  const prompt = `
    Analyze this business lead found on Google Maps:
    Name: ${business.name}
    Rating: ${business.rating || 'N/A'}
    Reviews: ${business.reviews || 0}
    Website: ${business.website || 'None'}
    Address: ${business.address || 'N/A'}
    
    Identify weak points such as:
    - Rating below 4.5
    - Review count below 50
    - Missing website
    - Missing phone number (if applicable)
    
    Determine if they are a good prospect for an Automation/Marketing agency.
    If they have a low rating or low reviews, they need reputation management.
    If they have no website, they need web design.
    
    Provide a score (0-100), qualification status, a summary, and a pitch.
    RETURN JSON ONLY.
  `;

  try {
    const { object } = await generateObject({
      model: google('models/gemini-1.5-flash-latest'),
      schema: AnalysisSchema,
      prompt: prompt,
    });
    
    // Override qualification if settings disqualify them
    if (disqualified) {
      object.qualified = false;
      object.summary = "Does not meet qualification criteria";
    }
    
    return object;
  } catch (error) {
    console.error("Analysis failed:", error);
    // Fallback or re-throw
    return {
      score: 0,
      summary: "Analysis failed",
      weakPoints: [],
      qualified: false,
      suggestedPitch: "",
    };
  }
}
