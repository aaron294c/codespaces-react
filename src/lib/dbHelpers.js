// src/lib/dbHelpers.js - Corrected for your table structure
import { supabase } from './supabase';

export const dbHelpers = {
  // Household operations
  async createHousehold(name) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('households')
      .insert({ name, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async joinHousehold(householdId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('household_members')
      .insert({ 
        household_id: householdId, 
        user_id: user.id, 
        role: 'member' 
      });

    if (error) throw error;
    return true;
  },

  async getHouseholdMembers(householdId) {
    const { data, error } = await supabase
      .from('household_members')
      .select(`
        id,
        role,
        created_at,
        user_id
      `)
      .eq('household_id', householdId);

    if (error) throw error;
    return data || [];
  },

  // Categories
  async getCategories(householdId) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('household_id', householdId)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async insertCategory(payload) {
    const { data, error } = await supabase
      .from('categories')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createDefaultCategories(householdId) {
    const defaultCategories = [
      { household_id: householdId, name: 'Groceries', color: '#34C759', kind: 'expense', icon: 'shopping_bag' },
      { household_id: householdId, name: 'Dining Out', color: '#FF9500', kind: 'expense', icon: 'restaurant' },
      { household_id: householdId, name: 'Transportation', color: '#007AFF', kind: 'expense', icon: 'directions_car' },
      { household_id: householdId, name: 'Utilities', color: '#FF453A', kind: 'expense', icon: 'lightbulb' },
      { household_id: householdId, name: 'Entertainment', color: '#AF52DE', kind: 'expense', icon: 'movie' },
      { household_id: householdId, name: 'Shopping', color: '#FF2D92', kind: 'expense', icon: 'shopping_bag' },
      { household_id: householdId, name: 'Healthcare', color: '#30D158', kind: 'expense', icon: 'local_hospital' },
      { household_id: householdId, name: 'Income', color: '#32D74B', kind: 'income', icon: 'account_balance_wallet' }
    ];

    const { data, error } = await supabase
      .from('categories')
      .insert(defaultCategories)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Accounts - Updated to work with your table structure
  async getAccounts(householdId) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at');

    if (error) throw error;
    
    // Map to ensure consistent field names
    return (data || []).map(account => ({
      ...account,
      account_id: account.id, // Add this mapping for compatibility
    }));
  },

  async insertAccount(payload) {
    const { data, error } = await supabase
      .from('accounts')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createDefaultAccount(householdId) {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        household_id: householdId,
        account_name: 'Primary Checking',
        account_type: 'checking',
        currency: 'USD',
        current_balance: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Budgets
  async getBudgetProgress(householdId, year, month) {
    try {
      // Get budgets with categories
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          *,
          categories!inner(name, color, icon)
        `)
        .eq('household_id', householdId)
        .eq('period_year', year)
        .eq('period_month', month);

      if (budgetError) throw budgetError;

      if (!budgets || budgets.length === 0) {
        return [];
      }

      // Calculate spent amounts for each budget
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const budgetProgress = await Promise.all(
        budgets.map(async (budget) => {
          const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('household_id', householdId)
            .eq('category_id', budget.category_id)
            .eq('direction', 'outflow')
            .gte('occurred_at', startDate)
            .lte('occurred_at', endDate);

          if (txError) {
            console.error('Error fetching transactions for budget:', txError);
            return { ...budget, spent: '0' };
          }

          const spent = (transactions || []).reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
          return { 
            ...budget, 
            budget_id: budget.id,
            budget_amount: budget.amount,
            spent: spent.toString() 
          };
        })
      );

      return budgetProgress;
    } catch (error) {
      console.error('Error fetching budget progress:', error);
      return [];
    }
  },

  async upsertBudget(householdId, categoryId, year, month, amount) {
    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        household_id: householdId,
        category_id: categoryId,
        period_year: year,
        period_month: month,
        amount: parseFloat(amount)
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Transactions
  async insertTransaction(payload) {
    // Ensure occurred_at has a time component
    if (payload.occurred_at && !payload.occurred_at.includes('T')) {
      payload.occurred_at = `${payload.occurred_at}T12:00:00`;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const transactionData = {
      ...payload,
      created_by: user.id,
      amount: parseFloat(payload.amount)
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRecentTransactions(householdId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories(name, color, icon),
          accounts(account_name)
        `)
        .eq('household_id', householdId)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Map to expected format
      return (data || []).map(tx => ({
        ...tx,
        category_name: tx.categories?.name,
        account_name: tx.accounts?.account_name
      }));
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  },

  async getTransactionsByDateRange(householdId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories(name, color, icon),
          accounts(account_name)
        `)
        .eq('household_id', householdId)
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)
        .order('occurred_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(tx => ({
        ...tx,
        category_name: tx.categories?.name,
        account_name: tx.accounts?.account_name
      }));
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      return [];
    }
  },

  // Monthly spending analysis
  async getMonthlySpend(householdId, year, month) {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          category_id,
          amount,
          categories(name, color, icon)
        `)
        .eq('household_id', householdId)
        .eq('direction', 'outflow')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate);

      if (error) throw error;

      // Group by category
      const grouped = {};
      (transactions || []).forEach(tx => {
        const catId = tx.category_id;
        if (!grouped[catId]) {
          grouped[catId] = {
            category_id: catId,
            outflow: 0,
            categories: tx.categories
          };
        }
        grouped[catId].outflow += parseFloat(tx.amount);
      });

      return Object.values(grouped).sort((a, b) => b.outflow - a.outflow);
    } catch (error) {
      console.error('Error fetching monthly spend:', error);
      return [];
    }
  },

  async getDailySpendForMonth(householdId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('occurred_at, amount, direction')
        .eq('household_id', householdId)
        .eq('direction', 'outflow')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)
        .order('occurred_at');

      if (error) throw error;

      const dailyTotals = {};
      (data || []).forEach(txn => {
        const day = txn.occurred_at.split('T')[0];
        dailyTotals[day] = (dailyTotals[day] || 0) + parseFloat(txn.amount);
      });

      return dailyTotals;
    } catch (error) {
      console.error('Error fetching daily spend:', error);
      return {};
    }
  },

  async getTopMerchants(householdId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('merchant, amount')
        .eq('household_id', householdId)
        .eq('direction', 'outflow')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate)
        .not('merchant', 'is', null)
        .order('amount', { ascending: false })
        .limit(20);

      if (error) throw error;

      const merchantTotals = {};
      (data || []).forEach(txn => {
        const merchant = txn.merchant;
        merchantTotals[merchant] = (merchantTotals[merchant] || 0) + parseFloat(txn.amount);
      });

      return Object.entries(merchantTotals)
        .map(([merchant, total]) => ({ merchant, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching top merchants:', error);
      return [];
    }
  },

  // Bills - Safe handling with your new table
  async getUpcomingBills(householdId, limit = 5) {
    try {
      const { data, error } = await supabase
        .from('recurring_bills')
        .select('*')
        .eq('household_id', householdId)
        .eq('active', true)
        .not('next_due_date', 'is', null)
        .order('next_due_date', { ascending: true })
        .limit(limit);

      if (error) {
        // If table doesn't exist or has issues, return empty array
        console.log('Bills table not accessible:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming bills:', error);
      return [];
    }
  },

  async insertBill(payload) {
    const { data, error } = await supabase
      .from('recurring_bills')
      .insert({
        ...payload,
        amount: parseFloat(payload.amount)
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Utility functions
  async getTotalBudgetForMonth(householdId, year, month) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('amount')
        .eq('household_id', householdId)
        .eq('period_year', year)
        .eq('period_month', month);

      if (error) throw error;
      return (data || []).reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    } catch (error) {
      console.error('Error fetching total budget:', error);
      return 0;
    }
  },

  async getTotalSpentForMonth(householdId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('household_id', householdId)
        .eq('direction', 'outflow')
        .gte('occurred_at', startDate)
        .lte('occurred_at', endDate);

      if (error) throw error;
      return (data || []).reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
    } catch (error) {
      console.error('Error fetching total spent:', error);
      return 0;
    }
  },

  // Database health check
  async checkDatabaseHealth() {
    const requiredTables = ['households', 'household_members', 'accounts', 'categories', 'transactions', 'budgets'];
    const optionalTables = ['recurring_bills'];
    
    const results = {
      healthy: true,
      requiredTables: {},
      optionalTables: {},
      errors: []
    };

    // Check required tables
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        results.requiredTables[table] = !error;
        if (error) {
          results.healthy = false;
          results.errors.push(`Required table '${table}' error: ${error.message}`);
        }
      } catch (error) {
        results.requiredTables[table] = false;
        results.healthy = false;
        results.errors.push(`Error checking table '${table}': ${error.message}`);
      }
    }

    // Check optional tables
    for (const table of optionalTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        results.optionalTables[table] = !error;
      } catch (error) {
        results.optionalTables[table] = false;
      }
    }

    return results;
  }
};

// Helper function to format money values
export const formatMoney = (amount, currency = 'USD') => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(numAmount);
};