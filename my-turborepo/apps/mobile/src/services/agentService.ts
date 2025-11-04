export interface AgentQueryRequest {
  query: string;
}

export interface AgentQuerySource {
  id: string;
  title: string;
  url?: string;
}

export interface AgentQueryResponse {
  response: string;
  sources?: AgentQuerySource[];
}

export interface AgentQueryResult {
  response: string;
  sources?: AgentQuerySource[];
}

class AgentService {
  private baseUrl = 'http://localhost:3000'; // Will be configurable in production

  async sendQuery(query: string): Promise<AgentQueryResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/agent/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: AgentQueryResponse = await response.json();
      return {
        response: result.response,
        sources: result.sources,
      };
    } catch (error) {
      console.error('Agent query failed:', error);
      throw error;
    }
  }
}

export const agentService = new AgentService();
