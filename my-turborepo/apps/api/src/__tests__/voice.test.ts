import { WebSocket } from 'ws';
import server from '../index'; // Assuming index.ts exports the http server

describe('Voice WebSocket Endpoint', () => {
  let httpServer: typeof server;
  let port: number;

  beforeAll((done) => {
    httpServer = server; // The exported 'server' is already an http.Server instance
    httpServer.listen(0, () => {
      port = (httpServer.address() as any).port;
      done();
    });
  });

  afterAll((done) => {
    httpServer.close(done);
  });

  it('should connect to the WebSocket endpoint and receive a response', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/ws/voice`);

    ws.onopen = () => {
      ws.send('test audio data');
    };

    ws.onmessage = (event) => {
      expect(event.data).toBe('Agent received your audio. Processing...');
      ws.close();
    };

    ws.onclose = () => {
      done();
    };

    ws.onerror = (error) => {
      done(error);
    };
  });
});
