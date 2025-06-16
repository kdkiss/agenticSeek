import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import './App.css';
import { colors } from './colors';

const BACKEND_URL = 'http://localhost:7777' || process.env.REACT_APP_BACKEND_URL;

function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('blocks');
  const [responseData, setResponseData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [status, setStatus] = useState('Agents ready');
  const [expandedReasoning, setExpandedReasoning] = useState(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkHealth();
      fetchLatestAnswer();
      fetchScreenshot();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [messages]);

  const checkHealth = async () => {
    try {
      await axios.get(`${BACKEND_URL}/health`);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  };

  const fetchScreenshot = async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await axios.get(
        `${BACKEND_URL}/screenshots/updated_screen.png?timestamp=${timestamp}`,
        { responseType: 'blob' }
      );
      const imageUrl = URL.createObjectURL(res.data);
      setResponseData((prev) => {
        if (prev?.screenshot && prev.screenshot !== 'placeholder.png') {
          URL.revokeObjectURL(prev.screenshot);
        }
        return {
          ...prev,
          screenshot: imageUrl,
          screenshotTimestamp: new Date().getTime(),
        };
      });
    } catch (err) {
      setResponseData((prev) => ({
        ...prev,
        screenshot: 'placeholder.png',
        screenshotTimestamp: new Date().getTime(),
      }));
    }
  };

  const normalizeAnswer = (answer) => {
    return answer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?]/g, '');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleReasoning = (messageIndex) => {
    setExpandedReasoning((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageIndex)) {
        newSet.delete(messageIndex);
      } else {
        newSet.add(messageIndex);
      }
      return newSet;
    });
  };

  const fetchLatestAnswer = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/latest_answer`);
      const data = res.data;

      updateData(data);
      if (!data.answer || data.answer.trim() === '') {
        return;
      }
      const normalizedNewAnswer = normalizeAnswer(data.answer);
      const answerExists = messages.some(
        (msg) => normalizeAnswer(msg.content) === normalizedNewAnswer
      );
      if (!answerExists) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'agent',
            content: data.answer,
            reasoning: data.reasoning,
            agentName: data.agent_name,
            status: data.status,
            uid: data.uid,
          },
        ]);
        setStatus(data.status);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching latest answer:', error);
    }
  };

  const updateData = (data) => {
    setResponseData((prev) => ({
      ...prev,
      blocks: data.blocks || prev?.blocks || null,
      done: data.done,
      answer: data.answer,
      agent_name: data.agent_name,
      status: data.status,
      uid: data.uid,
    }));
  };

  const handleStop = async (e) => {
    e.preventDefault();
    checkHealth();
    setIsLoading(false);
    setError(null);
    try {
      await axios.get(`${BACKEND_URL}/stop`);
      setStatus('Requesting stop...');
    } catch (err) {
      console.error('Error stopping the agent:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    checkHealth();
    if (!query.trim()) {
      return;
    }
    setMessages((prev) => [...prev, { type: 'user', content: query }]);
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/query`, {
        query,
        tts_enabled: false,
      });
      const data = res.data;
      setQuery('');
      updateData(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to process query.');
      setMessages((prev) => [
        ...prev,
        { type: 'error', content: 'Error: Unable to get a response.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="navbar" aria-label="Main navigation">
        <div className="logo">AgenticSeek</div>
        <ul className="nav-links">
          <li><a href="#chat">Chat</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
        </ul>
      </nav>

      <header className="hero">
        <h1>Private AI At Your Fingertips</h1>
        <p>A local, privacy‑first assistant for automating tasks and coding.</p>
        <a href="#chat" className="btn-primary">Try the Demo</a>
      </header>

      <main>
        <section id="chat" className="chat-container">
          <div className="app-sections">
            <div className="chat-section">
              <h2>Chat Interface</h2>
              <div className="messages">
                {messages.length === 0 ? (
                  <p className="placeholder">No messages yet. Type below to start!</p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${
                        msg.type === 'user'
                          ? 'user-message'
                          : msg.type === 'agent'
                          ? 'agent-message'
                          : 'error-message'
                      }`}
                    >
                      <div className="message-header">
                        {msg.type === 'agent' && (
                          <span className="agent-name">{msg.agentName}</span>
                        )}
                        {msg.type === 'agent' && msg.reasoning && expandedReasoning.has(index) && (
                          <div className="reasoning-content">
                            <ReactMarkdown>{msg.reasoning}</ReactMarkdown>
                          </div>
                        )}
                        {msg.type === 'agent' && (
                          <button
                            className="reasoning-toggle"
                            onClick={() => toggleReasoning(index)}
                            title={expandedReasoning.has(index) ? 'Hide reasoning' : 'Show reasoning'}
                          >
                            {expandedReasoning.has(index) ? '▼' : '▶'} Reasoning
                          </button>
                        )}
                      </div>
                      <div className="message-content">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              {isOnline && <div className="loading-animation">{status}</div>}
              {!isLoading && !isOnline && (
                <p className="loading-animation">System offline. Deploy backend first.</p>
              )}
              <form onSubmit={handleSubmit} className="input-form">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type your query..."
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                  Send
                </button>
                <button onClick={handleStop}>Stop</button>
              </form>
            </div>

            <div className="computer-section">
              <h2>Computer View</h2>
              <div className="view-selector">
                <button
                  className={currentView === 'blocks' ? 'active' : ''}
                  onClick={() => setCurrentView('blocks')}
                >
                  Editor View
                </button>
                <button
                  className={currentView === 'screenshot' ? 'active' : ''}
                  onClick={responseData?.screenshot ? () => setCurrentView('screenshot') : undefined}
                  disabled={!responseData?.screenshot}
                >
                  Browser View
                </button>
              </div>
              <div className="content">
                {error && <p className="error">{error}</p>}
                {currentView === 'blocks' ? (
                  <div className="blocks">
                    {responseData && responseData.blocks && Object.values(responseData.blocks).length > 0 ? (
                      Object.values(responseData.blocks).map((block, index) => (
                        <div key={index} className="block">
                          <p className="block-tool">Tool: {block.tool_type}</p>
                          <pre>{block.block}</pre>
                          <p className="block-feedback">Feedback: {block.feedback}</p>
                          {block.success ? (
                            <p className="block-success">Success</p>
                          ) : (
                            <p className="block-failure">Failure</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="block">
                        <p className="block-tool">Tool: No tool in use</p>
                        <pre>No file opened</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="screenshot">
                    <img
                      src={responseData?.screenshot || 'placeholder.png'}
                      alt="Screenshot"
                      onError={(e) => {
                        e.target.src = 'placeholder.png';
                      }}
                      key={responseData?.screenshotTimestamp || 'default'}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="features">
          <h2>Key Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Local Data</h3>
              <p>Everything runs on your device with zero cloud dependency.</p>
            </div>
            <div className="feature-card">
              <h3>Smart Browsing</h3>
              <p>Autonomously search and extract information from the web.</p>
            </div>
            <div className="feature-card">
              <h3>Code Assistant</h3>
              <p>Write, debug and execute code across many languages.</p>
            </div>
          </div>
        </section>

        <section id="testimonials" className="testimonials">
          <h2>What People Say</h2>
          <div className="testimonial-grid">
            <div className="testimonial">
              <img src="https://via.placeholder.com/48" alt="User avatar" />
              <p>"AgenticSeek has streamlined my workflow like nothing else."</p>
              <span>- Alex</span>
            </div>
            <div className="testimonial">
              <img src="https://via.placeholder.com/48" alt="User avatar" />
              <p>"A truly private AI solution that I can trust."</p>
              <span>- Taylor</span>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="footer">
        <p>&copy; {new Date().getFullYear()} AgenticSeek</p>
        <ul className="footer-links">
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
          <li>
            <a href="https://github.com/Fosowl/agenticSeek">GitHub</a>
          </li>
        </ul>
      </footer>
    </div>
  );
}

export default App;

