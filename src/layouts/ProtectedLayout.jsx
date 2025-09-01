// src/layouts/ProtectedLayout.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";

export default function ProtectedLayout() {
  const { isAuthenticated, loading, householdId } = useAuth();
  const { pathname } = useLocation();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to welcome if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace state={{ from: pathname }} />;
  }
  
  // Show error if authenticated but no household (shouldn't happen with auto-creation)
  if (!householdId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Setup Required</h2>
          <p className="text-gray-600 mb-4">
            We're setting up your household. This should only take a moment.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-shell min-h-screen flex flex-col bg-[#f7f8fa]">
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}