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
  const pathRef = useRef(h5pPath);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentPath = h5pPath;
      pathRef.current = currentPath;
      console.log("[H5PPlayer] Mounting content from", currentPath);

      // Quick existence check for h5p.json to surface 404 early
      try {
        const probe = await fetch(`${currentPath}/h5p.json?cb=${Date.now()}`);
        if (!probe.ok) {
          console.error(
            `[H5PPlayer] h5p.json not found (status ${probe.status}) at ${currentPath}/h5p.json`
          );
          return;
        }
      } catch (e) {
        console.error("[H5PPlayer] Failed to fetch h5p.json:", e);
        return;
      }

      // Clear previous DOM
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

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
        if (!window.H5PStandalone && !window.H5P) {
          console.error("[H5PPlayer] H5P globals never appeared after retries");
          return;
        }
        const Constructor = window.H5PStandalone?.H5P || window.H5P;
        if (!Constructor) {
          console.error("[H5PPlayer] H5P constructor missing");
          return;
        }

        const options = {
          h5pJsonPath: currentPath,
          frameJs: frameBundle,
          frameCss,
        };
        console.log("[H5PPlayer] Initializing with options", options);

        try {
          new Constructor(containerRef.current, options);
          console.log("[H5PPlayer] Initialized content for", currentPath);
        } catch (err) {
          if (window.H5P && typeof window.H5P.init === "function") {
            window.H5P.init(containerRef.current);
            console.log(
              "[H5PPlayer] Fallback window.H5P.init used for",
              currentPath
            );
          } else {
            throw err;
          }
        }

        // Post render sanity check
        setTimeout(() => {
          if (
            !cancelled &&
            containerRef.current &&
            containerRef.current.innerHTML.trim() === ""
          ) {
            console.warn(
              "[H5PPlayer] Container still empty after initialization. Check console/network for errors."
            );
          }
        }, 300);
      } catch (err) {
        if (!cancelled) console.error("[H5PPlayer] init error:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [h5pPath, playerBase, retryCount, retryInterval]);

  return (
    <div style={{ width: "100%" }} key={h5pPath}>
      <div ref={containerRef} className="h5p-container" />
    </div>
  );
}
