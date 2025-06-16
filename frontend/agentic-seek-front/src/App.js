import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <nav className="navbar" aria-label="Main navigation">
        <div className="logo">AgenticSeek</div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          <li><a href="#footer">Contact</a></li>
        </ul>
      </nav>

      <header className="hero">
        <h1>Private AI At Your Fingertips</h1>
        <p>A local, privacy‑first assistant for automating tasks and coding.</p>
        <a href="#features" className="btn-primary">Get Started</a>
      </header>

      <main>
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
          <li><a href="https://github.com/Fosowl/agenticSeek">GitHub</a></li>
        </ul>
      </footer>
    </div>
  );
}

export default App;
