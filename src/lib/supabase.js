// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for database operations
export const dbHelpers = {
  // Parse numeric values from Supabase (they come as strings)
  parseNumeric: (value) => {
    if (value === null || value === undefined) return 0
    return parseFloat(value) || 0
  },

  // Get user's household ID
  getUserHouseholdId: async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_household_id')
      if (error) {
        console.log('RPC error, trying fallback method:', error)
        // Fallback: query directly
        const { data: memberData, error: memberError } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single()
        
        if (memberError) throw memberError
        return memberData?.household_id
      }
      return data
    } catch (error) {
      console.error('Error getting household ID:', error)
      throw error
    }
  },

  // Manual user setup (when trigger fails)
  setupNewUser: async (user) => {
    try {
      console.log('Setting up new user manually:', user.id, user.email);

      // Check if user already has household
      const { data: existingMember } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        console.log('User already has household:', existingMember.household_id);
        return existingMember.household_id;
      }

      // 1. Ensure profile exists
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          user_id: user.id,
          display_name: userName,
          avatar_url: null
        }], { onConflict: 'user_id' });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway, profile might already exist
      }

      // 2. Create household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert([{
          name: userName + "'s Household",
          created_by: user.id,
          kind: 'solo',
          currency: 'USD'
        }])
        .select()
        .single();

      if (householdError) {
        console.error('Household creation error:', householdError);
        throw householdError;
      }

      console.log('Household created:', household.id);

      // 3. Add user as household owner
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: household.id,
          user_id: user.id,
          role: 'owner'
        }]);

      if (memberError) {
        console.error('Household member creation error:', memberError);
        throw memberError;
      }

      // 4. Create default categories
      const defaultCategories = [
        { name: 'Groceries', color: '#10B981' },
        { name: 'Dining Out', color: '#F59E0B' },
        { name: 'Transportation', color: '#3B82F6' },
        { name: 'Utilities', color: '#EF4444' },
        { name: 'Entertainment', color: '#8B5CF6' },
        { name: 'Shopping', color: '#F97316' },
        { name: 'Healthcare', color: '#06B6D4' },
        { name: 'Rent/Mortgage', color: '#84CC16' }
      ];

      const { error: categoriesError } = await supabase
        .from('categories')
        .insert(
          defaultCategories.map(cat => ({
            household_id: household.id,
            name: cat.name,
            color: cat.color,
            kind: 'expense'
          }))
        );

      if (categoriesError) {
        console.error('Categories creation error:', categoriesError);
        // Don't throw, categories are nice-to-have
      }

      // 5. Create default checking account
      const { error: accountError } = await supabase
        .from('accounts')
        .insert([{
          household_id: household.id,
          name: 'Main Checking',
          type: 'checking',
          starting_balance: 0,
          current_balance: 0,
          is_active: true
        }]);

      if (accountError) {
        console.error('Account creation error:', accountError);
        // Don't throw, account is nice-to-have
      }

      console.log('User setup completed successfully');
      return household.id;
    } catch (error) {
      console.error('Error in setupNewUser:', error);
      throw error;
    }
  },

  // Accounts
  getAccounts: async (householdId) => {
    const { data, error } = await supabase
      .from('v_account_balances')
      .select('*')
      .eq('household_id', householdId)
    
    if (error) throw error
    
    return data?.map(account => ({
      ...account,
      starting_balance: dbHelpers.parseNumeric(account.starting_balance),
      current_balance: dbHelpers.parseNumeric(account.current_balance),
      net_change: dbHelpers.parseNumeric(account.net_change)
    })) || []
  },

  // Categories
  getCategories: async (householdId) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('household_id', householdId)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Monthly spend by category
  getMonthlySpend: async (householdId, year, month) => {
    const { data, error } = await supabase
      .from('v_monthly_spend_by_category')
      .select('*')
      .eq('household_id', householdId)
      .eq('period_year', year)
      .eq('period_month', month)
    
    if (error) throw error
    
    return data?.map(item => ({
      ...item,
      total_outflow: dbHelpers.parseNumeric(item.total_outflow),
      total_inflow: dbHelpers.parseNumeric(item.total_inflow),
      transaction_count: parseInt(item.transaction_count) || 0
    })) || []
  },

  // Budget progress
  getBudgetProgress: async (householdId, year, month) => {
    const { data, error } = await supabase
      .from('v_budget_progress')
      .select('*')
      .eq('household_id', householdId)
      .eq('period_year', year)
      .eq('period_month', month)
    
    if (error) throw error
    
    return data?.map(item => ({
      ...item,
      budget_amount: dbHelpers.parseNumeric(item.budget_amount),
      spent: dbHelpers.parseNumeric(item.spent),
      remaining: dbHelpers.parseNumeric(item.remaining),
      pct_used: dbHelpers.parseNumeric(item.pct_used)
    })) || []
  },

  // Recent transactions
  getRecentTransactions: async (householdId, limit = 10) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(name, color),
        account:accounts(name)
      `)
      .eq('household_id', householdId)
      .order('occurred_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return data?.map(transaction => ({
      ...transaction,
      amount: dbHelpers.parseNumeric(transaction.amount)
    })) || []
  },

  // Upcoming bills
  getUpcomingBills: async (householdId, limit = 5) => {
    const { data, error } = await supabase
      .from('upcoming_bills')
      .select(`
        *,
        category:categories(name, color),
        account:accounts(name)
      `)
      .eq('household_id', householdId)
      .eq('status', 'scheduled')
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date')
      .limit(limit)
    
    if (error) throw error
    
    return data?.map(bill => ({
      ...bill,
      amount: dbHelpers.parseNumeric(bill.amount)
    })) || []
  },

  // Insert new transaction
  insertTransaction: async (transaction) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Insert new account
  insertAccount: async (account) => {
    const { data, error } = await supabase
      .from('accounts')
      .insert([account])
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Insert new category
  insertCategory: async (category) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Insert/update budget
  upsertBudget: async (budget) => {
    const { data, error } = await supabase
      .from('budgets')
      .upsert([budget])
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // Insert new bill
  insertBill: async (bill) => {
    const { data, error } = await supabase
      .from('upcoming_bills')
      .insert([bill])
      .select()
    
    if (error) throw error
    return data?.[0]
  }
}