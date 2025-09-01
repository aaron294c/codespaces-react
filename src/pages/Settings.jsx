import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: false,
    faceId: true,
  });

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden">
        <div className="flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center p-4">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 flex-1">
                Settings
              </h1>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
            {/* Preferences */}
            <section>
              <h2 className="text-lg font-semibold text-gray-500 mb-2 px-4">
                Preferences
              </h2>
              <div className="bg-white rounded-xl shadow-sm">
                <a
                  className="flex items-center justify-between p-4 border-b border-gray-100"
                  href="#"
                >
                  <p className="text-gray-900">Currency</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">USD</span>
                    <span className="material-symbols-outlined text-gray-400">
                      chevron_right
                    </span>
                  </div>
                </a>
                <a
                  className="flex items-center justify-between p-4 border-b border-gray-100"
                  href="#"
                >
                  <p className="text-gray-900">Date Format</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">MM/DD/YYYY</span>
                    <span className="material-symbols-outlined text-gray-400">
                      chevron_right
                    </span>
                  </div>
                </a>
                <a className="flex items-center justify-between p-4" href="#">
                  <p className="text-gray-900">Time Format</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">12-hour</span>
                    <span className="material-symbols-outlined text-gray-400">
                      chevron_right
                    </span>
                  </div>
                </a>
              </div>
            </section>

            {/* Notifications */}
            <section>
              <h2 className="text-lg font-semibold text-gray-500 mb-2 px-4">
                Notifications
              </h2>
              <div className="bg-white rounded-xl shadow-sm">
                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <p className="text-gray-900">Push Notifications</p>
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
                  <p className="text-gray-900">Email Notifications</p>
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

                {/* Face ID */}
                <div className="flex items-center justify-between p-4">
                  <p className="text-gray-900">Enable Face ID</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      checked={preferences.faceId}
                      className="sr-only peer"
                      type="checkbox"
                      onChange={() => handleToggle("faceId")}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* App */}
            <section>
              <h2 className="text-lg font-semibold text-gray-500 mb-2 px-4">
                App
              </h2>
              <div className="bg-white rounded-xl shadow-sm">
                <a
                  className="flex items-center justify-between p-4 border-b border-gray-100"
                  href="#"
                >
                  <p className="text-gray-900">Privacy Policy</p>
                  <span className="material-symbols-outlined text-gray-400">
                    chevron_right
                  </span>
                </a>
                <a
                  className="flex items-center justify-between p-4 border-b border-gray-100"
                  href="#"
                >
                  <p className="text-gray-900">Terms of Service</p>
                  <span className="material-symbols-outlined text-gray-400">
                    chevron_right
                  </span>
                </a>
                <div className="flex items-center justify-between p-4">
                  <p className="text-gray-900">App Version</p>
                  <span className="text-gray-500">1.0.0</span>
                </div>
              </div>
            </section>

            {/* Logout */}
            <section className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
