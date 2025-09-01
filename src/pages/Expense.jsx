import React, { useState } from "react";

export default function Expense() {
  const [amount, setAmount] = useState("125.50");
  const [note, setNote] = useState("Starbucks coffee");
  const [selectedCategory, setSelectedCategory] = useState("restaurant");

  const quickAmounts = ["$5", "$10", "$25", "$50"];
  const categories = [
    { id: "shopping_cart", label: "Groceries", icon: "shopping_cart" },
    { id: "restaurant", label: "Dining Out", icon: "restaurant" },
    { id: "lightbulb", label: "Utilities", icon: "lightbulb" },
    { id: "home", label: "Rent", icon: "home" },
    { id: "directions_car", label: "Transport", icon: "directions_car" },
    { id: "movie", label: "Entertainment", icon: "movie" },
    { id: "receipt_long", label: "Bills", icon: "receipt_long" },
    { id: "shopping_bag", label: "Shopping", icon: "shopping_bag" },
    { id: "add", label: "Add", icon: "add" }
  ];

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.replace('$', ''));
  };

  const handleAddExpense = () => {
    // Here you would typically save the expense
    console.log({ amount, note, selectedCategory });
    // Navigate back or show success message
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      <div className="relative flex size-full min-h-screen flex-col justify-end bg-black/30">
        <div className="relative flex flex-col rounded-t-[28px] bg-white pb-6 pt-4 shadow-[0_2px_20px_rgba(0,0,0,0.08)] animate-[slide-up_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <div className="flex h-5 w-full items-center justify-center">
            <div className="h-1.5 w-10 rounded-full bg-gray-300"></div>
          </div>
          
          <div className="flex-1 px-4 pt-6">
            <div className="px-2">
              <div className="relative flex items-center justify-center">
                <span className="text-4xl font-light text-gray-400 self-start pt-1.5 pr-1">$</span>
                <input 
                  className="form-input h-auto w-full border-none bg-transparent p-0 text-center text-[56px] font-light text-black placeholder:text-gray-400 focus:outline-none focus:ring-0" 
                  placeholder="0" 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2">
              {quickAmounts.map((quickAmount) => (
                <button 
                  key={quickAmount}
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
                >
                  {quickAmount}
                </button>
              ))}
            </div>
            
            <div className="mt-6 px-2">
              <div className="relative">
                <input 
                  className="form-input w-full rounded-xl border-none bg-gray-100 py-3.5 pl-4 pr-12 text-base text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600" 
                  placeholder="Note (e.g., Starbucks coffee)" 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button className="absolute inset-y-0 right-0 flex items-center pr-3.5 transition-transform active:scale-90">
                  <span className="material-symbols-outlined text-gray-500">mic</span>
                </button>
              </div>
            </div>
            
            <div className="mt-6 px-2">
              <h3 className="text-base font-semibold tracking-tight text-gray-500 uppercase">CATEGORIES</h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button 
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex h-[88px] flex-col items-center justify-center gap-y-2 rounded-2xl transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      selectedCategory === category.id 
                        ? "bg-blue-100 ring-2 ring-blue-600" 
                        : "bg-gray-100"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${
                      selectedCategory === category.id ? "text-blue-600" : "text-gray-500"
                    }`}>
                      {category.icon}
                    </span>
                    <p className={`text-xs font-medium ${
                      selectedCategory === category.id ? "text-blue-600 font-semibold" : "text-gray-500"
                    }`}>
                      {category.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-8 px-2">
              <h3 className="text-base font-semibold tracking-tight text-gray-500 uppercase">SUGGESTIONS</h3>
              <div className="mt-4">
                <button className="flex w-full items-center gap-x-4 rounded-xl bg-gray-100 p-3 transition-colors hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                    <span className="material-symbols-outlined text-blue-600">local_cafe</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-black">Dining Out</p>
                    <p className="text-sm text-gray-500">Based on "Starbucks"</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-gray-300">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 px-6 pb-2">
            <button 
              onClick={handleAddExpense}
              className="flex w-full cursor-pointer items-center justify-center rounded-full bg-blue-600 py-4 text-lg font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] transition-transform active:scale-95 hover:bg-blue-700"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}