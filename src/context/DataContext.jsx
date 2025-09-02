// src/context/DataContext.jsx
// Complete working implementation for real-time data synchronization

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { dbHelpers } from '../lib/dbHelpers';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export function DataProvider({ children }) {
  const { householdId } = useAuth();
  
  // Core data state
  const [data, setData] = useState({
    accounts: [],
    categories: [],
    transactions: [],
    budgets: [],
    bills: [],
    // Computed data
    totalSpent: 0,
    totalBudget: 0,
    budgetProgress: [],
    monthlySpend: [],
    recentTransactions: [],
    upcomingBills: []
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [subscribers, setSubscribers] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Current date context
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Centralized data loading function
  const loadAllData = useCallback(async (showLoading = false) => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      
      console.log('🔄 Loading all data for household:', householdId);
      
      // Load all data in parallel with proper error handling
      const results = await Promise.allSettled([
        dbHelpers.getAccounts(householdId),
        dbHelpers.getCategories(householdId),
        dbHelpers.getRecentTransactions(householdId, 10),
        dbHelpers.getBudgetProgress(householdId, currentYear, currentMonth),
        dbHelpers.getUpcomingBills(householdId, 5),
        dbHelpers.getMonthlySpend(householdId, currentYear, currentMonth),
        dbHelpers.getTotalBudgetForMonth(householdId, currentYear, currentMonth),
        dbHelpers.getTotalSpentForMonth(householdId, currentYear, currentMonth)
      ]);

      // Extract successful results
      const [
        accountsResult,
        categoriesResult,
        recentTransactionsResult,
        budgetProgressResult,
        upcomingBillsResult,
        monthlySpendResult,
        totalBudgetResult,
        totalSpentResult
      ] = results;

      const newData = {
        accounts: accountsResult.status === 'fulfilled' ? accountsResult.value : [],
        categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value : [],
        recentTransactions: recentTransactionsResult.status === 'fulfilled' ? recentTransactionsResult.value : [],
        budgetProgress: budgetProgressResult.status === 'fulfilled' ? budgetProgressResult.value : [],
        upcomingBills: upcomingBillsResult.status === 'fulfilled' ? upcomingBillsResult.value : [],
        monthlySpend: monthlySpendResult.status === 'fulfilled' ? monthlySpendResult.value : [],
        totalBudget: totalBudgetResult.status === 'fulfilled' ? totalBudgetResult.value : 0,
        totalSpent: totalSpentResult.status === 'fulfilled' ? totalSpentResult.value : 0,
        // Copy existing data for other fields
        transactions: data.transactions,
        budgets: data.budgets,
        bills: data.bills
      };

      setData(newData);
      setLastUpdated(new Date());
      
      console.log('✅ Data loaded successfully:', {
        accounts: newData.accounts.length,
        transactions: newData.recentTransactions.length,
        totalSpent: newData.totalSpent,
        totalBudget: newData.totalBudget
      });

      // Log any failed operations
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operations = ['accounts', 'categories', 'recentTransactions', 'budgetProgress', 'upcomingBills', 'monthlySpend', 'totalBudget', 'totalSpent'];
          console.warn(`⚠️ Failed to load ${operations[index]}:`, result.reason?.message || result.reason);
        }
      });

      // Notify subscribers
      subscribers.forEach(callback => {
        try {
          callback(newData);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });

    } catch (error) {
      console.error('❌ Error loading data:', error);
      if (showLoading) {
        toast.error('Failed to load data. Please try refreshing.');
      }
    } finally {
      setLoading(false);
    }
  }, [householdId, currentYear, currentMonth, subscribers, data.transactions, data.budgets, data.bills]);

  // Subscribe to data updates
  const subscribe = useCallback((callback) => {
    setSubscribers(prev => new Set([...prev, callback]));
    
    return () => {
      setSubscribers(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  // Manual refresh function
  const refreshData = useCallback(() => {
    console.log('🔄 Manual data refresh triggered');
    loadAllData(true);
  }, [loadAllData]);

  // Add new transaction with immediate data refresh
  const addTransaction = useCallback(async (transactionData) => {
    try {
      console.log('➕ Adding transaction:', transactionData);
      const newTransaction = await dbHelpers.insertTransaction(transactionData);
      
      // Immediately refresh all data to ensure consistency
      await loadAllData(false);
      
      return newTransaction;
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      throw error;
    }
  }, [loadAllData]);

  // Update budget with immediate refresh
  const updateBudget = useCallback(async (categoryId, amount) => {
    try {
      const budget = await dbHelpers.upsertBudget(
        householdId, 
        categoryId, 
        currentYear, 
        currentMonth, 
        amount
      );
      
      console.log('💰 Budget updated:', budget);
      await loadAllData(false);
      
      return budget;
    } catch (error) {
      console.error('❌ Error updating budget:', error);
      throw error;
    }
  }, [householdId, currentYear, currentMonth, loadAllData]);

  // Initial data load
  useEffect(() => {
    if (householdId) {
      loadAllData(true);
    } else {
      setLoading(false);
    }
  }, [householdId, loadAllData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!householdId) return;

    console.log('🔗 Setting up real-time subscriptions for household:', householdId);

    const channel = supabase
      .channel('household-data-sync')
      // Transactions table changes
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions', 
          filter: `household_id=eq.${householdId}` 
        }, 
        (payload) => {
          console.log('💸 Transaction change detected:', payload.eventType);
          setTimeout(() => loadAllData(false), 500); // Small delay to ensure DB consistency
        }
      )
      // Budget changes
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'budgets', 
          filter: `household_id=eq.${householdId}` 
        }, 
        (payload) => {
          console.log('💰 Budget change detected:', payload.eventType);
          setTimeout(() => loadAllData(false), 500);
        }
      )
      // Account changes
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'accounts', 
          filter: `household_id=eq.${householdId}` 
        }, 
        (payload) => {
          console.log('🏦 Account change detected:', payload.eventType);
          setTimeout(() => loadAllData(false), 500);
        }
      )
      // Category changes
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'categories', 
          filter: `household_id=eq.${householdId}` 
        }, 
        (payload) => {
          console.log('📂 Category change detected:', payload.eventType);
          setTimeout(() => loadAllData(false), 500);
        }
      )
      // Bills changes
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'recurring_bills', 
          filter: `household_id=eq.${householdId}` 
        }, 
        (payload) => {
          console.log('📄 Bill change detected:', payload.eventType);
          setTimeout(() => loadAllData(false), 500);
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        setConnectionStatus(status);
      });

    return () => {
      console.log('🔌 Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
      setConnectionStatus('disconnected');
    };
  }, [householdId, loadAllData]);

  // Periodic fallback refresh (every 2 minutes)
  useEffect(() => {
    if (!householdId) return;

    const interval = setInterval(() => {
      console.log('⏰ Periodic fallback refresh');
      loadAllData(false);
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [householdId, loadAllData]);

  // Calculate derived values
  const budgetPercentage = data.totalBudget > 0 ? (data.totalSpent / data.totalBudget) * 100 : 0;
  const remainingBudget = data.totalBudget - data.totalSpent;

  const contextValue = {
    // Data state
    ...data,
    loading,
    lastUpdated,
    connectionStatus,
    
    // Actions
    refreshData,
    addTransaction,
    updateBudget,
    subscribe,
    
    // Computed values
    budgetPercentage,
    remainingBudget,
    
    // Status
    isOnline: connectionStatus === 'SUBSCRIBED',
    syncStatus: loading ? 'syncing' : 'synced'
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

// Real-time sync status component
export function SyncStatus() {
  const { loading, lastUpdated, connectionStatus, isOnline } = useData();
  
  if (!lastUpdated && !loading) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
        loading 
          ? 'bg-blue-100 text-blue-700' 
          : isOnline
          ? 'bg-green-100 text-green-700'
          : 'bg-yellow-100 text-yellow-700'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          loading 
            ? 'bg-blue-500 animate-pulse' 
            : isOnline
            ? 'bg-green-500'
            : 'bg-yellow-500 animate-pulse'
        }`}></div>
        {loading 
          ? 'Syncing...' 
          : isOnline
          ? `Synced ${lastUpdated ? lastUpdated.toLocaleTimeString() : ''}`
          : 'Reconnecting...'
        }
      </div>
    </div>
  );
}

// Database health check component
export function DatabaseHealthCheck() {
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const result = await dbHelpers.checkDatabaseHealth();
      setHealth(result);
    } catch (error) {
      setHealth({ healthy: false, errors: [error.message] });
    }
    setChecking(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (checking) {
    return (
      <div className="fixed bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-sm">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Checking database health...</span>
        </div>
      </div>
    );
  }

  if (!health) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-sm max-w-xs">
      <div className={`flex items-center gap-2 mb-2 ${
        health.healthy ? 'text-green-600' : 'text-red-600'
      }`}>
        <div className={`w-3 h-3 rounded-full ${
          health.healthy ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className="font-medium">
          Database {health.healthy ? 'Healthy' : 'Issues Detected'}
        </span>
      </div>
      
      {!health.healthy && health.errors && (
        <div className="text-red-600 text-xs">
          {health.errors.slice(0, 3).map((error, i) => (
            <div key={i}>• {error}</div>
          ))}
        </div>
      )}
      
      <button 
        onClick={checkHealth}
        className="mt-2 text-blue-600 hover:text-blue-700 text-xs underline"
      >
        Re-check
      </button>
    </div>
  );
}