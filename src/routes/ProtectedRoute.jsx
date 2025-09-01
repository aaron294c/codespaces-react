import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <div style={{padding:'4rem', textAlign:'center'}}>Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/setup" replace />;
  return <Outlet />;
}
