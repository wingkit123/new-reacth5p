import React, { useEffect, useRef } from "react";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(s);
  });
}

function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

export default function H5PPlayer({
  h5pPath = "/h5p/my-interactive",
  playerBase = "/assets/h5p-player",
  retryCount = 40,
  retryInterval = 200,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const frameCss = `${playerBase}/styles/h5p.css`;
        const mainBundle = `${playerBase}/main.bundle.js`;
        const frameBundle = `${playerBase}/frame.bundle.js`;

        loadCss(frameCss);
        await loadScript(mainBundle);

        let tries = 0;
        while (!window.H5PStandalone && !window.H5P && tries < retryCount) {
          await new Promise((r) => setTimeout(r, retryInterval));
          tries++;
        }

        const Constructor = window.H5PStandalone?.H5P || window.H5P;
        if (!Constructor) {
          console.error(
            "[H5PPlayer] H5P constructor not available after retries."
          );
          return;
        }

        const options = {
          h5pJsonPath: h5pPath,
          frameJs: frameBundle,
          frameCss,
        };

        try {
          new Constructor(containerRef.current, options);
          console.log("[H5PPlayer] Initialized.");
        } catch (err) {
          if (window.H5P && typeof window.H5P.init === "function") {
            window.H5P.init(containerRef.current);
            console.log("[H5PPlayer] Initialized via H5P.init fallback.");
          } else {
            throw err;
          }
        }
      } catch (err) {
        if (!cancelled) console.error("[H5PPlayer] init error:", err);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [h5pPath, playerBase, retryCount, retryInterval]);

  return (
    <div style={{ width: "100%" }}>
      <div ref={containerRef} className="h5p-container" />
    </div>
  );
}
