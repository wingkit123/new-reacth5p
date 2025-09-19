import React from 'react';

// Simple theme toggle button for demo (replace with your own styling/logic as needed)
export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      aria-label="Toggle theme"
      onClick={onToggle}
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
