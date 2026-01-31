/**
 * Vapi.ai Voice Agent Integration
 * 
 * Vapi is a voice AI platform that lets you create AI-powered phone calls.
 * This module handles:
 * 1. Initiating outbound calls to leads
 * 2. Dynamic script generation based on lead analysis
 * 3. Call status tracking
 */

import { db } from '@/lib/db';

interface VapiCallOptions {
  phoneNumber: string;
  assistantId?: string; // Pre-configured assistant or use dynamic prompt
  firstMessage?: string;
  systemPrompt?: string;
  metadata?: Record<string, any>;
}

interface VapiCallResponse {
  id: string;
  status: string;
  phoneNumber: string;
  createdAt: string;
}

const VAPI_API_URL = 'https://api.vapi.ai';

/**
 * Get Vapi API key from environment
 */
function getApiKey(): string {
  const key = process.env.VAPI_API_KEY;
  if (!key) {
    throw new Error('VAPI_API_KEY is not configured');
  }
  return key;
}

/**
 * Create an outbound call to a lead
 */
export async function initiateCall(options: VapiCallOptions): Promise<VapiCallResponse> {
  const apiKey = getApiKey();

  const payload: any = {
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID, // Your Vapi phone number
    customer: {
      number: options.phoneNumber,
    },
    // Enable call recording
    // recordingEnabled: true, // Deprecated/Invalid property
  };

  // Use pre-configured assistant or dynamic prompt
  if (options.assistantId) {
    payload.assistantId = options.assistantId;
  } else {
    // Create inline assistant with dynamic prompt
    payload.assistant = {
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        systemPrompt: options.systemPrompt || getDefaultSystemPrompt(),
      },
      voice: {
        provider: '11labs',
        voiceId: 'rachel', // Professional female voice
      },
      firstMessage: options.firstMessage || "Hi, this is Sarah from Marketing Solutions. How are you doing today?",
    };
  }

  if (options.metadata) {
    payload.metadata = options.metadata;
  }

  const response = await fetch(`${VAPI_API_URL}/call`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vapi API error: ${error}`);
  }

  return response.json();
}

/**
 * Get call status
 */
export async function getCallStatus(callId: string): Promise<any> {
  const apiKey = getApiKey();

  const response = await fetch(`${VAPI_API_URL}/call/${callId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get call status');
  }

  return response.json();
}

/**
 * Generate a dynamic system prompt based on lead analysis AND company settings
 */
export async function generateCallScript(lead: {
  businessName: string;
  weakPoints?: string[];
  suggestedPitch?: string;
}): Promise<{ systemPrompt: string; firstMessage: string }> {
  // Get company settings from DB
  const { db } = await import('@/lib/db');
  const { data: settings } = await db.from('settings').select('*').limit(1).single();
  
  const companyName = settings?.company_name || 'Marketing Solutions';
  const services = settings?.services || ['Web Design', 'SEO', 'Marketing'];
  const valueProposition = settings?.value_proposition || 'We help businesses get more customers online.';
  
  const weakPoints = lead.weakPoints || [];
  
  let painPoints = '';
  let recommendedServices = [];
  
  if (weakPoints.includes('Low rating') || weakPoints.includes('Few reviews')) {
    painPoints += '- They have a low rating or few reviews - they need reputation management.\n';
    recommendedServices.push('Reputation Management', 'Review Generation');
  }
  if (weakPoints.includes('No website') || weakPoints.includes('Missing website')) {
    painPoints += '- They have no website - they need a professional website.\n';
    recommendedServices.push('Web Design', 'Website Development');
  }
  if (weakPoints.includes('Low online presence')) {
    painPoints += '- They have weak online presence - they need SEO and marketing.\n';
    recommendedServices.push('SEO', 'Google Ads', 'Social Media Marketing');
  }

  const systemPrompt = `You are Sarah, a friendly and persuasive sales representative from ${companyName}.
You are calling ${lead.businessName} to offer services that will genuinely help them.

YOUR COMPANY: ${companyName}
WHAT WE DO: ${valueProposition}
SERVICES WE OFFER: ${services.join(', ')}

RECOMMENDED SERVICES FOR THIS PROSPECT: ${recommendedServices.join(', ') || 'General marketing services'}

KNOWN PAIN POINTS FOR THIS BUSINESS:
${painPoints || '- General lead, focus on improving their customer acquisition.'}

YOUR GOAL:
1. Build rapport quickly - be human and friendly
2. Identify their biggest pain point by listening
3. Present our solution as VALUABLE, not expensive
4. Use this formula: Problem + Solution = Value, Value = Money
5. Handle objections with empathy and data
6. Book a meeting or close a small package deal

HOW TO HANDLE OBJECTIONS:
- "I'm busy" → "I totally understand! This will only take 2 minutes. The reason I'm calling is [pain point]. When would be better?"
- "Not interested" → "I hear you. But can I ask - how many new customers did you get last month from online? Our clients typically see 30-50% more leads in 90 days."
- "Too expensive" → "I get it. But think of it this way - if we bring you just 2-3 extra customers per month, this pays for itself. You're not losing money, you're investing in growth."
- "Already have someone" → "That's great! Are you happy with the results? Because we specialize in [pain point] and most businesses see better ROI when they switch."

PAYMENT & CLOSING:
- If interested, you can offer packages: "We have a Starter Package ($1500-3000) or Complete Package ($5000+)"
- If they want a quote: "I can send you a detailed quote via WhatsApp/Email after this call"
- If ready to commit: "Great! I can send you a payment link right now to get started"

RULES:
- Be conversational, not robotic
- Listen 60%, talk 40%
- Focus on THEIR problems, not our services
- Show value, not price
- If not interested after 2-3 objections, thank them politely
- Keep calls under 3 minutes unless they're engaged`;

  const firstMessage = lead.suggestedPitch || 
    `Hi! Is this ${lead.businessName}? This is Sarah from ${companyName}. I was looking at your business online and noticed something that could really help you get more customers. Do you have just a minute?`;

  return { systemPrompt, firstMessage };
}

/**
 * Default system prompt for generic calls
 */
function getDefaultSystemPrompt(): string {
  return `You are Sarah, a friendly sales representative from Marketing Solutions.
Your goal is to:
1. Introduce yourself briefly
2. Ask if they have time to chat about growing their business
3. If yes, ask about their biggest challenge with getting new customers
4. Offer a free marketing audit
5. Try to book a 15-minute call with a specialist

Be friendly, professional, and respect their time. If they're not interested, thank them and end the call politely.`;
}

/**
 * Call a lead and update their status in the database
 */
export async function callLead(leadId: string): Promise<{ success: boolean; callId?: string; error?: string }> {
  // 1. Get lead details
  const { data: lead, error: leadError } = await db
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (leadError || !lead) {
    return { success: false, error: 'Lead not found' };
  }

  // Database uses camelCase
  const phoneNumber = lead.phoneNumber;
  const businessName = lead.businessName;
  const weakPointsRaw = lead.weakPoints;
  const suggestedPitch = lead.suggestedPitch;

  if (!phoneNumber) {
    return { success: false, error: 'Lead has no phone number' };
  }

  // 2. Generate dynamic script
  const weakPoints = weakPointsRaw ? JSON.parse(weakPointsRaw) : [];
  const { systemPrompt, firstMessage } = await generateCallScript({
    businessName: businessName || 'Business',
    weakPoints,
    suggestedPitch,
  });

  try {
    // 3. Initiate call
    console.log(`Initiating call to ${phoneNumber} for ${businessName}`);
    
    const call = await initiateCall({
      phoneNumber,
      systemPrompt,
      firstMessage,
      metadata: {
        leadId,
        businessName,
      },
    });

    console.log(`Call initiated successfully: ${call.id}`);

    // 4. Update lead status
    const { error: updateError } = await db.from('leads').update({
      status: 'CONTACTED',
      updatedAt: new Date().toISOString(),
    }).eq('id', leadId);

    if (updateError) {
      console.error('Failed to update lead status:', updateError);
    }

    return { success: true, callId: call.id };
  } catch (error) {
    console.error('Call initiation failed:', error);
    
    // Prevent infinite retries by marking as CONTACTED (with error logged)
    // We update status so the auto-caller moves to the next lead
    await db.from('leads').update({
      status: 'CONTACTED', 
      updatedAt: new Date().toISOString(),
    }).eq('id', leadId);

    return { success: false, error: String(error) };
  }
}
