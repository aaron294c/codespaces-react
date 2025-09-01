import React from 'react';

export default function Insights() {
  return (
    <div className="bg-white">
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
              <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-3 has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:text-black text-gray-500 text-sm font-semibold">
                <span className="truncate">You</span>
                <input className="invisible w-0" name="account-type" type="radio" value="You" />
              </label>

              <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-3 has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:text-black text-gray-500 text-sm font-semibold">
                <span className="truncate">Household</span>
                <input defaultChecked className="invisible w-0" name="account-type" type="radio" value="Household" />
              </label>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="px-4 pb-4 flex-1">
          {/* Category Breakdown */}
          <section className="mb-6">
            <h2 className="text-black text-[22px] font-bold tracking-[-0.4px] px-2 pb-3">Category Breakdown</h2>

            <div className="rounded-[20px] bg-white clean-shadow">
              <div className="relative h-56 flex items-center justify-center p-6 z-1 overflow-hidden">
                <svg className="absolute w-full h-full" viewBox="0 0 100 100" aria-hidden>
                  <circle className="stroke-gray-100" cx="50" cy="50" r="40" fill="none" strokeWidth="10" />
                  <circle
                    className="animate-donut-chart origin-center -rotate-90 cursor-pointer hover:opacity-80 transition-opacity"
                    cx="50" cy="50" r="40" fill="none"
                    stroke="var(--chart-color-1)" strokeWidth="10"
                    strokeDasharray="251.2" strokeDashoffset="175.84"
                  />
                  <circle
                    className="animate-donut-chart origin-center -rotate-90 cursor-pointer hover:opacity-80 transition-opacity"
                    cx="50" cy="50" r="40" fill="none"
                    stroke="var(--chart-color-2)" strokeWidth="10"
                    strokeDasharray="251.2" strokeDashoffset="113.04"
                  />
                  <circle
                    className="animate-donut-chart origin-center -rotate-90 cursor-pointer hover:opacity-80 transition-opacity"
                    cx="50" cy="50" r="40" fill="none"
                    stroke="var(--chart-color-3)" strokeWidth="10"
                    strokeDasharray="251.2" strokeDashoffset="75.36"
                  />
                  <circle
                    className="animate-donut-chart origin-center -rotate-90 cursor-pointer hover:opacity-80 transition-opacity"
                    cx="50" cy="50" r="40" fill="none"
                    stroke="var(--chart-color-4)" strokeWidth="10"
                    strokeDasharray="251.2" strokeDashoffset="37.68"
                  />
                  <circle
                    className="animate-donut-chart origin-center -rotate-90 cursor-pointer hover:opacity-80 transition-opacity"
                    cx="50" cy="50" r="40" fill="none"
                    stroke="var(--chart-color-5)" strokeWidth="10"
                    strokeDasharray="251.2" strokeDashoffset="0"
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
                <button className="flex items-center gap-4 cursor-pointer group p-2 -m-2 rounded-lg w-full text-left">
                  <div
                    className="flex size-10 items-center justify-center rounded-full shrink-0"
                    style={{ backgroundColor: '#EBF5FF', color: '#007AFF' }}
                  >
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
                      <div className="h-full rounded-full bg-[var(--chart-color-1)]" style={{ width: '83.33%', maxWidth: '100%' }} />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">$750 / $900</p>
                    </div>
                  </div>
                </button>

                {/* Dining Out */}
                <button className="flex items-center gap-4 cursor-pointer group p-2 -m-2 rounded-lg w-full text-left">
                  <div
                    className="flex size-10 items-center justify-center rounded-full shrink-0"
                    style={{ backgroundColor: '#E5F8E9', color: '#34C759' }}
                  >
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
                      <div className="h-full rounded-full bg-[var(--chart-color-2)]" style={{ width: '125%', maxWidth: '100%' }} />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-red-500">$500 / $400 (Over by $100)</p>
                    </div>
                  </div>
                </button>

                {/* Transport */}
                <button className="flex items-center gap-4 cursor-pointer group p-2 -m-2 rounded-lg w-full text-left">
                  <div
                    className="flex size-10 items-center justify-center rounded-full shrink-0"
                    style={{ backgroundColor: '#FFF8E6', color: '#FF9500' }}
                  >
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
                      <div className="h-full rounded-full bg-[var(--chart-color-3)]" style={{ width: '70%', maxWidth: '100%' }} />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">$350 / $500</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Quick Insights */}
          <section className="mb-8">
            <h2 className="text-black text-[22px] font-bold tracking-[-0.4px] px-2 pb-3">Quick Insights</h2>

            <div className="space-y-4">
              <div className="rounded-[20px] bg-white p-6 clean-shadow">
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

              <div className="rounded-[20px] bg-white p-6 clean-shadow">
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

          {/* Achievements */}
          <section>
            <h2 className="text-black text-[22px] font-bold tracking-[-0.4px] px-2 pb-3">Achievements</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-3 rounded-[20px] bg-white clean-shadow transform transition-transform hover:scale-105">
                <div className="relative mb-2">
                  <span className="material-symbols-outlined text-4xl text-yellow-500">emoji_events</span>
                </div>
                <p className="font-bold text-sm text-black leading-tight">Budget Master</p>
                <p className="text-xs text-gray-500 mt-1">3 months in a row!</p>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-[20px] bg-white clean-shadow">
                <div className="relative mb-2 w-10 h-10">
                  <svg className="absolute w-full h-full" viewBox="0 0 36 36" aria-hidden>
                    <circle className="stroke-gray-200" cx="18" cy="18" r="16" fill="none" strokeWidth="3.5" />
                    <circle
                      className="origin-center -rotate-90 stroke-current text-blue-500"
                      cx="18" cy="18" r="16" fill="none" strokeWidth="3.5"
                      strokeDasharray="100" strokeDashoffset="25"
                    />
                  </svg>
                  <span className="material-symbols-outlined text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
                    savings
                  </span>
                </div>
                <p className="font-bold text-sm text-black leading-tight">Saving Streak</p>
                <p className="text-xs text-gray-500 mt-1">Save $500 to unlock</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
                  <div className="bg-blue-500 h-1 rounded-full w-3/4" />
                </div>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-[20px] bg-gray-100">
                <div className="relative mb-2">
                  <span className="material-symbols-outlined text-4xl text-gray-400">lock</span>
                </div>
                <p className="font-bold text-sm text-gray-500 leading-tight">Investor</p>
                <p className="text-xs text-gray-500 mt-1">Make 5 investments.</p>
              </div>
            </div>
          </section>
        </main>

        <div className="safe-area-bottom" />
      </div>
    </div>
  );
}