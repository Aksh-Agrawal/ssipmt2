import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Admin/Police-specific system prompt
const ADMIN_SYSTEM_PROMPT = `You are an AI Traffic Management & Operations Assistant for Raipur Police and Municipal Administration.

🎯 YOUR ROLE:
You help police officers and administrators with:
- Real-time traffic monitoring and analysis
- Civic report management and analytics
- Resource allocation recommendations
- SLA compliance tracking
- Incident pattern analysis
- Emergency response coordination

👮 YOUR AUDIENCE:
Police officers, traffic controllers, municipal administrators, and emergency responders who need quick, actionable intelligence.

💡 YOUR CAPABILITIES:
1. **Traffic Intelligence**
   - Current congestion hotspots across Raipur
   - Historical traffic patterns by area and time
   - Event-based traffic predictions (festivals, cricket matches, VIP movements)
   - Route optimization recommendations

2. **Report Analytics**
   - Total reports by status, category, priority
   - SLA compliance rates and deadline tracking
   - Geographic clustering of issues
   - Trend analysis (increasing/decreasing issues)

3. **Operational Insights**
   - Resource allocation suggestions (which areas need attention)
   - Priority ranking of pending reports
   - Repeat issue identification
   - Department workload distribution

4. **Emergency Support**
   - Critical/high-priority report summaries
   - Quick access to important contacts
   - Incident escalation recommendations

🗣️ COMMUNICATION STYLE:
- **Professional & Direct**: Use clear, actionable language
- **Data-Driven**: Cite numbers, statistics, locations
- **Concise**: Busy officers need quick answers
- **Actionable**: Always suggest next steps
- **Respectful**: Acknowledge the importance of their work

📊 RESPONSE STRUCTURE:
1. **Direct Answer**: Start with the key information
2. **Context**: Provide relevant data/statistics
3. **Recommendations**: Suggest actions if applicable
4. **Quick Facts**: Use bullet points for easy scanning

🚨 PRIORITY KEYWORDS:
When you see: "urgent", "emergency", "critical", "immediate" → Prioritize and flag

📍 RAIPUR-SPECIFIC KNOWLEDGE:
- Major areas: VIP Road, GE Road, Station Road, Civil Lines, Pandri, Shankar Nagar
- Peak hours: 9-11 AM, 5-7 PM on weekdays
- High-traffic events: Cricket matches at Shaheed Veer Narayan Singh Stadium, festivals, government events
- Common issues: Potholes during monsoon, power cuts in summer, water shortage

🎯 EXAMPLE INTERACTIONS:

Q: "What is the current traffic situation?"
A: "**Current Traffic Overview (as of [time]):**
• VIP Road: Heavy congestion near Mowa Overpass
• GE Road: Moderate traffic, slow-moving near Telibandha
• Station Road: Light traffic

**Recommendations:**
- Divert traffic from VIP Road via alternate routes
- Deploy additional personnel at Mowa junction
- Estimated clearance: 30-45 minutes

Would you like detailed incident reports for any area?"

Q: "Show me critical priority reports from last 24 hours"
A: "**Critical Reports (Last 24 Hours): 3 Total**

1. REP-20251106-ABC123 | Open Manhole on VIP Road
   - Status: In Progress | Age: 2 hours | SLA: 0h remaining ⚠️
   
2. REP-20251106-DEF456 | Major Water Pipe Burst
   - Status: Submitted | Age: 5 hours | SLA: -3h (OVERDUE) 🚨
   
3. REP-20251106-GHI789 | Live Wire Hanging
   - Status: In Progress | Age: 1 hour | SLA: 1h remaining

**Action Required:** Report #2 is overdue. Recommend immediate dispatch."

Q: "Which areas have the most pending reports?"
A: "**Top 5 Areas by Pending Reports:**

1. Pandri - 23 reports (12 High, 11 Medium)
2. VIP Road - 18 reports (5 Critical, 8 High, 5 Medium)
3. GE Road - 15 reports (10 High, 5 Medium)
4. Civil Lines - 12 reports (8 Medium, 4 Low)
5. Shankar Nagar - 9 reports (6 Medium, 3 Low)

**Recommendation:** Allocate additional resources to Pandri and VIP Road zones for immediate attention."

Remember: You're a trusted operational assistant. Provide clear, accurate, actionable intelligence.`;

// Get traffic context from database
async function getTrafficContext(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('traffic_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error || !data || data.length === 0) {
      return 'No recent traffic data available.';
    }

    return `Recent Traffic Data:\n${data
      .map(
        (t) =>
          `- ${t.location}: ${t.congestion_level} congestion, ${t.avg_speed || 'N/A'} km/h average speed (${new Date(t.timestamp).toLocaleString()})`
      )
      .join('\n')}`;
  } catch (error) {
    console.error('Error fetching traffic data:', error);
    return 'Unable to fetch traffic data.';
  }
}

// Get report statistics
async function getReportStats(): Promise<string> {
  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('id, status, category, priority, area, created_at');

    if (error || !reports) {
      return 'No report data available.';
    }

    const total = reports.length;
    const byStatus = reports.reduce((acc: any, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const byPriority = reports.reduce((acc: any, r) => {
      acc[r.priority] = (acc[r.priority] || 0) + 1;
      return acc;
    }, {});

    const last24Hours = reports.filter(
      (r) => new Date(r.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    // Area clustering
    const byArea = reports.reduce((acc: any, r) => {
      if (r.area) {
        acc[r.area] = (acc[r.area] || 0) + 1;
      }
      return acc;
    }, {});

    const topAreas = Object.entries(byArea)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([area, count]) => `${area}: ${count}`)
      .join(', ');

    return `Report Statistics:
Total Reports: ${total}
Last 24 Hours: ${last24Hours}

By Status:
${Object.entries(byStatus)
  .map(([status, count]) => `- ${status}: ${count}`)
  .join('\n')}

By Priority:
${Object.entries(byPriority)
  .map(([priority, count]) => `- ${priority}: ${count}`)
  .join('\n')}

Top Areas: ${topAreas}`;
  } catch (error) {
    console.error('Error fetching report stats:', error);
    return 'Unable to fetch report statistics.';
  }
}

// Get critical reports
async function getCriticalReports(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('unique_id, description, area, status, priority, created_at, sla_deadline')
      .in('priority', ['Critical', 'High'])
      .in('status', ['Submitted', 'In Progress'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      return 'No critical/high priority reports currently pending.';
    }

    return `Critical/High Priority Reports:\n${data
      .map((r) => {
        const age = Math.floor((Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60));
        const slaRemaining = Math.floor(
          (new Date(r.sla_deadline).getTime() - Date.now()) / (1000 * 60 * 60)
        );
        const slaStatus = slaRemaining < 0 ? '🚨 OVERDUE' : slaRemaining < 2 ? '⚠️ URGENT' : '✅';

        return `- ${r.unique_id} | ${r.priority} | ${r.area || 'Unknown Area'}\n  ${r.description.substring(0, 80)}...\n  Status: ${r.status} | Age: ${age}h | SLA: ${slaRemaining}h ${slaStatus}`;
      })
      .join('\n\n')}`;
  } catch (error) {
    console.error('Error fetching critical reports:', error);
    return 'Unable to fetch critical reports.';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fallback response if Groq API is not configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === '') {
      return NextResponse.json({
        response: `I'm currently operating in limited mode. To enable full AI capabilities, please configure the GROQ_API_KEY in your environment variables.

However, I can help you navigate to:
• Reports Dashboard - View and manage all civic reports
• Traffic Data - Monitor real-time traffic conditions
• Analytics - View trends and statistics

What would you like to access?`,
      });
    }

    // Gather context from database
    const trafficContext = await getTrafficContext();
    const reportStats = await getReportStats();
    const criticalReports = await getCriticalReports();

    const contextualInfo = `
=== CURRENT OPERATIONAL DATA ===

${trafficContext}

${reportStats}

${criticalReports}

=== END DATA ===

Use this data to answer the admin's question. If the question requires data not shown above, acknowledge the limitation and suggest what would be needed.
`;

    // Build conversation with context
    const messages: ChatMessage[] = [
      { role: 'system', content: ADMIN_SYSTEM_PROMPT },
      { role: 'system', content: contextualInfo },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not process that request.';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Admin chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    );
  }
}
