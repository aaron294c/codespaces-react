import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";

export default function ProtectedLayout() {
  const { isAuthed } = useAuth();
  const { pathname } = useLocation();
  
  if (!isAuthed) {
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