import React, { useState } from "react";

export default function OtherAccounts() {
  const [accounts, setAccounts] = useState([
    { type: "Checking", amount: "1,234.56", icon: "account_balance" },
    { type: "Savings", amount: "5,678.90", icon: "savings" },
    { type: "Credit Card", amount: "345.67", icon: "credit_card" }
  ]);

  const handleAmountChange = (index, newAmount) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index].amount = newAmount;
    setAccounts(updatedAccounts);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden">
        <div className="flex-grow">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center p-4 pb-3 justify-between">
              <div className="w-12"></div>
              <h1 className="text-gray-900 text-xl font-semibold leading-tight tracking-tight flex-1 text-center">
                Accounts
              </h1>
              <div className="flex w-12 items-center justify-end">
                <button className="flex items-center justify-center rounded-full h-10 w-10 text-gray-900">
                  <span className="material-symbols-outlined text-3xl">add</span>
                </button>
              </div>
            </div>
          </header>
          
          <main className="p-4 space-y-4">
            {accounts.map((account, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 rounded-lg size-12 flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-600">{account.icon}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-gray-500 text-sm font-normal leading-normal">{account.type}</p>
                    <input 
                      className="text-gray-900 text-2xl font-semibold leading-tight w-full border-0 p-0 focus:ring-0 bg-transparent" 
                      type="text" 
                      value={`$${account.amount}`}
                      onChange={(e) => handleAmountChange(index, e.target.value.replace('$', ''))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}