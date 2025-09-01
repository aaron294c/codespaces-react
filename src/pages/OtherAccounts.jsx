import React, { useState } from 'react';

export default function Accounts() {
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

    const addNewAccount = () => {
        const newAccount = {
            type: "New Account",
            amount: "0.00",
            icon: "account_balance"
        };
        setAccounts([...accounts, newAccount]);
    };

    return (
        <div className="min-h-screen pb-20 bg-gray-50">
            <div className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden">
                <div className="flex-grow">
                    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center p-4 pb-3 justify-between">
                            <div className="w-12"></div>
                            <h1 className="text-gray-900 text-xl font-semibold leading-tight tracking-tight flex-1 text-center">
                                Accounts
                            </h1>
                            <div className="flex w-12 items-center justify-end">
                                <button 
                                    onClick={addNewAccount}
                                    className="flex items-center justify-center rounded-full h-10 w-10 text-gray-900 hover:bg-gray-100 transition-colors"
                                >
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
                                        <div className="flex items-center">
                                            <span className="text-gray-900 text-2xl font-semibold mr-1">$</span>
                                            <input 
                                                className="text-gray-900 text-2xl font-semibold leading-tight bg-transparent border-0 p-0 focus:ring-0 focus:outline-none w-full" 
                                                type="text" 
                                                value={account.amount}
                                                onChange={(e) => handleAmountChange(index, e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const updatedAccounts = accounts.filter((_, i) => i !== index);
                                            setAccounts(updatedAccounts);
                                        }}
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {/* Add Account Button */}
                        <button 
                            onClick={addNewAccount}
                            className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-6 transition-colors"
                        >
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                <span className="material-symbols-outlined text-4xl">add_circle</span>
                                <span className="font-medium">Add New Account</span>
                            </div>
                        </button>
                    </main>
                </div>
            </div>
        </div>
    );
};