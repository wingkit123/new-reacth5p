import React, { useEffect, useState } from 'react';
import H5PPlayer from './components/H5PPlayer';
import './App.css';
import { H5P_ACTIVITIES, H5P_CONTENT_BASE } from './config/h5pActivities';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle color theme"
      onClick={onToggle}
    >
      {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('demo-theme') || 'dark');
  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light');
    localStorage.setItem('demo-theme', theme);
  }, [theme]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <nav className="site-nav" aria-label="Main navigation">
        <div className="brand">H5P Demo</div>
        <ul>
          <li><a href="#features">Features</a></li>
          <li><a href="#activity">Activity</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        <ThemeToggle
          theme={theme}
          onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />
      </nav>
      <main id="main">
        <header className="hero">
          <h1>Interactive Learning Demo</h1>
          <p className="hero-intro">
            A sample React + Vite site demonstrating how <strong>locally bundled</strong> H5P content is
            served without external CDNs. Everything below runs from static assets you can deploy to
            any modern host.
          </p>
        </header>

        <section id="features" className="feature-section">
          <h2 className="section-title">Key Characteristics</h2>
          <div className="grid">
            <div className="feature"><h3>Local Assets</h3><p>No runtime CDN dependency; reproducible builds.</p></div>
            <div className="feature"><h3>Caching Strategy</h3><p>Immutable player bundles & short-lived content.</p></div>
            <div className="feature"><h3>Extensible</h3><p>Add more H5P packages by dropping folders into <code>/public/h5p</code>.</p></div>
            <div className="feature"><h3>Theme Toggle</h3><p>Accessible light/dark mode with local persistence.</p></div>
          </div>
        </section>

        {H5P_ACTIVITIES.map(activity => (
          <section key={activity.slug} id={activity.slug} className="h5p-wrapper full-bleed" aria-labelledby={`${activity.slug}-heading`}>
            <div className="h5p-header-row">
              <h2 id={`${activity.slug}-heading`}>{activity.title}</h2>
              <p className="activity-summary">{activity.summary}</p>
              
            </div>
            <H5PPlayer h5pPath={`${H5P_CONTENT_BASE}/${activity.slug}`} />
          </section>
        ))}

        <section id="about" className="about">
          <h2 className="section-title">About This Demo</h2>
          <p>
            The <code>H5PPlayer</code> component loads assets from <code>/assets/h5p-player</code> (copied at install via
            a <code>postinstall</code> script). Add additional H5P content by exporting from Lumi and extracting into
            <code>public/h5p/&lt;slug&gt;</code>. Then append an entry to the <code>H5P_ACTIVITIES</code> array in <code>App.jsx</code>.
          </p>
        </section>

        <footer className="footer">Sample Demo • H5P + React + Vite • Local Bundling Strategy</footer>
      </main>
    </>
  );
}
