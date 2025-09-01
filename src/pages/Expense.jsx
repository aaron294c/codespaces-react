// src/pages/Expense.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dbHelpers, supabase } from "../lib/supabase";

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
);

export default function Expense() {
  const navigate = useNavigate();
  const { user, householdId } = useAuth();
  
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    accountId: '',
    merchant: '',
    note: '',
    occurredAt: new Date().toISOString().split('T')[0]
  });
  
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const quickAmounts = [5, 10, 25, 50, 100];

  useEffect(() => {
    const fetchData = async () => {
      if (!householdId) return;
      
      try {
        setLoading(true);
        const [categoriesData, accountsData] = await Promise.all([
          dbHelpers.getCategories(householdId),
          dbHelpers.getAccounts(householdId)
        ]);
        
        setCategories(categoriesData.filter(cat => cat.kind === 'expense'));
        setAccounts(accountsData);
        
        // Set default account if available
        if (accountsData.length > 0 && !formData.accountId) {
          setFormData(prev => ({
            ...prev,
            accountId: accountsData[0].account_id
          }));
        }
      } catch (err) {
        console.error('Error fetching expense form data:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [householdId]);

  const handleAmountChange = (value) => {
    // Only allow numbers and decimal points
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) return; // Don't allow multiple decimals
    if (parts[1] && parts[1].length > 2) return; // Don't allow more than 2 decimal places
    
    setFormData(prev => ({ ...prev, amount: cleanValue }));
    setError('');
  };

  const handleQuickAmount = (amount) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const categoryColors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
      ];
      
      const newCategory = await dbHelpers.insertCategory({
        household_id: householdId,
        name: newCategoryName.trim(),
        color: categoryColors[categories.length % categoryColors.length],
        kind: 'expense'
      });
      
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validation
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (!formData.categoryId) {
        throw new Error('Please select a category');
      }
      
      if (!formData.accountId) {
        throw new Error('Please select an account');
      }

      // Prepare transaction data
      const transactionData = {
        household_id: householdId,
        account_id: formData.accountId,
        category_id: formData.categoryId,
        created_by: user.id,
        direction: 'outflow',
        amount: parseFloat(formData.amount),
        currency: 'USD',
        merchant: formData.merchant.trim() || null,
        note: formData.note.trim() || null,
        occurred_at: new Date(formData.occurredAt + 'T12:00:00').toISOString()
      };

      // Insert transaction
      await dbHelpers.insertTransaction(transactionData);
      
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          amount: '',
          categoryId: '',
          accountId: accounts[0]?.account_id || '',
          merchant: '',
          note: '',
          occurredAt: new Date().toISOString().split('T')[0]
        });
        setSuccess(false);
        
        // Navigate back to dashboard
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err.message || 'Failed to add expense. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-200 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gray-200 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Expense Added!</h2>
          <p className="text-gray-600">Your transaction has been saved successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 min-h-screen">
      <div className="relative flex size-full min-h-screen flex-col justify-end bg-black/30">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 text-white/80 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h1 className="text-white font-semibold">Add Expense</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Form */}
        <div className="relative flex flex-col rounded-t-[28px] bg-white pb-6 pt-4 shadow-xl animate-[slide-up_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards] max-h-[90vh] overflow-y-auto">
          <div className="flex h-5 w-full items-center justify-center mb-4">
            <div className="h-1.5 w-10 rounded-full bg-gray-300"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 px-4">
            {/* Amount Input */}
            <div className="px-2 mb-6">
              <div className="relative flex items-center justify-center">
                <span className="text-4xl font-light text-gray-400 self-start pt-1.5 pr-1">$</span>
                <input 
                  className="form-input h-auto w-full border-none bg-transparent p-0 text-center text-[56px] font-light text-black placeholder:text-gray-400 focus:outline-none focus:ring-0" 
                  placeholder="0.00" 
                  type="text" 
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  inputMode="decimal"
                />
              </div>
            </div>
            
            {/* Quick Amounts */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {quickAmounts.map((amount) => (
                <button 
                  key={amount}
                  type="button"
                  onClick={() => handleQuickAmount(amount)}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
                >
                  ${amount}
                </button>
              ))}
            </div>
            
            {/* Merchant Input */}
            <div className="px-2 mb-6">
              <input 
                name="merchant"
                value={formData.merchant}
                onChange={handleInputChange}
                className="form-input w-full rounded-xl border-none bg-gray-100 py-3.5 pl-4 pr-4 text-base text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600" 
                placeholder="Merchant (e.g., Starbucks)" 
                type="text"
              />
            </div>

            {/* Note Input */}
            <div className="px-2 mb-6">
              <input 
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="form-input w-full rounded-xl border-none bg-gray-100 py-3.5 pl-4 pr-4 text-base text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600" 
                placeholder="Note (optional)" 
                type="text"
              />
            </div>

            {/* Date Input */}
            <div className="px-2 mb-6">
              <input 
                name="occurredAt"
                value={formData.occurredAt}
                onChange={handleInputChange}
                className="form-input w-full rounded-xl border-none bg-gray-100 py-3.5 pl-4 pr-4 text-base text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600" 
                type="date"
              />
            </div>
            
            {/* Categories */}
            <div className="px-2 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold tracking-tight text-gray-500 uppercase">
                  Categories
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Add New
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button 
                    key={category.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, categoryId: category.id }))}
                    className={`flex h-[88px] flex-col items-center justify-center gap-y-2 rounded-2xl transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      formData.categoryId === category.id 
                        ? "ring-2 ring-blue-600" 
                        : ""
                    }`}
                    style={{
                      backgroundColor: formData.categoryId === category.id 
                        ? `${category.color}20` 
                        : '#F3F4F6',
                      color: formData.categoryId === category.id ? category.color : '#6B7280'
                    }}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {getCategoryIcon(category.name)}
                    </span>
                    <p className="text-xs font-medium px-1 text-center leading-tight">
                      {category.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Selection */}
            {accounts.length > 1 && (
              <div className="px-2 mb-6">
                <h3 className="text-base font-semibold tracking-tight text-gray-500 uppercase mb-4">
                  Account
                </h3>
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <button
                      key={account.account_id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, accountId: account.account_id }))}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${
                        formData.accountId === account.account_id
                          ? 'bg-blue-100 ring-2 ring-blue-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                        <span className="material-symbols-outlined text-gray-600">
                          {getAccountIcon(account.account_type)}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">{account.account_name}</p>
                        <p className="text-sm text-gray-500">
                          ${account.current_balance.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="px-2 mb-4">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
                  {error}
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="px-2 pb-2">
              <button 
                type="submit"
                disabled={submitting || !formData.amount || !formData.categoryId || !formData.accountId}
                className="flex w-full cursor-pointer items-center justify-center rounded-full bg-blue-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                {submitting ? <LoadingSpinner /> : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* New Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Create New Category</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName('');
                }}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
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
  
  return iconMap[categoryName] || 'category';
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