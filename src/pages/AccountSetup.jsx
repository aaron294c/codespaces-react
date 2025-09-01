// src/pages/Accounts.jsx
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

export default function Accounts() {
  const { user, householdId } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    currency: 'USD',
    startingBalance: ''
  });

  const accountTypes = [
    { value: 'checking', label: 'Checking Account', icon: 'account_balance' },
    { value: 'savings', label: 'Savings Account', icon: 'savings' },
    { value: 'credit_card', label: 'Credit Card', icon: 'credit_card' },
    { value: 'investment', label: 'Investment Account', icon: 'trending_up' },
    { value: 'cash', label: 'Cash', icon: 'payments' }
  ];

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!householdId) return;

      try {
        setLoading(true);
        setError(null);
        const accountsData = await dbHelpers.getAccounts(householdId);
        setAccounts(accountsData);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [householdId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBalanceChange = (value) => {
    // Only allow numbers and decimal points
    const cleanValue = value.replace(/[^0-9.-]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) return; // Don't allow multiple decimals
    if (parts[1] && parts[1].length > 2) return; // Don't allow more than 2 decimal places
    
    setFormData(prev => ({ ...prev, startingBalance: cleanValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Please enter an account name');
      }

      const startingBalance = parseFloat(formData.startingBalance) || 0;

      const newAccount = await dbHelpers.insertAccount({
        household_id: householdId,
        name: formData.name.trim(),
        type: formData.type,
        currency: formData.currency,
        starting_balance: startingBalance,
        current_balance: startingBalance,
        created_by: user.id,
        is_active: true
      });

      // Update local state
      setAccounts(prev => [...prev, {
        account_id: newAccount.id,
        account_name: newAccount.name,
        account_type: newAccount.type,
        currency: newAccount.currency,
        starting_balance: startingBalance,
        current_balance: startingBalance,
        net_change: 0,
        household_id: householdId
      }]);

      // Reset form
      setFormData({
        name: '',
        type: 'checking',
        currency: 'USD',
        startingBalance: ''
      });
      setShowModal(false);

    } catch (err) {
      console.error('Error creating account:', err);
      alert(err.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const getAccountIcon = (accountType) => {
    const typeData = accountTypes.find(t => t.value === accountType);
    return typeData?.icon || 'account_balance';
  };

  const getAccountLabel = (accountType) => {
    const typeData = accountTypes.find(t => t.value === accountType);
    return typeData?.label || accountType.replace('_', ' ');
  };

  const calculateNetWorth = () => {
    return accounts.reduce((total, account) => {
      if (account.account_type === 'credit_card') {
        // Credit cards are liabilities, so subtract their balance
        return total - account.current_balance;
      } else {
        // Assets: checking, savings, investment, cash
        return total + account.current_balance;
      }
    }, 0);
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="p-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <LoadingSkeleton className="h-8 w-24" />
            <LoadingSkeleton className="h-10 w-10 rounded-full" />
          </div>

          {/* Net worth skeleton */}
          <LoadingSkeleton className="h-24 w-full rounded-2xl mb-6" />
          
          {/* Accounts skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <LoadingSkeleton key={i} className="h-20 w-full rounded-2xl" />
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

  const netWorth = calculateNetWorth();

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center rounded-full h-10 w-10 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </header>

        {/* Net Worth Summary */}
        {accounts.length > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
            <h2 className="text-lg font-semibold mb-2">Net Worth</h2>
            <p className="text-3xl font-bold mb-1">
              ${Math.abs(netWorth).toFixed(2)}
            </p>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span>
                Assets: ${accounts
                  .filter(a => a.account_type !== 'credit_card')
                  .reduce((sum, a) => sum + a.current_balance, 0)
                  .toFixed(2)}
              </span>
              <span>
                Debts: ${accounts
                  .filter(a => a.account_type === 'credit_card')
                  .reduce((sum, a) => sum + a.current_balance, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <EmptyState
            icon="credit_card"
            title="No Accounts Yet"
            description="Add your first account to start tracking your finances"
            action={
              <button 
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Add First Account
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.account_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 rounded-xl size-12 flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-600">
                      {getAccountIcon(account.account_type)}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900 text-lg">{account.account_name}</p>
                    <p className="text-gray-500 text-sm">
                      {getAccountLabel(account.account_type)} • {account.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      account.account_type === 'credit_card' 
                        ? account.current_balance > 0 ? 'text-red-600' : 'text-gray-900'
                        : 'text-gray-900'
                    }`}>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Account</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Chase Checking"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Balance
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    value={formData.startingBalance}
                    onChange={(e) => handleBalanceChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    inputMode="decimal"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current balance in this account
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}