import './App.css';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // To store any error messages
  const [isClient, setIsClient] = useState<boolean>(false); // Check if it's client-side
  let socket: WebSocket; // Declare the socket variable
  const createSocket = () => {


    try {
      socket = new WebSocket('wss://log-analytics.ns.namespaxe.com/sockets/logger');

      socket.onopen = () => {
        setIsConnected(true);
        setError(null); // Clear any previous errors
        console.log('WebSocket Connected');
      };

      socket.onmessage = (event) => {
        console.log('Received message:', event.data);
        setMessages((prevMessages) => [...prevMessages, event.data]);
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket Disconnected');

        // Attempt to reconnect after a delay
        setTimeout(createSocket, 2000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket encountered an error. Retrying...');
        socket.close();
      };
    } catch (err) {
      console.error('Error establishing WebSocket connection:', err);
      setError('Failed to establish WebSocket connection. Retrying...');
      setTimeout(createSocket, 2000); // Retry connection after a delay
    }

    return socket;
  };

  useEffect(() => {
    // Set the client-side flag
    setIsClient(true);

    if (typeof window === 'undefined') return;



    const socket = createSocket();

    // Cleanup WebSocket connection when the component unmounts
    return () => {
      socket?.close();
    };
  }, []);

  if (!isClient) {
    // Skip rendering on the server side
    return null;
  }

  return (
    <div className="App container mt-4">
      <h1 className="text-center">Hooks from logs</h1>
      <p className="text-center">
        <strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}
      </p>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      <div className="mt-4">
        <h3>Received Messages:</h3>
        <div
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #ddd',
            padding: '10px',
          }}
        >
          {messages.length === 0 ? (
            <p>No messages received yet.</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="message p-2 mb-2 bg-light border rounded">
                {msg}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
