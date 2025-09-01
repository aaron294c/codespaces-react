import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedLayout from "./layouts/ProtectedLayout";

// Import your actual files (based on ls output)
import Welcome from "./pages/Welcome.jsx";
import AccountSetup from "./pages/AccountSetup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Insights from "./pages/Insights.jsx";
import Expense from "./pages/Expense.jsx";
import Accounts from "./pages/Accounts.jsx"; // Your actual file
import Settings from "./pages/Settings.jsx";
// Note: You have "Accounts.jsx" but importing as OtherAccounts - let's check this

// Simple Home component since you don't have Home.jsx
const Home = () => (
  <div className="bg-white min-h-screen p-4">
    <div className="max-w-md mx-auto text-center pt-16">
      <h1 className="text-2xl font-bold mb-4">Welcome Home</h1>
      <p className="text-gray-600 mb-6">Choose what you'd like to do:</p>
      <div className="space-y-3">
        <a 
          href="/dashboard" 
          className="block bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Dashboard
        </a>
        <a 
          href="/expense" 
          className="block bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Expense
        </a>
        <a 
          href="/insights" 
          className="block bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          View Insights
        </a>
      </div>
    </div>
  </div>
);

export default function App() {
  console.log('✅ App component rendering with actual files');
  
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/setup" element={<AccountSetup />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}