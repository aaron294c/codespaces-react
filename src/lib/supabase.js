// src/lib/supabase.js - Complete replacement with all required functions
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Auth helper functions
export const authHelpers = {
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}

// Database helper functions - Mock implementations for now
export const dbHelpers = {
  // Account related functions
  async getAccounts(householdId) {
    console.log('Mock: getAccounts called with householdId:', householdId);
    // Return mock account data
    return [
      {
        account_id: '1',
        account_name: 'Main Checking',
        account_type: 'checking',
        current_balance: 2543.50,
        currency: 'USD',
        net_change: -125.30
      },
      {
        account_id: '2',
        account_name: 'Savings Account',
        account_type: 'savings',
        current_balance: 8750.00,
        currency: 'USD',
        net_change: 250.00
      }
    ];
  },

  // Spending related functions
  async getMonthlySpend(householdId, year, month) {
    console.log('Mock: getMonthlySpend called with:', { householdId, year, month });
    // Return mock spending data
    return [
      { category: 'Groceries', amount: 450.50 },
      { category: 'Dining Out', amount: 280.75 },
      { category: 'Transportation', amount: 120.00 }
    ];
  },

  async getBudgetProgress(householdId, year, month) {
    console.log('Mock: getBudgetProgress called with:', { householdId, year, month });
    // Return mock budget progress data
    return [
      {
        category_id: '1',
        category_name: 'Groceries',
        budget_amount: 600.00,
        spent: 450.50,
        color: '#34C759'
      },
      {
        category_id: '2',
        category_name: 'Dining Out',
        budget_amount: 300.00,
        spent: 280.75,
        color: '#FF9500'
      },
      {
        category_id: '3',
        category_name: 'Transportation',
        budget_amount: 200.00,
        spent: 120.00,
        color: '#007AFF'
      }
    ];
  },

  async getRecentTransactions(householdId, limit = 10) {
    console.log('Mock: getRecentTransactions called with:', { householdId, limit });
    // Return mock transaction data
    const mockTransactions = [
      {
        id: '1',
        merchant: 'Whole Foods',
        amount: 75.50,
        direction: 'outflow',
        occurred_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Weekly groceries',
        category: { name: 'Groceries', color: '#34C759' },
        account: { name: 'Main Checking' }
      },
      {
        id: '2',
        merchant: 'Starbucks',
        amount: 12.50,
        direction: 'outflow',
        occurred_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Morning coffee',
        category: { name: 'Dining Out', color: '#FF9500' },
        account: { name: 'Main Checking' }
      },
      {
        id: '3',
        merchant: 'Shell Gas Station',
        amount: 45.00,
        direction: 'outflow',
        occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Gas fill-up',
        category: { name: 'Transportation', color: '#007AFF' },
        account: { name: 'Main Checking' }
      },
      {
        id: '4',
        merchant: 'Netflix',
        amount: 15.99,
        direction: 'outflow',
        occurred_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Monthly subscription',
        category: { name: 'Entertainment', color: '#AF52DE' },
        account: { name: 'Main Checking' }
      }
    ];
    
    return mockTransactions.slice(0, limit);
  },

  async getUpcomingBills(householdId, limit = 5) {
    console.log('Mock: getUpcomingBills called with:', { householdId, limit });
    // Return mock upcoming bills
    const mockBills = [
      {
        id: '1',
        name: 'Netflix Subscription',
        amount: 15.99,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        name: 'Electric Bill',
        amount: 125.50,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return mockBills.slice(0, limit);
  },

  // Category related functions
  async getCategories(householdId) {
    console.log('Mock: getCategories called with householdId:', householdId);
    // Return mock categories
    return [
      { id: '1', name: 'Groceries', icon: 'shopping_cart', color: '#34C759' },
      { id: '2', name: 'Dining Out', icon: 'restaurant', color: '#FF9500' },
      { id: '3', name: 'Transportation', icon: 'directions_car', color: '#007AFF' },
      { id: '4', name: 'Entertainment', icon: 'movie', color: '#AF52DE' },
      { id: '5', name: 'Utilities', icon: 'lightbulb', color: '#FF453A' },
      { id: '6', name: 'Shopping', icon: 'shopping_bag', color: '#FF2D92' }
    ];
  },

  async insertCategory(categoryData) {
    console.log('Mock: insertCategory called with:', categoryData);
    // Return mock new category
    return {
      id: Date.now().toString(),
      ...categoryData,
      created_at: new Date().toISOString()
    };
  },

  // Transaction related functions
  async insertTransaction(transactionData) {
    console.log('Mock: insertTransaction called with:', transactionData);
    // Return mock success
    return {
      id: Date.now().toString(),
      ...transactionData,
      created_at: new Date().toISOString(),
      success: true
    };
  },

  // Profile related functions
  async createProfile(userData) {
    try {
      console.log('Mock: createProfile called with:', userData);
      // In a real implementation, this would create a user profile
      return { 
        data: { 
          id: Date.now().toString(), 
          ...userData, 
          created_at: new Date().toISOString() 
        }, 
        error: null 
      };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async getProfile(userId) {
    try {
      console.log('Mock: getProfile called with userId:', userId);
      // Return mock profile data
      return { 
        data: {
          id: userId,
          email: 'user@example.com',
          budget: 2500.00,
          partner_email: null,
          created_at: new Date().toISOString()
        }, 
        error: null 
      };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async updateProfile(userId, updates) {
    try {
      console.log('Mock: updateProfile called with:', { userId, updates });
      // Return mock updated profile
      return { 
        data: {
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    } catch (err) {
      return { data: null, error: err };
    }
  }
}
console.log('Supabase Config Check:', {
  url: supabaseUrl ? 'Loaded' : 'Missing',
  key: supabaseAnonKey ? 'Loaded' : 'Missing',
  urlValue: supabaseUrl // Remove this line after testing
})


// Default export for convenience
export default supabase