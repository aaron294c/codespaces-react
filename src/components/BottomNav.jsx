import React from "react";
import { NavLink } from "react-router-dom";

const tab = ({ to, icon, label, exact }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center gap-1 w-16 h-16 ${
        isActive ? "text-blue-600 font-bold" : "text-gray-500"
      }`
    }
  >
    <span className="material-symbols-outlined text-2xl">{icon}</span>
    <p className="text-xs">{label}</p>
  </NavLink>
);

export default function BottomNav() {
  return (
    <footer className="sticky bottom-0 bg-white/95 backdrop-blur-md safe-area-bottom border-t border-gray-200/80">
      <nav className="flex justify-around items-center h-16 px-4">
        {tab({ to: "/home", icon: "home", label: "Home", exact: true })}
        {tab({ to: "/insights", icon: "bar_chart", label: "Insights" })}
        <NavLink to="/expense" className="w-16 h-16 flex items-center justify-center">
          <span className="flex items-center justify-center size-14 bg-blue-600 text-white rounded-full shadow-lg">
            <span className="material-symbols-outlined text-3xl">add</span>
          </span>
        </NavLink>
        {tab({ to: "/accounts", icon: "credit_card", label: "Accounts" })}
        {tab({ to: "/settings", icon: "settings", label: "Settings" })}
      </nav>
    </footer>
  );
}