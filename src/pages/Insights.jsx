import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dbHelpers, formatMoney } from "../lib/dbHelpers";
import { supabase } from "../lib/supabase";
import toast from 'react-hot-toast';

export default function Insights() {
  const { householdId } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const [data, setData] = useState({
    monthlySpend: [],
    budgetProgress: [],
    dailySpend: {},
    topMerchants: [],
    totalSpent: 0,
    totalBudget: 0
  });

  const loadInsightsData = async () => {
    if (!householdId) return;

    try {
      setLoading(true);

      const [
        monthlySpend,
        budgetProgress,
        dailySpend,
        topMerchants,
        totalSpent,
        totalBudget
      ] = await Promise.all([
        dbHelpers.getMonthlySpend(householdId, selectedMonth.year, selectedMonth.month),
        dbHelpers.getBudgetProgress(householdId, selectedMonth.year, selectedMonth.month),
        dbHelpers.getDailySpendForMonth(householdId, selectedMonth.year, selectedMonth.month),
        dbHelpers.getTopMerchants(householdId, selectedMonth.year, selectedMonth.month),
        dbHelpers.getTotalSpentForMonth(householdId, selectedMonth.year, selectedMonth.month),
        dbHelpers.getTotalBudgetForMonth(householdId, selectedMonth.year, selectedMonth.month)
      ]);

      setData({
        monthlySpend,
        budgetProgress,
        dailySpend,
        topMerchants,
        totalSpent,
        totalBudget
      });
    } catch (error) {
      console.error('Error loading insights data:', error);
      toast.error('Failed to load insights data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when month changes
  useEffect(() => {
    loadInsightsData();
  }, [householdId, selectedMonth]);

  // Realtime updates
  useEffect(() => {
    if (!householdId) return;

    const channel = supabase
      .channel('insights-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions', 
          filter: `household_id=eq.${householdId}` 
        }, 
        () => {
          console.log('Transaction change detected, reloading insights...');
          loadInsightsData();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'budgets', 
          filter: `household_id=eq.${householdId}` 
        }, 
        () => {
          console.log('Budget change detected, reloading insights...');
          loadInsightsData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId]);

  const handleMonthChange = (direction) => {
    setSelectedMonth(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
  };

  // Calculate spending velocity
  const currentDate = new Date();
  const isCurrentMonth = selectedMonth.year === currentDate.getFullYear() && 
                        selectedMonth.month === currentDate.getMonth() + 1;
  
  const daysInMonth = new Date(selectedMonth.year, selectedMonth.month, 0).getDate();
  const daysPassed = isCurrentMonth ? currentDate.getDate() : daysInMonth;
  const dailyAverage = daysPassed > 0 ? data.totalSpent / daysPassed : 0;
  const projectedSpend = dailyAverage * daysInMonth;

  // Generate chart data for daily spending
  const chartDays = Array.from({ length: Math.min(daysInMonth, 30) }, (_, i) => {
    const day = i + 1;
    const dateStr = `${selectedMonth.year}-${String(selectedMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      day,
      amount: data.dailySpend[dateStr] || 0
    };
  });

  const monthName = new Date(selectedMonth.year, selectedMonth.month - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Insights</h1>
            <div className="w-10"></div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h2 className="text-lg font-medium text-gray-900 min-w-0">
              {monthName}
            </h2>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Spent</h3>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(data.totalSpent)}</p>
            {data.totalBudget > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((data.totalSpent / data.totalBudget) * 100)}% of budget
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Daily Average</h3>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(dailyAverage)}</p>
            {isCurrentMonth && (
              <p className="text-xs text-gray-500 mt-1">
                Projected: {formatMoney(projectedSpend)}
              </p>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
          </div>

          {data.monthlySpend.length > 0 ? (
            <div className="p-4">
              {/* Category Pie Chart Visual */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    className="text-gray-200"
                    cx="18" cy="18" r="15.915"
                    fill="none" stroke="currentColor" strokeWidth="3"
                  />
                  {data.monthlySpend.map((category, index) => {
                    const percentage = data.totalSpent > 0 ? 
                      (parseFloat(category.outflow) / data.totalSpent) * 100 : 0;
                    const strokeDasharray = `${percentage} ${100 - percentage}`;
                    const colors = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF453A', '#FF2D92'];
                    
                    return (
                      <circle
                        key={category.category_id}
                        cx="18" cy="18" r="15.915"
                        fill="none"
                        stroke={colors[index % colors.length]}
                        strokeWidth="3"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={-data.monthlySpend.slice(0, index)
                          .reduce((acc, cat) => acc + ((parseFloat(cat.outflow) / data.totalSpent) * 100), 0)}
                        className="transition-all duration-1000"
                      />
                    );
                  })}
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{formatMoney(data.totalSpent)}</span>
                  <span className="text-sm text-gray-500">Total Spent</span>
                </div>
              </div>

              {/* Category List */}
              <div className="space-y-3">
                {data.monthlySpend.map((category, index) => {
                  const percentage = data.totalSpent > 0 ? 
                    (parseFloat(category.outflow) / data.totalSpent) * 100 : 0;
                  const colors = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF453A', '#FF2D92'];
                  
                  return (
                    <div key={category.category_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="font-medium text-gray-900">
                          {category.categories?.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          {formatMoney(category.outflow)}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2 block">pie_chart</span>
              <p>No spending data for this month</p>
            </div>
          )}
        </div>

        {/* Budget vs Actual */}
        {data.budgetProgress.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
            </div>
            <div className="p-4 space-y-4">
              {data.budgetProgress.map((budget) => {
                const percentage = budget.budget_amount > 0 ? 
                  (parseFloat(budget.spent) / parseFloat(budget.budget_amount)) * 100 : 0;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={budget.budget_id}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: budget.categories?.color || '#6B7280' }}
                        ></div>
                        <span className="font-medium text-gray-900">
                          {budget.categories?.name || 'Unknown Category'}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        isOverBudget ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatMoney(budget.spent)} / {formatMoney(budget.budget_amount)}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isOverBudget ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1 text-xs">
                      <span className={isOverBudget ? 'text-red-600' : 'text-green-600'}>
                        {Math.round(percentage)}% used
                      </span>
                      {isOverBudget && (
                        <span className="text-red-600">
                          Over by {formatMoney(parseFloat(budget.spent) - parseFloat(budget.budget_amount))}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily Spending Chart */}
        {chartDays.some(day => day.amount > 0) && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Daily Spending</h3>
            </div>
            <div className="p-4">
              <div className="flex items-end justify-between h-32 gap-1">
                {chartDays.map((day) => {
                  const maxAmount = Math.max(...chartDays.map(d => d.amount));
                  const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={day.day} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all duration-500 min-h-[2px]"
                        style={{ height: `${height}%` }}
                        title={`Day ${day.day}: ${formatMoney(day.amount)}`}
                      ></div>
                      {day.day % 5 === 0 && (
                        <span className="text-xs text-gray-500 mt-1">{day.day}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-4 text-sm text-gray-600">
                Average: {formatMoney(dailyAverage)} per day
              </div>
            </div>
          </div>
        )}

        {/* Top Merchants */}
        {data.topMerchants.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Top Merchants</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {data.topMerchants.map((merchant, index) => (
                <div key={merchant.merchant} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{merchant.merchant}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatMoney(merchant.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights & Tips */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Spending velocity insight */}
            {isCurrentMonth && projectedSpend > data.totalBudget && data.totalBudget > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <span className="material-symbols-outlined text-red-500 mt-0.5">warning</span>
                <div>
                  <p className="font-medium text-red-900">Budget Alert</p>
                  <p className="text-sm text-red-700">
                    At your current spending rate, you're projected to exceed your budget by{' '}
                    {formatMoney(projectedSpend - data.totalBudget)} this month.
                  </p>
                </div>
              </div>
            )}

            {/* Positive insight */}
            {isCurrentMonth && projectedSpend < data.totalBudget && data.totalBudget > 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="material-symbols-outlined text-green-500 mt-0.5">check_circle</span>
                <div>
                  <p className="font-medium text-green-900">Great Job!</p>
                  <p className="text-sm text-green-700">
                    You're on track to stay {formatMoney(data.totalBudget - projectedSpend)} under budget this month.
                  </p>
                </div>
              </div>
            )}

            {/* General tip */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="material-symbols-outlined text-blue-500 mt-0.5">lightbulb</span>
              <div>
                <p className="font-medium text-blue-900">Tip</p>
                <p className="text-sm text-blue-700">
                  Review your largest expense categories weekly to identify potential savings opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center p-2 text-blue-600">
            <span className="material-symbols-outlined text-2xl">bar_chart</span>
            <span className="text-xs">Insights</span>
          </button>
          <button 
            onClick={() => navigate('/expense/new')}
            className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center -mt-2"
          >
            <span className="material-symbols-outlined text-white text-2xl">add</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <span className="material-symbols-outlined text-2xl">credit_card</span>
            <span className="text-xs">Accounts</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <span className="material-symbols-outlined text-2xl">settings</span>
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>

      {/* Bottom padding for fixed nav */}
      <div className="h-20"></div>
    </div>
  );
}