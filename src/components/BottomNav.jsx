import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { to: '/home', label: 'Home' },
  { to: '/insights', label: 'Insights' },
  { to: '/expense', label: '＋' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/settings', label: 'Settings' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map((t, i) => {
        const active = pathname === t.to;
        return (
          <button
            key={t.to}
            onClick={() => navigate(t.to)}
            className={`tab ${active ? 'active' : ''} ${i === 2 ? 'plus' : ''}`}
            aria-label={t.label}
          >
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
