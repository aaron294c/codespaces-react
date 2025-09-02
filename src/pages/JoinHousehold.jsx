import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dbHelpers } from "../lib/dbHelpers";
import toast from 'react-hot-toast';

export default function JoinHousehold() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshHousehold } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [householdId, setHouseholdId] = useState(searchParams.get('id') || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!householdId.trim()) {
      toast.error('Please enter a household ID');
      return;
    }

    setLoading(true);
    
    try {
      await dbHelpers.joinHousehold(householdId.trim());
      
      // Refresh household context
      await refreshHousehold();
      
      toast.success('Successfully joined household!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error joining household:', error);
      
      if (error.message?.includes('duplicate key')) {
        toast.error('You are already a member of this household');
      } else if (error.message?.includes('foreign key')) {
        toast.error('Household not found. Please check the ID and try again.');
      } else {
        toast.error('Failed to join household. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/onboarding', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center text-purple-600 hover:text-purple-500 mb-4"
          >
            <span className="material-symbols-outlined mr-1">arrow_back</span>
            Back
          </button>
          
          <div className="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-white">🔗</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join Household</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the household ID to join an existing budget
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="householdId" className="block text-sm font-medium text-gray-700">
                Household ID
              </label>
              <div className="mt-1">
                <input
                  id="householdId"
                  name="householdId"
                  type="text"
                  required
                  value={householdId}
                  onChange={(e) => setHouseholdId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm font-mono"
                  placeholder="e.g., 12345678-1234-1234-1234-123456789012"
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p className="mb-2">Ask a household member to:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to Settings in their app</li>
                  <li>Copy the "Household ID"</li>
                  <li>Share it with you securely</li>
                </ol>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Joining Household...
                  </div>
                ) : (
                  'Join Household'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Create New Household Instead
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Privacy & Security</p>
              <p className="text-sm text-gray-600 mt-1">
                Joining a household gives you access to shared financial data. Only join households from people you trust completely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}