import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// Pages
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import JoinHousehold from "./pages/JoinHousehold";
import Dashboard from "./pages/Dashboard";
import Expense from "./pages/Expense";
import Insights from "./pages/Insights";

// Auth guards
import { useAuth } from "./context/AuthContext";

function RequireAuth({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }
  
  return children;
}

function RequireHousehold({ children }) {
  const { loading, householdId } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!householdId) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Public routes */}
      <Route path="/welcome" element={<Welcome />} />
      
      {/* Auth required routes */}
      <Route path="/onboarding" element={
        <RequireAuth>
          <Onboarding />
        </RequireAuth>
      } />
      <Route path="/households/join" element={
        <RequireAuth>
          <JoinHousehold />
        </RequireAuth>
      } />
      
      {/* Household required routes */}
      <Route path="/dashboard" element={
        <RequireAuth>
          <RequireHousehold>
            <Dashboard />
          </RequireHousehold>
        </RequireAuth>
      } />
      <Route path="/expense/new" element={
        <RequireAuth>
          <RequireHousehold>
            <Expense />
          </RequireHousehold>
        </RequireAuth>
      } />
      <Route path="/insights" element={
        <RequireAuth>
          <RequireHousehold>
            <Insights />
          </RequireHousehold>
        </RequireAuth>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <AppRoutes />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}