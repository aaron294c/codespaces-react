// src/App.jsx - Updated with centralized data management
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import { DataProvider, SyncStatus } from "./context/DataContext";
import "./index.css";

// Pages
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import JoinHousehold from "./pages/JoinHousehold";
import Dashboard from "./pages/Dashboard";
import Expense from "./pages/Expense";
import Insights from "./pages/Insights";
import Accounts from "./pages/Accounts";
import Settings from "./pages/Settings";

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

// Wrapper component that provides DataProvider only when needed
function DataProviderWrapper({ children }) {
  const { householdId } = useAuth();
  
  if (!householdId) {
    return children;
  }
  
  return (
    <DataProvider>
      <SyncStatus />
      {children}
    </DataProvider>
  );
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
      <Route path="/accounts" element={
        <RequireAuth>
          <RequireHousehold>
            <Accounts />
          </RequireHousehold>
        </RequireAuth>
      } />
      <Route path="/settings" element={
        <RequireAuth>
          <Settings />
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
      <DataProviderWrapper>
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
      </DataProviderWrapper>
    </AuthProvider>
  );
}

// -----------------------------------
// src/pages/Dashboard.jsx - Updated to use centralized data
// -----------------------------------

import React from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { formatMoney } from "../lib/dbHelpers";
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    // Data from context
    accounts,
    budgetProgress,
    recentTransactions,
    upcomingBills,
    totalBudget,
    totalSpent,
    budgetPercentage,
    remainingBudget,
    loading,
    lastUpdated,
    refreshData
  } = useData();

  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const currentDay = currentDate.getDate();
  const daysRemaining = daysInMonth - currentDay;
  const dailySpendRate = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;

  // Manual refresh handler
  const handleRefresh = () => {
    toast.loading('Refreshing data...', { id: 'refresh' });
    refreshData();
    setTimeout(() => {
      toast.success('Data refreshed!', { id: 'refresh' });
    }, 1000);
  };

  if (loading && !accounts.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  {currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                {lastUpdated && (
                  <p className="text-xs text-gray-400">
                    • Updated {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                title="Refresh data"
              >
                <span className="material-symbols-outlined">refresh</span>
              </button>
              <button 
                onClick={() => navigate('/insights')}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <span className="material-symbols-outlined">insights</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Budget Overview with real-time updates */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Monthly Budget Overview
          </h2>
          
          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={`transition-all duration-1000 ${
                  budgetPercentage > 100 ? 'text-red-500' : 
                  budgetPercentage > 80 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${Math.min(budgetPercentage, 100)}, 100`}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-light text-gray-900">
                {formatMoney(totalSpent)}
              </span>
              <span className="text-sm text-gray-500">
                of {formatMoney(totalBudget)}
              </span>
              <span className={`text-xs font-medium ${
                budgetPercentage > 100 ? 'text-red-600' : 
                budgetPercentage > 80 ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {Math.round(budgetPercentage)}% used
              </span>
            </div>
          </div>

          {totalBudget > 0 && (
            <div className="text-center text-sm text-gray-600">
              <p>
                {remainingBudget > 0 ? formatMoney(remainingBudget) : formatMoney(Math.abs(remainingBudget))} 
                {remainingBudget > 0 ? ' remaining' : ' over budget'}
              </p>
              {remainingBudget > 0 && daysRemaining > 0 && (
                <p className="mt-1">
                  Spend up to {formatMoney(dailySpendRate)} per day
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats with real-time account balances */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-green-500 text-xl">account_balance</span>
              <h3 className="text-sm font-medium text-gray-600">Total Balance</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatMoney(
                accounts.reduce((sum, account) => 
                  sum + parseFloat(account.current_balance || 0), 0
                )
              )}
            </p>
            <p className="text-xs text-gray-500">{accounts.length} accounts</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-blue-500 text-xl">trending_up</span>
              <h3 className="text-sm font-medium text-gray-600">This Month</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatMoney(totalSpent)}
            </p>
            <p className="text-xs text-gray-500">spent so far</p>
          </div>
        </div>

        {/* Real-time Budget Progress */}
        {budgetProgress.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
            </div>
            <div className="p-4 space-y-4">
              {budgetProgress.slice(0, 5).map((budget) => {
                const percentage = budget.budget_amount > 0 ? 
                  (parseFloat(budget.spent) / parseFloat(budget.budget_amount)) * 100 : 0;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={budget.budget_id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: budget.categories?.color || '#6B7280' }}
                        ></div>
                        <span className="font-medium text-gray-900">
                          {budget.categories?.name || 'Unknown Category'}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        isOverBudget ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatMoney(budget.spent)} / {formatMoney(budget.budget_amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    {isOverBudget && (
                      <p className="text-xs text-red-600">
                        Over by {formatMoney(parseFloat(budget.spent) - parseFloat(budget.budget_amount))}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Real-time Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button 
              onClick={() => navigate('/insights')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-600">
                      {transaction.category_name === 'Groceries' ? 'shopping_bag' :
                       transaction.category_name === 'Dining Out' ? 'restaurant' :
                       transaction.category_name === 'Transportation' ? 'directions_car' :
                       transaction.category_name === 'Utilities' ? 'lightbulb' :
                       transaction.category_name === 'Entertainment' ? 'movie' :
                       'receipt'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {transaction.merchant || 'Transaction'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.category_name || 'Uncategorized'} • {transaction.account_name}
                    </p>
                    {transaction.note && (
                      <p className="text-xs text-gray-400 mt-1">{transaction.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.direction === 'inflow' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.direction === 'inflow' ? '+' : '-'}
                      {formatMoney(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.occurred_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
              <p>No transactions yet</p>
              <button 
                onClick={() => navigate('/expense/new')}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Add your first transaction
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/expense/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Add Expense
          </button>
          <button 
            onClick={() => navigate('/insights')}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined">insights</span>
            View Insights
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button className="flex flex-col items-center p-2 text-blue-600">
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="text-xs">Home</span>
          </button>
          <button 
            onClick={() => navigate('/insights')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <span className="material-symbols-outlined text-2xl">bar_chart</span>
            <span className="text-xs">Insights</span>
          </button>
          <button 
            onClick={() => navigate('/expense/new')}
            className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center -mt-2"
          >
            <span className="material-symbols-outlined text-white text-2xl">add</span>
          </button>
          <button 
            onClick={() => navigate('/accounts')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <span className="material-symbols-outlined text-2xl">credit_card</span>
            <span className="text-xs">Accounts</span>
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <span className="material-symbols-outlined text-2xl">settings</span>
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>

      {/* Bottom padding for fixed nav */}
      <div className="h-20"></div>
    </div>
  );
}