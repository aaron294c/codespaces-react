import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav.jsx';

export default function ProtectedLayout() {
  return (
    <div className="app-shell">
      <main className="content"><Outlet /></main>
      <BottomNav />
    </div>
  );
}
