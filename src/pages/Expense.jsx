// src/pages/Expense.jsx - Updated to use centralized data context
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { formatMoney } from "../lib/dbHelpers";
import toast from 'react-hot-toast';

export default function Expense() {
  const { householdId } = useAuth();
  const navigate = useNavigate();
  const { categories, accounts, addTransaction, loading: dataLoading } = useData();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    note: '',
    categoryId: '',
    accountId: '',
    occurredAt: new Date().toISOString().split('T')[0] // Today's date
  });

  const quickAmounts = [5, 10, 25, 50, 100];

  // Auto-select first account if available
  useEffect(() => {
    if (accounts.length > 0 && !formData.accountId) {
      setFormData(prev => ({ ...prev, accountId: accounts[0].account_id }));
    }
  }, [accounts, formData.accountId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickAmount = (amount) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, categoryId }));
  };

  const validateForm = () => {
    const amount = parseFloat(formData.amount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return false;
    }

    if (!formData.accountId) {
      toast.error('Please select an account');
      return false;
    }

    if (!formData.occurredAt) {
      toast.error('Please select a date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const transactionData = {
        household_id: householdId,
        account_id: formData.accountId,
        category_id: formData.categoryId,
        direction: 'outflow',
        amount: parseFloat(formData.amount),
        currency: 'USD',
        merchant: formData.merchant.trim() || null,
        note: formData.note.trim() || null,
        occurred_at: formData.occurredAt
      };

      console.log('➕ Adding transaction:', transactionData);

      // Use the centralized addTransaction method which will automatically refresh all data
      await addTransaction(transactionData);
      
      toast.success('Expense added successfully!', {
        icon: '✅',
        duration: 3000
      });
      
      // Reset form
      setFormData({
        amount: '',
        merchant: '',
        note: '',
        categoryId: '',
        accountId: accounts[0]?.account_id || '',
        occurredAt: new Date().toISOString().split('T')[0]
      });
      
      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error adding expense:', error);
      toast.error('Failed to add expense. Please try again.', {
        icon: '❌',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  // Filter expense categories
  const expenseCategories = categories.filter(cat => cat.kind === 'expense');

  if (dataLoading && !categories.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-xl transform transition-transform duration-300 animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Add Expense</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          {/* Amount */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl text-gray-400">$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="text-5xl font-light text-gray-900 bg-transparent border-none focus:outline-none text-center w-full max-w-xs"
                placeholder="0"
                min="0"
                step="0.01"
                autoFocus
              />
            </div>

            {/* Quick Amounts */}
            <div className="flex justify-center gap-2 mb-6">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickAmount(amount)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.amount === amount.toString()
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Merchant */}
          <div>
            <input
              type="text"
              name="merchant"
              value={formData.merchant}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Where did you spend? (optional)"
            />
          </div>

          {/* Note */}
          <div>
            <input
              type="text"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a note (optional)"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="occurredAt"
              value={formData.occurredAt}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Account Selection */}
          {accounts.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account
              </label>
              <select
                name="accountId"
                value={formData.accountId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {accounts.map((account) => (
                  <option key={account.account_id} value={account.account_id}>
                    {account.account_name} ({formatMoney(account.current_balance)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </label>
            {expenseCategories.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {expenseCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.categoryId === category.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {category.icon || 'category'}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">
                        {category.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2 block">category</span>
                <p>No expense categories available</p>
                <p className="text-sm">Please add categories in settings</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !formData.amount || !formData.categoryId || !formData.accountId}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding Expense...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">add</span>
                  <span>Add Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
