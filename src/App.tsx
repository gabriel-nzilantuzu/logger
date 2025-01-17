import './App.css';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importing Bootstrap CSS

function App() {
  // State to store WebSocket messages
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Function to initialize WebSocket and handle connection, message reception, etc.
    const createSocket = () => {
      const socket = new WebSocket('ws://log-analytics.ns.namespaxe.com/logger');

      // WebSocket connection open
      socket.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket Connected');
      };

      // WebSocket onmessage event
      socket.onmessage = (event) => {
        console.log('Received message:', event.data);
        setMessages((prevMessages) => [...prevMessages, event.data]); // Append new message
      };

      // WebSocket onclose event
      socket.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket Disconnected');
        // Reconnect after 2 seconds if the connection is closed
        setTimeout(createSocket, 2000);
      };

      // WebSocket onerror event
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close(); // Close the connection on error to trigger reconnection
      };

      return socket;
    };

    // Create initial WebSocket connection
    const socket = createSocket();

    // Cleanup WebSocket connection when the component unmounts
    return () => {
      socket.close();
    };
  }, []); // Empty dependency array to run this effect only once

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
