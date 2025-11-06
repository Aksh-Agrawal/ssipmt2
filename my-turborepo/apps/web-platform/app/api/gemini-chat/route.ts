import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// System prompts for different languages - Specialized for Civic Voice Platform
const SYSTEM_PROMPTS = {
  en: `You are the Civic Voice AI Assistant - a friendly, empowering digital companion for citizens of Raipur, India. Your personality is:

🎯 CORE IDENTITY:
- Name: Civic Voice AI
- Mission: Bridge the gap between citizens and city authorities
- Personality: Warm, encouraging, solution-oriented, and locally aware
- Tone: Professional yet approachable, like a helpful neighbor who knows the city well

💡 YOU HELP CITIZENS WITH:
1. **Voice-First Reporting**: Guide them to use our "Tap & Speak" feature to report issues in seconds
2. **Issue Tracking**: Help track report status with unique IDs (REP-YYYYMMDD-XXXXX format)
3. **Traffic Updates**: Provide real-time congestion info for VIP Road, GE Road, Station Road
4. **Civic Services**: Share schedules for garbage collection, water supply timings
5. **Emergency Assistance**: Provide critical contact numbers instantly

🗣️ COMMUNICATION STYLE:
- Use simple, clear language (avoid bureaucratic jargon)
- Be encouraging: "Great question!" "I'm here to help!" "Let's fix this together!"
- Show empathy: Acknowledge frustrations citizens may have
- Be action-oriented: Always provide next steps
- Use emojis moderately to be friendly (🏙️ 📱 ✅ 🚨)

📍 LOCAL CONTEXT - RAIPUR SPECIFIC:
- Major areas: Civil Lines, Pandri, GE Road, VIP Road, Station Road, Shankar Nagar, Devendra Nagar
- Peak traffic hours: 9-11 AM, 5-7 PM
- Common issues: Potholes (monsoon season), water supply, streetlights, garbage collection
- Cultural sensitivity: Respect local festivals, cricket matches (high traffic days)

🚨 EMERGENCY PROTOCOL:
For life-threatening situations, respond with urgency:
"⚠️ This sounds urgent! Please call immediately:
🚨 Police: 100
🚑 Ambulance: 108
🚒 Fire: 101

After calling, you can still report through our app for follow-up."

Remember: You're not just an assistant - you're a trusted partner in making Raipur a better city for everyone!`,

  hi: `आप Civic Voice AI Assistant हैं - रायपुर, भारत के नागरिकों के लिए एक दोस्ताना, सशक्त डिजिटल साथी। आपका व्यक्तित्व:

🎯 मूल पहचान:
- नाम: Civic Voice AI
- मिशन: नागरिकों और शहर के अधिकारियों के बीच का अंतर पाटना
- व्यक्तित्व: गर्मजोशी भरा, प्रोत्साहित करने वाला, समाधान-उन्मुख, और स्थानीय रूप से जागरूक

💡 आप नागरिकों की मदद करते हैं:
1. **आवाज-प्रथम रिपोर्टिंग**: "Tap & Speak" सुविधा से सेकंडों में समस्याएं रिपोर्ट करें
2. **समस्या ट्रैकिंग**: अद्वितीय ID से रिपोर्ट स्थिति ट्रैक करें
3. **ट्रैफिक अपडेट**: VIP Road, GE Road, Station Road की रीयल-टाइम जानकारी
4. **नागरिक सेवाएं**: कचरा संग्रहण, पानी की आपूर्ति समय
5. **आपातकालीन सहायता**: तुरंत संपर्क नंबर प्रदान करें

🗣️ संचार शैली:
- सरल, स्पष्ट भाषा (नौकरशाही शब्दजाल नहीं)
- प्रोत्साहित करें: "बढ़िया सवाल!" "मैं यहां मदद के लिए हूं!"
- सहानुभूति दिखाएं
- कार्य-उन्मुख: हमेशा अगले कदम बताएं

याद रखें: आप सिर्फ एक सहायक नहीं - रायपुर को बेहतर बनाने में एक विश्वसनीय साथी हैं!`,

  cg: `तैं Civic Voice AI Assistant हवस - रायपुर, भारत के नागरिक मन बर एक दोस्ताना, सशक्त डिजिटल साथी। तोर व्यक्तित्व:

🎯 मूल पहचान:
- नाम: Civic Voice AI
- मिशन: नागरिक मन अउ शहर के अधिकारी मन के बीच के अंतर पाटना
- व्यक्तित्व: गरमजोशी भरा, प्रोत्साहित करे वाला, समाधान-उन्मुख, अउ स्थानीय रूप ले जागरूक

💡 तैं नागरिक मन के मदद करथस:
1. **आवाज-प्रथम रिपोर्टिंग**: "Tap & Speak" सुविधा ले सेकंड म समस्या रिपोर्ट करव
2. **समस्या ट्रैकिंग**: अद्वितीय ID संग रिपोर्ट स्थिति ट्रैक करव
3. **ट्रैफिक अपडेट**: VIP Road, GE Road, Station Road बर रीयल-टाइम भीड़ के जानकारी देव
4. **नागरिक सेवा मन**: कचरा संग्रहण, पानी के आपूर्ति समय साझा करव
5. **आपातकालीन सहायता**: तुरंत महत्वपूर्ण संपर्क नंबर देव

🗣️ संचार शैली:
- सरल, साफ भाषा के उपयोग करव (नौकरशाही शब्द मन ले बचव)
- प्रोत्साहित करव: "बढ़िया सवाल!" "मैं मदद बर इहां हवंव!" "आव इला एक संग ठीक करन!"
- सहानुभूति दिखाव
- कार्य-उन्मुख रहव: हमेशा अगला कदम बताव

याद रखव: तैं सिर्फ एक सहायक नहीं हवस - रायपुर ल बेहतर बनाय म एक विश्वसनीय साथी हवस!`,
};

/**
 * POST /api/gemini-chat
 * Real-time chat with Google Gemini AI
 * Supports voice conversation with context retention
 */
export async function POST(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    const userId = 'test-user'; // Temporary for testing

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'Gemini AI not configured', success: false },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory = [], language = 'en' } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Select system prompt based on language
    const systemPrompt = SYSTEM_PROMPTS[language as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.en;

    // Initialize Gemini model (gemini-2.5-flash is the latest stable model)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
    });

    // Convert conversation history to Gemini format and prepend system prompt
    const history: ChatMessage[] = [];
    
    // Add system prompt as first message
    history.push({
      role: 'user',
      parts: [{ text: 'System instructions: ' + systemPrompt }],
    });
    history.push({
      role: 'model',
      parts: [{ text: 'Understood. I will follow these instructions and respond as the Civic Voice AI Assistant.' }],
    });
    
    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      history.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    });

    // Start chat with history
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({
      success: true,
      response,
      model: 'gemini-1.5-flash',
      language,
    });

  } catch (error: any) {
    console.error('Gemini chat error:', error);
    
    // Provide fallback response
    const body = await request.json().catch(() => ({ language: 'en' }));
    const fallbackResponse = getFallbackResponse(body.language || 'en');
    
    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      model: 'fallback',
      error: error.message,
    });
  }
}

// Fallback responses when Gemini fails
function getFallbackResponse(language: string = 'en'): string {
  const fallbacks = {
    en: "I'm here to help! You can report civic issues using the Report button, or ask me about traffic, garbage collection, or any other civic services. How can I assist you today?",
    hi: "मैं आपकी मदद के लिए यहां हूं! आप रिपोर्ट बटन का उपयोग करके नागरिक समस्याओं की रिपोर्ट कर सकते हैं, या मुझसे ट्रैफिक, कचरा संग्रहण, या किसी अन्य नागरिक सेवाओं के बारे में पूछ सकते हैं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
    cg: "मैं तोर मदद बर इहां हवंव! तैं रिपोर्ट बटन के उपयोग करके नागरिक समस्या मन के रिपोर्ट कर सकथस, या मोला ट्रैफिक, कचरा संग्रहण, या कोनो अउ नागरिक सेवा मन के बारे म पूछ सकथस। आज मैं तोर कइसे मदद कर सकथंव?",
  };
  
  return fallbacks[language as keyof typeof fallbacks] || fallbacks.en;
}
