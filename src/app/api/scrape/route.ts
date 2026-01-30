import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import * as cheerio from 'cheerio';

// Schema for extracted company info
const CompanyInfoSchema = z.object({
  company_name: z.string().describe("The official name of the company"),
  value_proposition: z.string().describe("A concise summary of what the company does and its unique value"),
  services: z.array(z.string()).describe("List of services or products offered"),
  knowledge_items: z.array(z.object({
    topic: z.string(),
    content: z.string()
  })).describe("Key facts, pricing info, refund policies, or other important Q&A knowledge extracted from the site")
});

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Fetch the website HTML
    // Use a user-agent to avoid basic blocking
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    const html = await response.text();

    // 2. Parse HTML with Cheerio to extract text
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, and other non-content elements
    $('script').remove();
    $('style').remove();
    $('nav').remove(); // Optional: remove nav to focus on main content? Sometimes nav has services though. Let's keep nav but remove footer maybe.
    $('footer').remove();
    $('iframe').remove();
    $('noscript').remove();

    // Get text content (roughly)
    // We get text from body, collapsing whitespace
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 20000); // Limit to 20k chars for LLM context

    // 3. Analyze with Gemini
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
    });

    const prompt = `
      Analyze the following website content for a company.
      Extract the Company Name, a standardized list of Services, their Value Proposition, and any specific "Knowledge Base" facts that would be useful for an AI Sales Agent to know (e.g. pricing, locations, years in business, guarantees).
      
      Website URL: ${url}
      
      Content:
      ${textContent}
    `;

    const { object } = await generateObject({
      model: google('models/gemini-1.5-flash-latest'),
      schema: CompanyInfoSchema,
      prompt: prompt,
    });

    return NextResponse.json(object);

  } catch (error) {
    console.error('Scraping failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape website' },
      { status: 500 }
    );
  }
}
