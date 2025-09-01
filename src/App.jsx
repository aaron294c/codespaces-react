// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './layouts/ProtectedLayout.jsx';

// Pages (all live in src/pages)
import Welcome from './pages/Welcome.jsx';
import AccountSetup from './pages/AccountSetup.jsx';
import Home from './pages/Home.jsx';
import Insights from './pages/Insights.jsx';
import Expense from './pages/Expense.jsx';
import OtherAccounts from './pages/OtherAccounts.jsx';
import Settings from './pages/Settings.jsx';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Welcome />} />
            <Route path="/setup" element={<AccountSetup />} />

            {/* Protected (with persistent BottomNav via layout) */}
            <Route path="/" element={<ProtectedLayout />}>
              <Route path="home" element={<Home />} />
              <Route path="insights" element={<Insights />} />
              <Route path="expense" element={<Expense />} />
              <Route path="accounts" element={<OtherAccounts />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
