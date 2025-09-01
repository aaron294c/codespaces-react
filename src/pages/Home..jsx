import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  
  // Get user name from email or user data
  const userName = user?.user_metadata?.full_name || 
                   user?.email?.split('@')[0] || 
                   'User';

  return (
    <div className="bg-white min-h-screen">
      <div className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden bg-white">
        <div className="relative z-10 flex flex-col flex-grow">
          <header className="flex items-center p-4 pb-2 justify-between bg-white sticky top-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Hello,</p>
                <p className="font-bold text-gray-900 text-lg">{userName}</p>
              </div>
            </div>
            <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-gray-600 hover:bg-gray-100">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </header>
          
          <main className="flex-grow p-4 space-y-5">
            {/* Budget Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Budget Overview</h2>
              <div className="relative w-48 h-48 mx-auto">
                <svg className="w-full h-full" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 36 36">
                  <path 
                    className="text-gray-100" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3.8"
                  />
                  <path 
                    className="text-blue-600 transition-all duration-[1500ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeDasharray="62.5, 100" 
                    strokeLinecap="round" 
                    strokeWidth="3.8" 
                    style={{ strokeDashoffset: 0 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[42px] font-light text-gray-900">$1250</span>
                  <span className="text-sm text-gray-500">of $2,000</span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-500 text-xl">trending_up</span>
                  <h3 className="text-sm font-semibold text-gray-600">Spending Velocity</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">$45/day</p>
                <p className="text-xs text-gray-500">vs $42/day last week</p>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Budget Forecast</h3>
                <p className="text-2xl font-bold text-gray-900">$1950</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-600 h-1.5 rounded-full w-[65%]"></div>
                </div>
                <p className="text-xs text-gray-500 text-right mt-0.5">by end of month</p>
              </div>
            </div>
            
            {/* Upcoming Bills */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Upcoming Bill</h3>
                  <p className="text-lg font-bold text-gray-900">Netflix Subscription</p>
                  <p className="text-sm text-gray-500">Due in 3 days - $15.99</p>
                </div>
                <button className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow hover:opacity-90 transition-opacity">
                  Pay Now
                </button>
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div>
              <h2 className="text-xl font-semibold mb-4 px-4 text-gray-900">Recent Transactions</h2>
              <div className="space-y-3">
                {[
                  { name: "Whole Foods", category: "Groceries", amount: "-$75.50", icon: "shopping_bag" },
                  { name: "The Italian Place", category: "Dining", amount: "-$45.00", icon: "restaurant" },
                  { name: "Electricity Bill", category: "Utilities", amount: "-$120.00", icon: "lightbulb" },
                  { name: "Movie Night", category: "Entertainment", amount: "-$30.00", icon: "movie" }
                ].map((transaction, index) => (
                  <div key={index} className="bg-white rounded-2xl flex items-center gap-4 p-4 shadow-sm border border-gray-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shrink-0">
                      <span className="material-symbols-outlined text-gray-600">{transaction.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">{transaction.name}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                    <p className="font-bold text-red-600">{transaction.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}