import dynamic from 'next/dynamic';

// Dynamically import ChatInterface with loading state
const ChatInterface = dynamic(() => import('./components/ChatInterface'), {
  loading: () => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '400px' 
    }}>
      <div>Loading chat interface...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Civic Voice Assistant
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
        Ask questions about civic information and services
      </p>
      <ChatInterface />
    </div>
  );
}
