import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Helper function to format currency, moved here to resolve the import error
function formatMoney(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Mock data for testing
  const mockData = {
    accounts: [
      {
        id: 'd0e28c8b-ee01-4590-a540-71dc0c52f13c',
        name: 'Cash',
        type: 'cash',
        current_balance: -50.00
      }
    ],
    totalSpent: 250.00,
    totalBudget: 2000.00,
    recentTransactions: [
      {
        id: 1,
        merchant: 'Coffee Shop',
        category_name: 'Dining Out',
        account_name: 'Cash',
        amount: 5.50,
        direction: 'outflow',
        occurred_at: new Date().toISOString()
      },
      {
        id: 2,
        merchant: 'Grocery Store',
        category_name: 'Groceries',
        account_name: 'Cash',
        amount: 45.00,
        direction: 'outflow',
        occurred_at: new Date().toISOString()
      }
    ]
  };

  const budgetPercentage = mockData.totalBudget > 0 ? (mockData.totalSpent / mockData.totalBudget) * 100 : 0;
  const remainingBudget = mockData.totalBudget - mockData.totalSpent;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={() => navigate('/insights')}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
            >
              <span className="material-symbols-outlined">insights</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Budget Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Monthly Budget Overview
          </h2>

          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={`transition-all duration-1000 ${
                  budgetPercentage > 100 ? 'text-red-500' :
                  budgetPercentage > 80 ? 'text-yellow-500' :
                  'text-green-500'
                }`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${Math.min(budgetPercentage, 100)}, 100`}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-light text-gray-900">
                {formatMoney(mockData.totalSpent)}
              </span>
              <span className="text-sm text-gray-500">
                of {formatMoney(mockData.totalBudget)}
              </span>
              <span className={`text-xs font-medium ${
                budgetPercentage > 100 ? 'text-red-600' :
                budgetPercentage > 80 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {Math.round(budgetPercentage)}% used
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              {remainingBudget > 0 ? formatMoney(remainingBudget) : formatMoney(Math.abs(remainingBudget))}
              {remainingBudget > 0 ? ' remaining' : ' over budget'}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-green-500 text-xl">account_balance</span>
              <h3 className="text-sm font-medium text-gray-600">Total Balance</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatMoney(
                mockData.accounts.reduce((sum, account) =>
                  sum + parseFloat(account.current_balance || 0), 0
                )
              )}
            </p>
            <p className="text-xs text-gray-500">{mockData.accounts.length} accounts</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-blue-500 text-xl">trending_up</span>
              <h3 className="text-sm font-medium text-gray-600">This Month</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatMoney(mockData.totalSpent)}
            </p>
            <p className="text-xs text-gray-500">spent so far</p>
          </div>
        </div>

        {/* Accounts Overview */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Accounts</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {mockData.accounts.map((account) => (
              <div key={account.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-600">
                      {account.type === 'checking' ? 'account_balance' :
                       account.type === 'savings' ? 'savings' :
                       account.type === 'cash' ? 'account_balance_wallet' :
                       'credit_card'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatMoney(account.current_balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button
              onClick={() => navigate('/insights')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {mockData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-600">receipt</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {transaction.merchant}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.category_name} • {transaction.account_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">
                    -{formatMoney(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.occurred_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button className="flex flex-col items-center p-2 text-blue-600">
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => navigate('/insights')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
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