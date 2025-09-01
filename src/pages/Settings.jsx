// src/pages/Settings.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: false,
    biometric: true,
  });

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSignOut = async () => {
    if (loggingOut) return;
    
    setLoggingOut(true);
    
    try {
      const { error } = await signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        alert('Failed to sign out. Please try again.');
        return;
      }
      
      // Navigation will be handled by the auth context
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const userEmail = user?.email || '';
  const userName = user?.user_metadata?.name || userEmail.split('@')[0] || 'User';

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4 space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </header>

        {/* User Profile Section */}
        <section>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-semibold text-gray-900">{userName}</h2>
                <p className="text-gray-500">{userEmail}</p>
              </div>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                Edit
              </button>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preferences
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">language</span>
                <span className="text-gray-900">Currency</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">USD ($)</span>
                <span className="material-symbols-outlined text-gray-400">
                  chevron_right
                </span>
              </div>
            </button>
            
            <button className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">calendar_today</span>
                <span className="text-gray-900">Date Format</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">MM/DD/YYYY</span>
                <span className="material-symbols-outlined text-gray-400">
                  chevron_right
                </span>
              </div>
            </button>
            
            <button className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">schedule</span>
                <span className="text-gray-900">Time Format</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">12-hour</span>
                <span className="material-symbols-outlined text-gray-400">
                  chevron_right
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Notifications
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">notifications</span>
                <div>
                  <p className="text-gray-900 font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500">Get notified about spending and bills</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={preferences.pushNotifications}
                  className="sr-only peer"
                  type="checkbox"
                  onChange={() => handleToggle("pushNotifications")}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">mail</span>
                <div>
                  <p className="text-gray-900 font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Weekly spending summaries</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={preferences.emailNotifications}
                  className="sr-only peer"
                  type="checkbox"
                  onChange={() => handleToggle("emailNotifications")}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            {/* Biometric Authentication */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">fingerprint</span>
                <div>
                  <p className="text-gray-900 font-medium">Biometric Auth</p>
                  <p className="text-sm text-gray-500">Use Face ID or fingerprint</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={preferences.biometric}
                  className="sr-only peer"
                  type="checkbox"
                  onChange={() => handleToggle("biometric")}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Support & Legal */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Support & Legal
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">help</span>
                <span className="text-gray-900">Help & Support</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">
                chevron_right
              </span>
            </button>
            
            <button className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">policy</span>
                <span className="text-gray-900">Privacy Policy</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">
                open_in_new
              </span>
            </button>
            
            <button className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">description</span>
                <span className="text-gray-900">Terms of Service</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">
                open_in_new
              </span>
            </button>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">info</span>
                <span className="text-gray-900">App Version</span>
              </div>
              <span className="text-gray-500">1.0.0</span>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account
          </h2>
          <div className="space-y-4">
            <button className="w-full bg-white text-gray-700 border border-gray-300 font-semibold py-4 px-6 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
              Export Data
            </button>
            
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="w-full bg-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">logout</span>
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}