import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace state={{ from: pathname }} />;
  }
  
  return (
    <div className="app-shell min-h-screen flex flex-col bg-[#f7f8fa]">
      <main className="flex-1 content px-4 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}