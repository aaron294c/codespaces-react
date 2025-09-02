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
        user_id,
        auth.users!inner(email)
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

  // Accounts
  async getAccounts(householdId) {
    const { data, error } = await supabase
      .from('v_accounts_with_stats')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at');

    if (error) throw error;
    return data || [];
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
    const { data, error } = await supabase
      .from('v_budget_progress')
      .select(`
        *,
        categories!inner(name, color, icon)
      `)
      .eq('household_id', householdId)
      .eq('period_year', year)
      .eq('period_month', month);

    if (error) throw error;
    return data || [];
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
    // Ensure occurred_at has a time component (noon if not specified)
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
    const { data, error } = await supabase
      .from('v_recent_transactions')
      .select('*')
      .eq('household_id', householdId)
      .order('occurred_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getTransactionsByDateRange(householdId, startDate, endDate) {
    const { data, error } = await supabase
      .from('v_recent_transactions')
      .select('*')
      .eq('household_id', householdId)
      .gte('occurred_at', startDate)
      .lte('occurred_at', endDate)
      .order('occurred_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Monthly spending analysis
  async getMonthlySpend(householdId, year, month) {
    const { data, error } = await supabase
      .from('v_monthly_spend')
      .select(`
        *,
        categories!inner(name, color, icon)
      `)
      .eq('household_id', householdId)
      .eq('year', year)
      .eq('month', month)
      .order('outflow', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getDailySpendForMonth(householdId, year, month) {
    // Get start and end of month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

    const { data, error } = await supabase
      .from('transactions')
      .select('occurred_at, amount, direction')
      .eq('household_id', householdId)
      .eq('direction', 'outflow')
      .gte('occurred_at', startDate)
      .lte('occurred_at', endDate)
      .order('occurred_at');

    if (error) throw error;

    // Group by day
    const dailyTotals = {};
    (data || []).forEach(txn => {
      const day = txn.occurred_at.split('T')[0];
      dailyTotals[day] = (dailyTotals[day] || 0) + parseFloat(txn.amount);
    });

    return dailyTotals;
  },

  async getTopMerchants(householdId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('transactions')
      .select('merchant, amount')
      .eq('household_id', householdId)
      .eq('direction', 'outflow')
      .gte('occurred_at', startDate)
      .lte('occurred_at', endDate)
      .not('merchant', 'is', null)
      .order('amount', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Group by merchant
    const merchantTotals = {};
    (data || []).forEach(txn => {
      const merchant = txn.merchant;
      merchantTotals[merchant] = (merchantTotals[merchant] || 0) + parseFloat(txn.amount);
    });

    return Object.entries(merchantTotals)
      .map(([merchant, total]) => ({ merchant, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  },

  // Bills
  async getUpcomingBills(householdId, limit = 5) {
    const { data, error } = await supabase
      .from('recurring_bills')
      .select('*')
      .eq('household_id', householdId)
      .eq('active', true)
      .not('next_due_date', 'is', null)
      .order('next_due_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
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
    const { data, error } = await supabase
      .from('budgets')
      .select('amount')
      .eq('household_id', householdId)
      .eq('period_year', year)
      .eq('period_month', month);

    if (error) throw error;

    return (data || []).reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
  },

  async getTotalSpentForMonth(householdId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('household_id', householdId)
      .eq('direction', 'outflow')
      .gte('occurred_at', startDate)
      .lte('occurred_at', endDate);

    if (error) throw error;

    return (data || []).reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
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