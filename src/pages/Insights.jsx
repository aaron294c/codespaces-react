// Simple Insights page that works without complex auth
// Replace your src/pages/Insights.jsx with this:

import React from "react";
import { useNavigate } from "react-router-dom";
import { formatMoney } from "../lib/dbHelpers";

export default function Insights() {
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockData = {
    totalSpent: 250.00,
    totalBudget: 2000.00,
    dailyAverage: 8.33,
    projectedSpend: 250.00,
    monthlySpend: [
      { category_name: 'Groceries', outflow: 120.00, color: '#34C759' },
      { category_name: 'Dining Out', outflow: 80.00, color: '#FF9500' },
      { category_name: 'Transportation', outflow: 30.00, color: '#007AFF' },
      { category_name: 'Entertainment', outflow: 20.00, color: '#AF52DE' }
    ],
    topMerchants: [
      { merchant: 'Grocery Store', total: 120.00 },
      { merchant: 'Coffee Shop', total: 45.00 },
      { merchant: 'Gas Station', total: 30.00 },
      { merchant: 'Restaurant', total: 25.00 }
    ]
  };

  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const budgetPercentage = mockData.totalBudget > 0 ? 
    (mockData.totalSpent / mockData.totalBudget) * 100 : 0;

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

          {/* Month Display */}
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">
              {monthName}
            </h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Spent</h3>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(mockData.totalSpent)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(budgetPercentage)}% of budget
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Daily Average</h3>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(mockData.dailyAverage)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Projected: {formatMoney(mockData.projectedSpend)}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
          </div>

          <div className="p-4">
            {/* Category Pie Chart Visual */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="text-gray-200"
                  cx="18" cy="18" r="15.915"
                  fill="none" stroke="currentColor" strokeWidth="3"
                />
                {mockData.monthlySpend.map((category, index) => {
                  const percentage = mockData.totalSpent > 0 ? 
                    (category.outflow / mockData.totalSpent) * 100 : 0;
                  const strokeDasharray = `${percentage} ${100 - percentage}`;
                  const previousPercentages = mockData.monthlySpend.slice(0, index)
                    .reduce((acc, cat) => acc + ((cat.outflow / mockData.totalSpent) * 100), 0);
                  
                  return (
                    <circle
                      key={index}
                      cx="18" cy="18" r="15.915"
                      fill="none"
                      stroke={category.color}
                      strokeWidth="3"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={-previousPercentages}
                      className="transition-all duration-1000"
                    />
                  );
                })}
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{formatMoney(mockData.totalSpent)}</span>
                <span className="text-sm text-gray-500">Total Spent</span>
              </div>
            </div>

            {/* Category List */}
            <div className="space-y-3">
              {mockData.monthlySpend.map((category, index) => {
                const percentage = mockData.totalSpent > 0 ? 
                  (category.outflow / mockData.totalSpent) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="font-medium text-gray-900">
                        {category.category_name}
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
        </div>

        {/* Top Merchants */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Top Merchants</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {mockData.topMerchants.map((merchant, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
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

        {/* Insights & Tips */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Budget status insight */}
            {budgetPercentage > 80 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="material-symbols-outlined text-yellow-500 mt-0.5">warning</span>
                <div>
                  <p className="font-medium text-yellow-900">Budget Warning</p>
                  <p className="text-sm text-yellow-700">
                    You've used {Math.round(budgetPercentage)}% of your monthly budget. Consider reviewing your upcoming expenses.
                  </p>
                </div>
              </div>
            )}

            {/* Positive insight */}
            {budgetPercentage <= 50 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="material-symbols-outlined text-green-500 mt-0.5">check_circle</span>
                <div>
                  <p className="font-medium text-green-900">Great Job!</p>
                  <p className="text-sm text-green-700">
                    You're staying well within your budget this month. Keep up the good work!
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