// src/pages/Insights.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from "../context/AuthContext";
import { dbHelpers } from "../lib/supabase";

const LoadingSkeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const EmptyState = ({ icon, title, description }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <span className="material-symbols-outlined text-gray-400 text-2xl">{icon}</span>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);

export default function Insights() {
  const { user, householdId } = useAuth();
  const [data, setData] = useState({
    currentMonth: [],
    previousMonth: [],
    budgetProgress: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('household'); // 'household' or 'personal'
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  useEffect(() => {
    const fetchInsightsData = async () => {
      if (!householdId) return;

      try {
        setLoading(true);
        setError(null);

        const { year, month } = selectedMonth;
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;

        const [currentMonth, previousMonth, budgetProgress] = await Promise.all([
          dbHelpers.getMonthlySpend(householdId, year, month),
          dbHelpers.getMonthlySpend(householdId, prevYear, prevMonth),
          dbHelpers.getBudgetProgress(householdId, year, month)
        ]);

        setData({
          currentMonth,
          previousMonth,
          budgetProgress
        });
      } catch (err) {
        console.error('Error fetching insights data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsightsData();
  }, [householdId, selectedMonth]);

  // Process data for visualization
  const chartData = useMemo(() => {
    const currentData = viewMode === 'household' ? data.currentMonth : data.currentMonth;
    const totalSpent = currentData.reduce((sum, item) => sum + item.total_outflow, 0);
    const totalBudget = data.budgetProgress.reduce((sum, item) => sum + item.budget_amount, 0);

    // Create chart segments
    const segments = currentData
      .filter(item => item.total_outflow > 0)
      .sort((a, b) => b.total_outflow - a.total_outflow)
      .map((item, index) => {
        const percentage = totalSpent > 0 ? (item.total_outflow / totalSpent) * 100 : 0;
        return {
          ...item,
          percentage,
          color: item.category_color || `hsl(${index * 45}, 65%, 50%)`,
          strokeDasharray: `${percentage} ${100 - percentage}`,
          strokeDashoffset: -currentData
            .slice(0, index)
            .reduce((sum, prev) => sum + (prev.total_outflow / totalSpent * 100), 0)
        };
      });

    return { segments, totalSpent, totalBudget };
  }, [data, viewMode]);

  // Calculate insights
  const insights = useMemo(() => {
    const { segments, totalSpent } = chartData;
    const prevTotalSpent = data.previousMonth.reduce((sum, item) => sum + item.total_outflow, 0);
    
    const monthOverMonthChange = prevTotalSpent > 0 
      ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100 
      : 0;

    const topCategory = segments[0];
    const overBudgetCategories = data.budgetProgress.filter(item => item.pct_used > 100);
    
    return {
      monthOverMonthChange,
      topCategory,
      overBudgetCategories,
      totalSpent,
      prevTotalSpent
    };
  }, [chartData, data]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleMonthChange = (direction) => {
    setSelectedMonth(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;
      
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      
      return { year: newYear, month: newMonth };
    });
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="p-4">
          {/* Header skeleton */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md pb-4 mb-6">
            <LoadingSkeleton className="h-8 w-24 mx-auto mb-4" />
            <LoadingSkeleton className="h-11 w-full rounded-xl" />
          </div>

          {/* Chart skeleton */}
          <LoadingSkeleton className="h-80 w-full rounded-2xl mb-6" />
          
          {/* Insights skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <LoadingSkeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Insights
          </h1>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => handleMonthChange(-1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {monthNames[selectedMonth.month - 1]} {selectedMonth.year}
            </h2>
            <button 
              onClick={() => handleMonthChange(1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              disabled={selectedMonth.year === new Date().getFullYear() && selectedMonth.month === new Date().getMonth() + 1}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('personal')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === 'personal' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              You
            </button>
            <button
              onClick={() => setViewMode('household')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === 'household' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Household
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 pb-24 space-y-6">
        {/* Category Breakdown */}
        {chartData.segments.length === 0 ? (
          <EmptyState
            icon="bar_chart"
            title="No Spending Data"
            description="Add some expenses to see your spending breakdown"
          />
        ) : (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Category Breakdown</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Donut Chart */}
              <div className="relative h-56 flex items-center justify-center mb-6">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    className="text-gray-100" 
                    cx="50" cy="50" r="40" 
                    fill="none" 
                    strokeWidth="10" 
                    stroke="currentColor"
                  />
                  {chartData.segments.map((segment, index) => (
                    <circle
                      key={segment.category_id}
                      className="transition-all duration-500 hover:opacity-80"
                      cx="50" cy="50" r="40" 
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="10"
                      strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                      strokeDashoffset={segment.strokeDashoffset}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  ))}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-gray-900">
                    ${chartData.totalSpent.toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-500">This Month</p>
                  {insights.monthOverMonthChange !== 0 && (
                    <div className={`flex items-center gap-1 text-sm font-medium mt-1 ${
                      insights.monthOverMonthChange > 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      <span className="material-symbols-outlined text-base">
                        {insights.monthOverMonthChange > 0 ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                      <span>{Math.abs(insights.monthOverMonthChange).toFixed(1)}% vs last month</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category List */}
              <div className="space-y-4">
                {chartData.segments.slice(0, 5).map((segment) => {
                  const budgetItem = data.budgetProgress.find(b => b.category_id === segment.category_id);
                  const isOverBudget = budgetItem && budgetItem.pct_used > 100;
                  
                  return (
                    <div key={segment.category_id} className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: segment.color }}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {getCategoryIcon(segment.category_name)}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-gray-900">{segment.category_name}</p>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${
                              isOverBudget ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {segment.percentage.toFixed(0)}%
                            </p>
                            {isOverBudget && (
                              <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                            )}
                            <p className="font-bold text-gray-900">
                              ${segment.total_outflow.toFixed(0)}
                            </p>
                          </div>
                        </div>

                        {budgetItem && (
                          <>
                            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  budgetItem.pct_used > 100 ? 'bg-red-500' : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: `${Math.min(budgetItem.pct_used, 100)}%`,
                                  backgroundColor: segment.color
                                }}
                              />
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500">
                                ${segment.total_outflow.toFixed(0)} / ${budgetItem.budget_amount.toFixed(0)}
                                {isOverBudget && ` (Over by $${(segment.total_outflow - budgetItem.budget_amount).toFixed(0)})`}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Quick Insights */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Insights</h2>
          
          <div className="space-y-4">
            {/* Spending Velocity */}
            {insights.monthOverMonthChange !== 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    insights.monthOverMonthChange > 0 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
                  }`}>
                    <span className="material-symbols-outlined">
                      {insights.monthOverMonthChange > 0 ? 'trending_up' : 'trending_down'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Spending Trend</p>
                    <p className="text-sm text-gray-600">
                      You're spending {Math.abs(insights.monthOverMonthChange).toFixed(1)}% 
                      {insights.monthOverMonthChange > 0 ? ' more' : ' less'} than last month.
                      {insights.topCategory && insights.monthOverMonthChange > 0 && (
                        ` Most of the increase is in ${insights.topCategory.category_name}.`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Budget Alerts */}
            {insights.overBudgetCategories.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Budget Alert</p>
                    <p className="text-sm text-red-700">
                      {insights.overBudgetCategories.length === 1 
                        ? `You're over budget in ${insights.overBudgetCategories[0].category_name}.`
                        : `You're over budget in ${insights.overBudgetCategories.length} categories.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Positive Insight */}
            {insights.overBudgetCategories.length === 0 && chartData.totalBudget > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Great Job!</p>
                    <p className="text-sm text-green-700">
                      You're staying within your budget this month. 
                      You have ${(chartData.totalBudget - chartData.totalSpent).toFixed(0)} remaining.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// Helper function for category icons
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