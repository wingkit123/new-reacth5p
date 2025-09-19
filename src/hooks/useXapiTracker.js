import { useEffect, useRef } from 'react';

// LocalStorage key for saved xAPI statements
const STORE_KEY = 'xapiRecords';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function readRecords() {
  const raw = localStorage.getItem(STORE_KEY);
  const parsed = raw ? safeParse(raw) : null;
  return Array.isArray(parsed) ? parsed : [];
}

function writeRecords(records) {
  localStorage.setItem(STORE_KEY, JSON.stringify(records));
}

export default function useXapiTracker() {
  const handlerRef = useRef(null);

  useEffect(() => {
    // xAPI events bubble on document in H5P
    const onXAPI = (event) => {
      const stmt = event?.data?.statement;
      if (!stmt) return;
      const current = readRecords();
      current.push(stmt);
      writeRecords(current);
    };
    handlerRef.current = onXAPI;
    document.addEventListener('xAPI', onXAPI);
    return () => {
      if (handlerRef.current) {
        document.removeEventListener('xAPI', handlerRef.current);
      }
    };
  }, []);

  const getRecords = () => readRecords();
  const clearRecords = () => localStorage.removeItem(STORE_KEY);

  return { getRecords, clearRecords };
}
