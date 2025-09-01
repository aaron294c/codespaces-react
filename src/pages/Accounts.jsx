// src/pages/Accounts.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { dbHelpers } from "../lib/supabase";

export default function Accounts() {
  const { householdId } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!householdId) return;
      
      try {
        setLoading(true);
        const accountsData = await dbHelpers.getAccounts(householdId);
        setAccounts(accountsData);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [householdId]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <button className="flex items-center justify-center rounded-full h-10 w-10 bg-blue-600 text-white">
          <span className="material-symbols-outlined">add</span>
        </button>
      </header>

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-gray-400 text-2xl">credit_card</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Accounts Yet</h3>
          <p className="text-gray-500 mb-4">Add your first account to start tracking your finances</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
            Add First Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.account_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 rounded-xl size-12 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-600">credit_card</span>
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-900 text-lg">{account.account_name}</p>
                  <p className="text-gray-500 text-sm">{account.account_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${account.current_balance?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}