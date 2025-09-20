import React, { useEffect, useRef } from "react";
import { ensureH5PGlobals } from "../utils/h5pLoader";

// Helper function for logging
const logDebug = (debug, ...messages) => {
  if (debug) console.log(...messages);
};

export default function H5PPlayer({
  h5pPath = "/h5p/my-interactive",
  playerBase = "/assets/h5p-player",
  // iframe is the default in h5p-standalone; allow override for content that may render better in div mode
  embedType = "iframe",
  retryCount = 40,
  retryInterval = 200,
  debug = false,
  containerRef: externalContainerRef,
}) {
  // Always call useRef, then assign to external if provided
  const internalRef = useRef(null);
  const containerRef = externalContainerRef || internalRef;
  const pathRef = useRef(h5pPath);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentPath = h5pPath;
      pathRef.current = currentPath;
      logDebug(debug, "[H5PPlayer] Mounting content from", currentPath);

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
        let frameBundle;
        let frameCss;
        try {
          const globals = await ensureH5PGlobals({ playerBase, retryCount, retryInterval });
          frameBundle = globals.frameBundle;
          frameCss = globals.frameCss;
        } catch (e) {
          console.error('[H5PPlayer] Failed ensuring globals', e);
          return;
        }

        const Constructor = window.H5PStandalone?.H5P;
        if (!Constructor) {
          console.error('[H5PPlayer] H5P constructor missing');
          return;
        }

        // Always pass embedType to override inconsistent h5p.json values.
        // Koha content lists 'div' in h5p.json but library requires 'iframe'.
        const options = { h5pJsonPath: currentPath, frameJs: frameBundle, frameCss, embedType };
        logDebug(debug, "[H5PPlayer] Initializing with options", options);

        try {
          new Constructor(containerRef.current, options);
          logDebug(debug, "[H5PPlayer] Initialized content for", currentPath);
        } catch (err) {
          if (window.H5P && typeof window.H5P.init === 'function') {
            window.H5P.init(containerRef.current);
            logDebug(debug, '[H5PPlayer] Fallback window.H5P.init used for', currentPath);
          } else {
            console.error('[H5PPlayer] init error:', err);
          }
        }

        // Post render sanity check
        setTimeout(() => {
          if (
            !cancelled &&
            containerRef.current &&
            containerRef.current.innerHTML.trim() === ""
          ) {
            logDebug(debug, "[H5PPlayer] Container still empty after initialization. Check console/network for errors.");
          }
        }, 300);
      } catch (err) {
        if (!cancelled) console.error("[H5PPlayer] unexpected error:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [h5pPath, playerBase, embedType, retryCount, retryInterval, debug, containerRef]);

  return (
    <div className="h5p-wrapper" key={h5pPath}>
      <div ref={containerRef} className="h5p-container" />
    </div>
  );
}
