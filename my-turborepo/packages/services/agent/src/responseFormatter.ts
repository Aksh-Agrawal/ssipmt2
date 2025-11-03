/**
 * Response Formatter
 * Converts structured data into natural language responses
 */

import type { TrafficData } from './trafficService.js';

/**
 * Format traffic data into a natural language response
 * @param trafficData - Structured traffic data from the API
 * @returns Human-readable response string
 */
export function formatTrafficResponse(trafficData: TrafficData): string {
  const { destination, durationText, trafficCondition } = trafficData;

  // Determine traffic description based on condition
  let trafficDescription: string;
  switch (trafficCondition) {
    case 'CLEAR':
      trafficDescription = 'clear';
      break;
    case 'MODERATE':
      trafficDescription = 'moderate';
      break;
    case 'HEAVY':
      trafficDescription = 'heavy';
      break;
    case 'SEVERE':
      trafficDescription = 'severe';
      break;
    default:
      trafficDescription = 'normal';
  }

  // Construct natural language response
  return `Traffic to ${destination} is currently ${trafficDescription}. The estimated travel time is ${durationText}.`;
}

/**
 * Format a fallback response when traffic data is unavailable
 * @param destination - The destination that was queried
 * @returns Fallback response string
 */
export function formatTrafficFallback(destination?: string): string {
  if (destination) {
    return `I'm sorry, I couldn't retrieve traffic information for ${destination} at this time. Please try again later.`;
  }
  return `I'm sorry, I couldn't retrieve traffic information at this time. Please try again later or provide a specific destination.`;
}

/**
 * Format a response when no location is provided
 * @returns Response asking for location
 */
export function formatNoLocationResponse(): string {
  return `I'd be happy to help with traffic information! Please specify a destination, for example: "How is traffic to downtown?" or "What's the traffic like to the airport?"`;
}

/**
 * Format a response for unknown intents
 * @param query - The original user query
 * @returns Response for unknown intent
 */
export function formatUnknownIntentResponse(query: string): string {
  return `I'm not sure how to help with "${query}". I can provide traffic information if you ask about routes or conditions. For example, try asking "How is traffic to the station?"`;
}

/**
 * Format knowledge articles into a natural language response
 * @param articles - Array of ranked knowledge articles
 * @param query - The original user query
 * @returns Natural language response with article information
 */
export function formatKnowledgeResponse(
  articles: Array<{ title: string; content: string; matchScore: number }>,
  query: string
): string {
  if (articles.length === 0) {
    return `I couldn't find any information about "${query}". Please try rephrasing your question or contact the city office directly.`;
  }

  // Return the most relevant article (first in the ranked list)
  const topArticle = articles[0]!;
  
  if (articles.length === 1) {
    return `${topArticle.title}\n\n${topArticle.content}`;
  }

  // If multiple articles found, mention that
  return `${topArticle.title}\n\n${topArticle.content}\n\n(${articles.length - 1} more related article${articles.length - 1 > 1 ? 's' : ''} available)`;
}
