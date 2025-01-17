import './App.css';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {

    const createSocket = () => {
      const socket = new WebSocket('wss://log-analytics.ns.namespaxe.com/logger');

      socket.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket Connected');
      };

      socket.onmessage = (event) => {
        console.log('Received message:', event.data);
        setMessages((prevMessages) => [...prevMessages, event.data]);
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket Disconnected');

        setTimeout(createSocket, 2000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };

      return socket;
    };

    const socket = createSocket();

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="App container mt-4">
      <h1 className="text-center">Hooks from logs</h1>
      <p className="text-center">
        <strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}
      </p>

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
