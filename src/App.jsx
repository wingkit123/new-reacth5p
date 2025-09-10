import React, { useEffect, useState } from 'react';
import H5PPlayer from './components/H5PPlayer';
import './App.css';

const H5P_ACTIVITIES = [
    {
    slug: 'my-interactive',
    title: 'Blackcurrant Quiz',
    summary: 'Simple multiple choice question rendered from local H5P package.'
  }
];

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

function ActivitySelector({ current, onChange }) {
  return (
    <div className="activity-select">
      <label htmlFor="activity" className="activity-label">Select Activity:</label>
      <select
        id="activity"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="activity-dropdown"
      >
        {H5P_ACTIVITIES.map(a => (
          <option key={a.slug} value={a.slug}>{a.title}</option>
        ))}
      </select>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('demo-theme') || 'dark');
  const [activity, setActivity] = useState(H5P_ACTIVITIES[0].slug);

  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light');
    localStorage.setItem('demo-theme', theme);
  }, [theme]);

  const selected = H5P_ACTIVITIES.find(a => a.slug === activity);

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

        <section id="activity" className="h5p-wrapper" aria-labelledby="activity-heading">
          <div className="h5p-header-row">
            <h2 id="activity-heading">Interactive Activity</h2>
            <ActivitySelector current={activity} onChange={setActivity} />
          </div>
          <p className="activity-summary">{selected?.summary}</p>
          <H5PPlayer h5pPath={`/h5p/${activity}`} />
        </section>

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
