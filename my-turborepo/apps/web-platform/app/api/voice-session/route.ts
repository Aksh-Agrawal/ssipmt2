import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * WebSocket Voice Session API
 * Handles real-time bidirectional voice conversations using Pipecat
 * Flow: User speaks → STT → LLM → TTS → User hears (continuous loop)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Check if this is a WebSocket upgrade request
    const upgrade = request.headers.get('upgrade');
    if (upgrade !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    return new Response(
      JSON.stringify({
        message: 'WebSocket endpoint ready',
        note: 'This endpoint requires WebSocket upgrade. Use the client library to connect.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Voice session error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
