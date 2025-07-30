import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
axios.get('/conversation')

function App() {
  const [messages, setMessages] = useState([]);
  const [listening, setListening] = useState(false);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const mic = new SpeechRecognition();

  useEffect(() => {

    axios.get('http://localhost:5000/api/conversation/history')
      .then(res => setMessages(res.data));
  }, []);

  const handleMic = () => {
    mic.start();

    mic.onstart = () => {
      setListening(true);
    };

    mic.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      mic.stop();
      setListening(false);

      const userMsg = { text, role: 'user' };
      setMessages(prev => [...prev, userMsg]);

      const res = await axios.post('http://localhost:5000/api/conversation', { message: text });
      const botMsg = { text: res.data.reply, role: 'assistant' };
      setMessages(prev => [...prev, botMsg]);
    };

    mic.onerror = () => {
      mic.stop();
      setListening(false);
    };
  };

  return (
    <div className="app-container">
      <h1>🎙️ AI Voice Assistant</h1>
      <button onClick={handleMic}>
        {listening ? '🎤 Listening...' : '🎧 Start Talking'}
      </button>

      <div className="chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role}:</strong> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
