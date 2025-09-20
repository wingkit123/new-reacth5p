import React, { useEffect, useState, useRef, useMemo } from 'react';
import useXapiTracker from './hooks/useXapiTracker';
import './App.css';


import H5PPlayer from './components/H5PPlayer';
import ThemeToggle from './components/ThemeToggle';

import { H5P_ACTIVITIES, H5P_CONTENT_BASE } from './config/h5pActivities';

function ProgressBadge({ summary }) {
  const completion = summary ? summary.completionRate : 0;
  const average = summary ? summary.averageScorePercent : 0;
  return (
    <div className="progress-badge" title="Overall Progress">
      <div className="progress-item"><span className="label">Completed</span><span className="value">{completion.toFixed(0)}%</span></div>
      <div className="divider" />
      <div className="progress-item"><span className="label">Avg score</span><span className="value">{average.toFixed(0)}%</span></div>
    </div>
  );
}

export default function App() {
  // Initialize xAPI tracking (records saved to localStorage)
  useXapiTracker();

  const [theme, setTheme] = useState(() => localStorage.getItem('demo-theme') || 'dark');
  // Track completion and score for all activities
  const [activityProgress, setActivityProgress] = useState(() => {
    try {
      const raw = localStorage.getItem('h5p-progress');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  // activityProgress is updated for overall completion tracking
  // (used in setActivityProgress, see xAPI event handler)
  const activities = H5P_ACTIVITIES;
  // For mapping activity by contentId
  const activitySlugByContentId = useRef({});

  // Derive a summary for UI badge
  const progressSummary = useMemo(() => {
    const total = activities.length;
    const completed = Object.values(activityProgress).filter(v => v && v.percent !== null && v.percent !== undefined).length;
    const avgPercent = completed > 0
      ? (Object.values(activityProgress).reduce((sum, v) => sum + (v?.percent || 0), 0) / completed)
      : 0;
    return {
      totalActivities: total,
      completedActivities: completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      averageScorePercent: avgPercent,
    };
  }, [activityProgress, activities]);
  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light');
    localStorage.setItem('demo-theme', theme);
  }, [theme]);

  // Persist activity progress and summary to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('h5p-progress', JSON.stringify(activityProgress));
      const total = activities.length;
      const completed = Object.values(activityProgress).filter(v => v && v.percent !== null && v.percent !== undefined).length;
      const avgPercent = completed > 0
        ? (Object.values(activityProgress).reduce((sum, v) => sum + (v?.percent || 0), 0) / completed)
        : 0;
      const summary = {
        totalActivities: total,
        completedActivities: completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        averageScorePercent: avgPercent,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('h5p-progress-summary', JSON.stringify(summary));
      // Also log for demo visibility
      console.log(`Overall completion: ${completed}/${total} activities (${summary.completionRate.toFixed(2)}%)`);
      console.log(`Average score: ${summary.averageScorePercent.toFixed(2)}%`);
    } catch (e) {
      console.warn('Failed to persist progress to localStorage', e);
    }
  }, [activityProgress, activities]);

  // Track xAPI statements from H5P
  useEffect(() => {
    // Debug: Check if H5P and externalDispatcher are available
    setTimeout(() => {
      if (window.H5P && window.H5P.externalDispatcher && window.H5P.externalDispatcher.on) {
        window.H5P.externalDispatcher.on('xAPI', function (event) {
          const stmt = event.data?.statement;
          const verbId = stmt?.verb?.id || '';
          // Only handle if verb is 'answered' or 'completed'
          if (verbId.endsWith('/answered') || verbId.endsWith('/completed')) {
            // Try to identify the activity by contentId or activity slug
            let slug = null;
            // Try to get contentId from statement
            const contentId = stmt?.object?.definition?.extensions?.['http://h5p.org/x-api/h5p-local-content-id'];
            if (contentId) {
              // Map contentId to slug if possible
              if (!activitySlugByContentId.current[contentId]) {
                // Try to find matching activity
                const found = activities.find(a => a.slug && stmt?.object?.id && stmt.object.id.includes(a.slug));
                if (found) activitySlugByContentId.current[contentId] = found.slug;
              }
              slug = activitySlugByContentId.current[contentId];
            }
            // Fallback: try to match by slug in object.id
            if (!slug && stmt?.object?.id) {
              const found = activities.find(a => stmt.object.id.includes(a.slug));
              if (found) slug = found.slug;
            }
            // If still not found, skip
            if (!slug) return;

            // Calculate percent and success
            const score = stmt?.result?.score?.raw;
            const max = stmt?.result?.score?.max;
            const percent = (typeof score === 'number' && typeof max === 'number' && max > 0)
              ? ((score / max) * 100)
              : null;
            const success = typeof stmt?.result?.success === 'boolean' ? stmt.result.success : null;

            // Update progress state
            setActivityProgress(prev => ({ ...prev, [slug]: { percent, success } }));

            // Still log per-activity for reference
            if (percent !== null) {
              console.log(`Completion: ${percent.toFixed(2)}% (${score}/${max})`);
            }
            if (success !== null) {
              console.log(`Success: ${success ? 'Yes' : 'No'}`);
            }
            console.log('H5P.externalDispatcher xAPI:', stmt);
          }
        });
      }
    }, 2000); // Wait 2s for H5P to load

    const onXAPI = (event) => {
      const stmt = event.data?.statement;
      if (!stmt) return;
      const verbId = stmt.verb?.id || '';
      // Only send if verb is 'answered' or 'completed'
      if (verbId.endsWith('/answered') || verbId.endsWith('/completed')) {
        // Calculate percent and success
        const score = stmt?.result?.score?.raw;
        const max = stmt?.result?.score?.max;
        const percent = (typeof score === 'number' && typeof max === 'number' && max > 0)
          ? ((score / max) * 100)
          : null;
        const success = typeof stmt?.result?.success === 'boolean' ? stmt.result.success : null;

        // Update progress state
        setActivityProgress(prev => {
          const updated = { ...prev };
          // Try to identify the activity by contentId or object.id
          let slug = null;
          const contentId = stmt?.object?.definition?.extensions?.['http://h5p.org/x-api/h5p-local-content-id'];
          if (contentId) {
            if (!activitySlugByContentId.current[contentId]) {
              const found = activities.find(a => a.slug && stmt?.object?.id && stmt.object.id.includes(a.slug));
              if (found) activitySlugByContentId.current[contentId] = found.slug;
            }
            slug = activitySlugByContentId.current[contentId];
          }
          if (!slug && stmt?.object?.id) {
            const found = activities.find(a => stmt.object.id.includes(a.slug));
            if (found) slug = found.slug;
          }
          if (!slug) return updated;
          updated[slug] = { percent, success };
          return updated;
        });

        // Still log per-activity for reference
        if (percent !== null) {
          console.log(`Completion: ${percent.toFixed(2)}% (${score}/${max})`);
        }
        if (success !== null) {
          console.log(`Success: ${success ? 'Yes' : 'No'}`);
        }
        fetch('https://your-backend-endpoint.com/xapi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ statement: stmt }),
        })
          .then((res) => res.ok ? res.json() : Promise.reject(res))
          .then((data) => {
            // Optionally handle response
            console.log('xAPI statement sent:', data);
          })
          .catch((err) => {
            console.error('Failed to send xAPI statement', err);
          });
      }
    };
    window.addEventListener('xAPI', onXAPI);
    return () => window.removeEventListener('xAPI', onXAPI);
  }, [activities]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <nav className="site-nav" aria-label="Main navigation">
        <div className="brand">H5P Demo</div>
        <ul>
          <li><a href="#koha">Koha</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#activity">Activity</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        <ProgressBadge summary={progressSummary} />
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

       

        {H5P_ACTIVITIES.map(activity => {
          // One ref per activity for fullscreen
          const containerRef = React.createRef();
          const handleFullscreen = () => {
            const el = containerRef.current;
            if (!el) return;
            if (el.requestFullscreen) {
              el.requestFullscreen();
            } else if (el.webkitRequestFullscreen) {
              el.webkitRequestFullscreen();
            } else if (el.mozRequestFullScreen) {
              el.mozRequestFullScreen();
            } else if (el.msRequestFullscreen) {
              el.msRequestFullscreen();
            }
          };
          return (
            <section key={activity.slug} id={activity.slug} className="h5p-wrapper full-bleed" aria-labelledby={`${activity.slug}-heading`}>
              <div className="h5p-header-row" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}}>
                <div>
                  <h2 id={`${activity.slug}-heading`}>{activity.title}</h2>
                  <p className="activity-summary">{activity.summary}</p>
                </div>
                <button type="button" className="fullscreen-btn" onClick={handleFullscreen} aria-label="Fullscreen H5P activity">
                  ⛶ Fullscreen
                </button>
              </div>
              <H5PPlayer
                h5pPath={`${H5P_CONTENT_BASE}/${activity.slug}`}
                embedType={activity.embedType || 'iframe'}
                debug={activity.debug || false}
                containerRef={containerRef}
              />
            </section>
          );
        })}

 

        <section id="about" className="about">
          <h2 className="section-title">About This Demo</h2>
          <p>
            The <code>H5PPlayer</code> component loads assets from <code>/assets/h5p-player</code> (copied at install via
            a <code>postinstall</code> script). Add additional H5P content by exporting from <code>Lumi</code> and extracting into
            <code>public/h5p/&lt;slug&gt;</code>. Then append an entry to the <code>H5P_ACTIVITIES</code> array in
            <code> src/config/h5pActivities.js</code>.
          </p>
        </section>

        <footer className="footer">Sample Demo • H5P + React + Vite • Local Bundling Strategy</footer>
      </main>
    </>
  );
}
