import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dbHelpers } from "../lib/dbHelpers";
import { supabase } from "../lib/supabase";
import toast from 'react-hot-toast';

export default function Onboarding() {
  const [step, setStep] = useState('choice'); // 'choice', 'create', 'join'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    householdName: '',
    joinCode: ''
  });

  const navigate = useNavigate();
  const { refreshHousehold } = useAuth();

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateHousehold = async (e) => {
    e.preventDefault();
    
    if (!formData.householdName.trim()) {
      toast.error('Please enter a household name');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Creating household with name:', formData.householdName.trim());
      
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Not authenticated. Please sign in first.');
      }
      
      console.log('User authenticated:', user.id);
      
      // Create household
      const household = await dbHelpers.createHousehold(formData.householdName.trim());
      console.log('Household created:', household);
      
      // Add user as a member
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'owner'
        });
      
      if (memberError) {
        console.error('Error adding user as member:', memberError);
        // Don't throw error if user is already a member
        if (!memberError.message.includes('duplicate key')) {
          throw memberError;
        }
      }
      
      console.log('User added as household member');
      
      // Create default categories and account
      try {
        await Promise.all([
          dbHelpers.createDefaultCategories(household.id),
          dbHelpers.createDefaultAccount(household.id)
        ]);
        console.log('Default data created');
      } catch (defaultError) {
        console.warn('Error creating default data:', defaultError);
        // Don't fail the whole process if defaults fail
      }
      
      // Refresh household context
      await refreshHousehold();
      
      toast.success('Household created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error creating household:', error);
      toast.error('Failed to create household: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHousehold = async (e) => {
    e.preventDefault();
    
    if (!formData.joinCode.trim()) {
      toast.error('Please enter a household ID');
      return;
    }

    setLoading(true);
    
    try {
      await dbHelpers.joinHousehold(formData.joinCode.trim());
      
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
        toast.error('Failed to join household: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'choice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-white">🏠</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>
            <p className="mt-2 text-sm text-gray-600">
              Set up your household budget
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
            <div className="space-y-4">
              <button
                onClick={() => setStep('create')}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600">add_home</span>
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-medium text-gray-900">Create New Household</h3>
                  <p className="text-sm text-gray-500">Start fresh with your own budget</p>
                </div>
                <div className="ml-auto">
                  <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </div>
              </button>

              <button
                onClick={() => setStep('join')}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">group_add</span>
                  </div>
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-medium text-gray-900">Join Existing Household</h3>
                  <p className="text-sm text-gray-500">Connect to a shared budget</p>
                </div>
                <div className="ml-auto">
                  <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <button
              onClick={() => setStep('choice')}
              className="inline-flex items-center text-green-600 hover:text-green-500 mb-4"
            >
              <span className="material-symbols-outlined mr-1">arrow_back</span>
              Back
            </button>
            <h2 className="text-3xl font-bold text-gray-900">Create Household</h2>
            <p className="mt-2 text-sm text-gray-600">
              Give your household a name
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
            <form onSubmit={handleCreateHousehold} className="space-y-6">
              <div>
                <label htmlFor="householdName" className="block text-sm font-medium text-gray-700">
                  Household Name
                </label>
                <div className="mt-1">
                  <input
                    id="householdName"
                    name="householdName"
                    type="text"
                    required
                    value={formData.householdName}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="e.g., The Smith Family, Our Home"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Household'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <button
              onClick={() => setStep('choice')}
              className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
            >
              <span className="material-symbols-outlined mr-1">arrow_back</span>
              Back
            </button>
            <h2 className="text-3xl font-bold text-gray-900">Join Household</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the household ID you received
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
            <form onSubmit={handleJoinHousehold} className="space-y-6">
              <div>
                <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700">
                  Household ID
                </label>
                <div className="mt-1">
                  <input
                    id="joinCode"
                    name="joinCode"
                    type="text"
                    required
                    value={formData.joinCode}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                    placeholder="e.g., 12345678-1234-1234-1234-123456789012"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Ask a household member to share their household ID with you.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    'Join Household'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}