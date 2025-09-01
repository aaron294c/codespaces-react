// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { dbHelpers } from "../lib/supabase";

const LoadingSkeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <span className="material-symbols-outlined text-gray-400 text-2xl">{icon}</span>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{description}</p>
    {action && action}
  </div>
);

export default function Dashboard() {
  const { user, householdId, loading: authLoading } = useAuth();
  const [data, setData] = useState({
    accounts: [],
    monthlySpend: [],
    budgetProgress: [],
    recentTransactions: [],
    upcomingBills: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!householdId) return;

      try {
        setLoading(true);
        setError(null);

        const [accounts, monthlySpend, budgetProgress, recentTransactions, upcomingBills] = await Promise.all([
          dbHelpers.getAccounts(householdId),
          dbHelpers.getMonthlySpend(householdId, currentYear, currentMonth),
          dbHelpers.getBudgetProgress(householdId, currentYear, currentMonth),
          dbHelpers.getRecentTransactions(householdId, 10),
          dbHelpers.getUpcomingBills(householdId, 3)
        ]);

        setData({
          accounts,
          monthlySpend,
          budgetProgress,
          recentTransactions,
          upcomingBills
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [householdId, currentYear, currentMonth]);

  // Calculate spending summary
  const spendingSummary = React.useMemo(() => {
    const totalBudget = data.budgetProgress.reduce((sum, item) => sum + item.budget_amount, 0);
    const totalSpent = data.budgetProgress.reduce((sum, item) => sum + item.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Calculate daily spending rate
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const currentDay = currentDate.getDate();
    const dailyRate = currentDay > 0 ? totalSpent / currentDay : 0;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      spentPercentage: Math.min(spentPercentage, 100),
      dailyRate,
      projectedMonthly: dailyRate * daysInMonth
    };
  }, [data.budgetProgress, currentYear, currentMonth, currentDate]);

  if (authLoading || loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="p-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <LoadingSkeleton className="h-10 w-10 rounded-full" />
              <div>
                <LoadingSkeleton className="h-4 w-16 mb-1" />
                <LoadingSkeleton className="h-6 w-24" />
              </div>
            </div>
            <LoadingSkeleton className="h-10 w-10 rounded-full" />
          </div>

          {/* Budget overview skeleton */}
          <LoadingSkeleton className="h-48 w-full rounded-2xl mb-6" />
          
          {/* Quick stats skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <LoadingSkeleton className="h-24 w-full rounded-2xl" />
            <LoadingSkeleton className="h-24 w-full rounded-2xl" />
          </div>

          {/* Recent transactions skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <LoadingSkeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Hello,</p>
              <p className="font-bold text-gray-900 text-lg">{userName}</p>
            </div>
          </div>
          <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </header>

        {/* Budget Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Budget Overview</h2>
          
          {data.budgetProgress.length === 0 ? (
            <EmptyState
              icon="account_balance_wallet"
              title="No Budget Set"
              description="Create your first budget to start tracking your spending"
              action={
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Create Budget
                </button>
              }
            />
          ) : (
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path 
                    className="text-gray-100" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3.8"
                  />
                  <path 
                    className="text-blue-600 transition-all duration-1000 ease-out" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeDasharray={`${spendingSummary.spentPercentage}, 100`}
                    strokeLinecap="round" 
                    strokeWidth="3.8"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-light text-gray-900">
                    ${spendingSummary.totalSpent.toFixed(0)}
                  </span>
                  <span className="text-sm text-gray-500">
                    of ${spendingSummary.totalBudget.toFixed(0)}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                ${spendingSummary.totalRemaining.toFixed(0)} remaining this month
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-green-500 text-xl">trending_up</span>
              <h3 className="text-sm font-semibold text-gray-600">Daily Average</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${spendingSummary.dailyRate.toFixed(0)}/day
            </p>
            <p className="text-xs text-gray-500">
              Current spending pace
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Monthly Projection</h3>
            <p className="text-2xl font-bold text-gray-900">
              ${spendingSummary.projectedMonthly.toFixed(0)}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
              <div 
                className={`h-1.5 rounded-full ${
                  spendingSummary.projectedMonthly > spendingSummary.totalBudget 
                    ? 'bg-red-500' 
                    : 'bg-blue-600'
                }`}
                style={{ 
                  width: `${Math.min((spendingSummary.projectedMonthly / spendingSummary.totalBudget) * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-xs text-gray-500 text-right mt-0.5">
              {spendingSummary.projectedMonthly > spendingSummary.totalBudget ? 'Over budget' : 'On track'}
            </p>
          </div>
        </div>

        {/* Upcoming Bills */}
        {data.upcomingBills.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Upcoming Bills</h3>
            {data.upcomingBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-lg font-bold text-gray-900">{bill.name}</p>
                  <p className="text-sm text-gray-500">
                    Due {new Date(bill.due_date).toLocaleDateString()} - ${bill.amount}
                  </p>
                </div>
                <button className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow hover:opacity-90 transition-opacity">
                  Pay Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            {data.recentTransactions.length > 0 && (
              <button className="text-blue-600 text-sm font-medium hover:underline">
                View All
              </button>
            )}
          </div>
          
          {data.recentTransactions.length === 0 ? (
            <EmptyState
              icon="receipt_long"
              title="No Transactions Yet"
              description="Add your first expense to start tracking your spending"
              action={
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Expense
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => {
                const categoryName = transaction.category?.name || 'Uncategorized';
                const categoryColor = transaction.category?.color || '#6B7280';
                const accountName = transaction.account?.name || 'Account';
                
                return (
                  <div key={transaction.id} className="bg-white rounded-2xl flex items-center gap-4 p-4 shadow-sm border border-gray-100">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-full shrink-0"
                      style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {getCategoryIcon(categoryName)}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">
                        {transaction.merchant || categoryName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {categoryName} • {accountName}
                      </p>
                      {transaction.note && (
                        <p className="text-xs text-gray-400 mt-1">
                          {transaction.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.direction === 'outflow' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.direction === 'outflow' ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.occurred_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Accounts Summary */}
        {data.accounts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Balances</h2>
            <div className="space-y-3">
              {data.accounts.map((account) => (
                <div key={account.account_id} className="bg-white rounded-2xl flex items-center gap-4 p-4 shadow-sm border border-gray-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shrink-0">
                    <span className="material-symbols-outlined text-gray-600">
                      {getAccountIcon(account.account_type)}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">{account.account_name}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {account.account_type.replace('_', ' ')} • {account.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ${account.current_balance.toFixed(2)}
                    </p>
                    {account.net_change !== 0 && (
                      <p className={`text-sm ${
                        account.net_change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {account.net_change > 0 ? '+' : ''}${account.net_change.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for icons
function getCategoryIcon(categoryName) {
  const iconMap = {
    'Groceries': 'shopping_cart',
    'Dining Out': 'restaurant',
    'Transportation': 'directions_car',
    'Utilities': 'lightbulb',
    'Entertainment': 'movie',
    'Shopping': 'shopping_bag',
    'Healthcare': 'local_hospital',
    'Rent/Mortgage': 'home',
    'Bills': 'receipt_long'
  };
  
  return iconMap[categoryName] || 'receipt';
}

function getAccountIcon(accountType) {
  const iconMap = {
    'checking': 'account_balance',
    'savings': 'savings',
    'credit_card': 'credit_card',
    'investment': 'trending_up',
    'cash': 'payments'
  };
  
  return iconMap[accountType] || 'account_balance';
}