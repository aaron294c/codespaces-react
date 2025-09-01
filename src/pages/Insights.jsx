import React, { useState } from 'react';

export default function Insights() {
  const [selectedAccount, setSelectedAccount] = useState('household');

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="relative flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md">
          <div className="flex items-center p-4 pb-2 justify-between">
            <h1 className="text-gray-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
              Insights
            </h1>
          </div>

          {/* You / Household toggle */}
          <div className="flex px-4 py-3">
            <div className="flex h-11 flex-1 items-center justify-center rounded-xl bg-gray-100 p-1">
              <label className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-3 text-sm font-semibold ${selectedAccount === 'you' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
                <span className="truncate">You</span>
                <input 
                  className="invisible w-0" 
                  name="account-type" 
                  type="radio" 
                  value="you"
                  checked={selectedAccount === 'you'}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                />
              </label>

              <label className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-3 text-sm font-semibold ${selectedAccount === 'household' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
                <span className="truncate">Household</span>
                <input 
                  className="invisible w-0" 
                  name="account-type" 
                  type="radio" 
                  value="household"
                  checked={selectedAccount === 'household'}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                />
              </label>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="px-4 pb-4 flex-1">
          {/* Category Breakdown */}
          <section className="mb-6">
            <h2 className="text-black text-[22px] font-bold tracking-[-0.4px] px-2 pb-3">Category Breakdown</h2>

            <div className="rounded-[20px] bg-white shadow-sm border border-gray-100">
              <div className="relative h-56 flex items-center justify-center p-6 z-1 overflow-hidden">
                <svg className="absolute w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
                  <circle className="stroke-gray-100" cx="50" cy="50" r="40" fill="none" strokeWidth="10" />
                  <circle
                    className="origin-center -rotate-90 cursor-pointer hover:opacity-80 transition-opacity"
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#007AFF" strokeWidth="10"
                    strokeDasharray="251.2" strokeDashoffset="175.84"
                  />
                  <circle
                    className="origin-center -rotate-90 cursor-pointer hover:opacity-80 transition-opacity"
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#34C759" strokeWidth="10"
                    strokeDasharray="251.2" strokeDashoffset="113.04"
                  />
                  <circle
                    className="origin-center -rotate-90 cursor-pointer hover:opacity-80 transition-opacity"
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#FF9500" strokeWidth="10"
                    strokeDasharray="251.2" strokeDashoffset="75.36"
                  />
                </svg>

                <div className="text-center">
                  <p className="text-black tracking-tight text-[36px] font-bold truncate">$2,450.00</p>
                  <p className="text-gray-500 text-sm font-medium">This Month vs Last Month</p>
                  <div className="flex gap-1 items-center justify-center text-red-500 text-sm font-medium">
                    <span className="material-symbols-outlined text-base">arrow_upward</span>
                    <span>5.2% vs last month</span>
                  </div>
                </div>
              </div>

              {/* Category rows */}
              <div className="relative z-10 p-6 pt-0 mt-6 space-y-5">
                {/* Groceries */}
                <div className="flex items-center gap-4 p-2 rounded-lg">
                  <div className="flex size-10 items-center justify-center rounded-full shrink-0 bg-blue-100 text-blue-600">
                    <span className="material-symbols-outlined text-xl">shopping_bag</span>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-black font-semibold">Groceries</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-green-600 font-medium">30%</p>
                        <span className="material-symbols-outlined text-base text-green-500">trending_up</span>
                        <p className="text-black font-semibold">$750</p>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-gray-200 w-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: '83.33%', maxWidth: '100%' }} />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">$750 / $900</p>
                    </div>
                  </div>
                </div>

                {/* Dining Out */}
                <div className="flex items-center gap-4 p-2 rounded-lg">
                  <div className="flex size-10 items-center justify-center rounded-full shrink-0 bg-green-100 text-green-600">
                    <span className="material-symbols-outlined text-xl">restaurant</span>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-black font-semibold">Dining Out</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-red-600 font-medium">20%</p>
                        <span className="material-symbols-outlined text-base text-red-500">trending_down</span>
                        <p className="text-black font-semibold">$500</p>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-gray-200 w-full overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: '100%' }} />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-red-500">$500 / $400 (Over by $100)</p>
                    </div>
                  </div>
                </div>

                {/* Transport */}
                <div className="flex items-center gap-4 p-2 rounded-lg">
                  <div className="flex size-10 items-center justify-center rounded-full shrink-0 bg-orange-100 text-orange-600">
                    <span className="material-symbols-outlined text-xl">directions_car</span>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-black font-semibold">Transport</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600 font-medium">15%</p>
                        <span className="material-symbols-outlined text-base text-gray-500">trending_flat</span>
                        <p className="text-black font-semibold">$350</p>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-gray-200 w-full overflow-hidden">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: '70%' }} />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">$350 / $500</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Insights */}
          <section className="mb-8">
            <h2 className="text-black text-[22px] font-bold tracking-[-0.4px] px-2 pb-3">Quick Insights</h2>

            <div className="space-y-4">
              <div className="rounded-[20px] bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-500 shrink-0">
                    <span className="material-symbols-outlined text-xl">speed</span>
                  </div>
                  <div>
                    <p className="font-semibold text-black">Spending Velocity</p>
                    <p className="text-sm text-gray-500">
                      You're spending 15% faster this month. Be mindful of your 'Dining Out' category.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-500 shrink-0">
                    <span className="material-symbols-outlined text-xl">lightbulb</span>
                  </div>
                  <div>
                    <p className="font-semibold text-black">Smart Suggestion</p>
                    <p className="text-sm text-gray-500">
                      You've saved $150 on groceries. Consider moving that to your savings goal!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}