import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Groq client
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'en', conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Determine intent from message
    const intent = determineIntent(message.toLowerCase());

    // Fetch relevant context based on intent
    let context: any = {};

    if (intent === 'traffic') {
      // Fetch recent traffic data
      const { data: trafficData } = await supabase
        .from('traffic_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      context.trafficData = trafficData || [];
    }

    // TODO: Fetch from knowledge_articles table when populated
    // const { data: articles } = await supabase
    //   .from('knowledge_articles')
    //   .select('*')
    //   .textSearch('content', message)
    //   .limit(3);
    // context.knowledgeArticles = articles || [];

    // Build system prompt
    const systemPrompt = buildSystemPrompt(language, context);

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
    });

    const responseMessage = completion.choices[0]?.message?.content || 
      'I apologize, I could not generate a response.';

    return NextResponse.json({
      message: responseMessage,
      intent,
      language,
      sources: context.trafficData ? ['Live Traffic Data'] : [],
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 }
    );
  }
}

function determineIntent(text: string): string {
  const trafficKeywords = [
    'traffic', 'road', 'blocked', 'congestion', 'route',
    'ट्रैफिक', 'रोड', 'बंद', 'जाम', 'kaha', 'कहा'
  ];

  const hasTrafficKeyword = trafficKeywords.some(keyword => text.includes(keyword));

  if (hasTrafficKeyword) {
    return 'traffic';
  }

  return 'general';
}

function buildSystemPrompt(language: string, context: any): string {
  const languageInstructions: Record<string, string> = {
    en: 'Respond in English.',
    hi: 'Respond in Hindi (हिंदी में जवाब दें).',
    cg: 'Respond in Chhattisgarhi or Hindi (छत्तीसगढ़ी या हिंदी में जवाब दें).',
  };

  let prompt = `You are a helpful civic assistant for Raipur Smart City, India. You help citizens with:
1. Current traffic conditions and road closures
2. Civic information (garbage collection, water supply, public services)
3. How to report issues

${languageInstructions[language] || languageInstructions.en}

Be concise, helpful, and friendly. Use local context for Raipur. If you don't know something, admit it and suggest they contact the municipal office.`;

  // Add traffic context
  if (context?.trafficData && context.trafficData.length > 0) {
    prompt += '\n\n**Current Traffic Information (from sensors):**\n';
    context.trafficData.slice(0, 5).forEach((traffic: any) => {
      const roadName = traffic.road_segment_id || 'Unknown Road';
      prompt += `- ${roadName}: ${traffic.congestion_level} congestion, average speed ${Math.round(traffic.avg_speed)} km/h\n`;
    });
  }

  return prompt;
}
