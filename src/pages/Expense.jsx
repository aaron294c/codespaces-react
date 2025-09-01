// src/pages/Expense.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dbHelpers } from "../lib/supabase";

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
);

export default function Expense() {
  const navigate = useNavigate();
  const { user, householdId } = useAuth();

  const [formData, setFormData] = useState({
    amount: "",
    categoryId: "",
    accountId: "",
    merchant: "",
    note: "",
    occurredAt: new Date().toISOString().split("T")[0],
  });

  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const quickAmounts = [5, 10, 25, 50, 100];

  useEffect(() => {
    const fetchData = async () => {
      if (!householdId) return;
      try {
        setLoading(true);
        const [categoriesData, accountsData] = await Promise.all([
          dbHelpers.getCategories(householdId),
          dbHelpers.getAccounts(householdId),
        ]);

        const expenseCats = categoriesData.filter((c) => c.kind === "expense");
        setCategories(expenseCats);
        setAccounts(accountsData);

        // Defaults
        setFormData((prev) => ({
          ...prev,
          accountId: prev.accountId || accountsData[0]?.account_id || "",
          categoryId: prev.categoryId || expenseCats[0]?.id || "",
        }));
      } catch (e) {
        console.error(e);
        setError("Failed to load form data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [householdId]);

  const handleAmountChange = (raw) => {
    // allow only digits and a single dot, max 2 dp
    const clean = raw.replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setFormData((p) => ({ ...p, amount: clean }));
    setError("");
  };

  const handleQuickAmount = (amt) => {
    setFormData((p) => ({ ...p, amount: String(amt) }));
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const palette = [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#F97316",
        "#06B6D4",
        "#84CC16",
      ];
      const color = palette[categories.length % palette.length];

      const newCat = await dbHelpers.insertCategory({
        household_id: householdId,
        name: newCategoryName.trim(),
        color,
        kind: "expense",
      });

      setCategories((prev) => [...prev, newCat]);
      setFormData((p) => ({ ...p, categoryId: newCat.id }));
      setNewCategoryName("");
      setShowCategoryModal(false);
    } catch (e) {
      console.error(e);
      setError("Failed to create category. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error("Please enter a valid amount.");
      }
      if (!formData.categoryId) throw new Error("Please select a category.");
      if (!formData.accountId) throw new Error("Please select an account.");

      const tx = {
        household_id: householdId,
        account_id: formData.accountId,
        category_id: formData.categoryId,
        created_by: user.id,
        direction: "outflow",
        amount: parseFloat(formData.amount),
        currency: "USD",
        merchant: formData.merchant.trim() || null,
        note: formData.note.trim() || null,
        occurred_at: new Date(formData.occurredAt + "T12:00:00").toISOString(),
      };

      await dbHelpers.insertTransaction(tx);
      setSuccess(true);

      setTimeout(() => {
        setFormData({
          amount: "",
          categoryId: categories[0]?.id || "",
          accountId: accounts[0]?.account_id || "",
          merchant: "",
          note: "",
          occurredAt: new Date().toISOString().split("T")[0],
        });
        setSuccess(false);
        navigate("/dashboard");
      }, 1200);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to add expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-200 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading…</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gray-200 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-green-600 text-2xl">
              check_circle
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Expense Added!
          </h2>
          <p className="text-gray-600">Your transaction has been saved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 min-h-screen">
      <div className="relative flex size-full min-h-screen flex-col justify-end bg-black/30">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 text-white/80 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h1 className="text-white font-semibold">Add Expense</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Sheet */}
        <div className="relative flex flex-col rounded-t-[28px] bg-white pb-6 pt-4 shadow-xl animate-[slide-up_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards] max-h-[90vh] overflow-y-auto">
          <div className="flex h-5 w-full items-center justify-center mb-4">
            <div className="h-1.5 w-10 rounded-full bg-gray-300" />
          </div>

          <form onSubmit={handleSubmit} className="flex-1 px-4">
            {/* Amount */}
            <div className="px-2 mb-6">
              <div className="relative flex items-center justify-center">
                <span className="text-4xl font-light text-gray-400 self-start pt-1.5 pr-1">
                  $
                </span>
                <input
                  className="h-auto w-full border-none bg-transparent p-0 text-center text-[56px] font-light text-black placeholder:text-gray-400 focus:outline-none focus:ring-0"
                  placeholder="0.00"
                  type="text"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  inputMode="decimal"
                />
              </div>
            </div>

            {/* Quick amounts */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95 hover:bg-gray-200"
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Merchant */}
            <div className="px-2 mb-6">
              <input
                name="merchant"
                value={formData.merchant}
                onChange={handleInputChange}
                className="w-full rounded-xl border-none bg-gray-100 py-3.5 px-4 text-base text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                placeholder="Merchant (e.g., Starbucks)"
                type="text"
              />
            </div>

            {/* Note */}
            <div className="px-2 mb-6">
              <input
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="w-full rounded-xl border-none bg-gray-100 py-3.5 px-4 text-base text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                placeholder="Note (optional)"
                type="text"
              />
            </div>

            {/* Date */}
            <div className="px-2 mb-6">
              <input
                name="occurredAt"
                value={formData.occurredAt}
                onChange={handleInputChange}
                className="w-full rounded-xl border-none bg-gray-100 py-3.5 px-4 text-base text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                type="date"
              />
            </div>

            {/* Categories */}
            <div className="px-2 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold tracking-tight text-gray-500 uppercase">
                  Categories
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Add New
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const selected = formData.categoryId === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, categoryId: category.id }))
                      }
                      className={`flex h-[88px] flex-col items-center justify-center gap-y-2 rounded-2xl transition-transform hover:scale-105 active:scale-95 focus:outline-none ${
                        selected ? "ring-2 ring-blue-600" : ""
                      }`}
                      style={{
                        backgroundColor: selected
                          ? `${category.color}20`
                          : "#F3F4F6",
                        color: selected ? category.color : "#6B7280",
                      }}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {getCategoryIcon(category.name)}
                      </span>
                      <p className="text-xs font-medium px-1 text-center leading-tight">
                        {category.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accounts (if > 1) */}
            {accounts.length > 1 && (
              <div className="px-2 mb-6">
                <h3 className="text-base font-semibold tracking-tight text-gray-500 uppercase mb-4">
                  Account
                </h3>
                <div className="space-y-2">
                  {accounts.map((account) => {
                    const selected = formData.accountId === account.account_id;
                    return (
                      <button
                        key={account.account_id}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({
                            ...p,
                            accountId: account.account_id,
                          }))
                        }
                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${
                          selected
                            ? "bg-blue-100 ring-2 ring-blue-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                          <span className="material-symbols-outlined text-gray-600">
                            {getAccountIcon(account.account_type)}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">
                            {account.account_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${account.current_balance.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-2 mb-4">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
                  {error}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="px-2 pb-2">
              <button
                type="submit"
                disabled={
                  submitting ||
                  !formData.amount ||
                  !formData.categoryId ||
                  !formData.accountId
                }
                className="flex w-full items-center justify-center rounded-full bg-blue-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <LoadingSpinner /> : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* New Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Create New Category</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                }}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Helpers */
function getCategoryIcon(name) {
  const map = {
    Groceries: "shopping_cart",
    "Dining Out": "restaurant",
    Transportation: "directions_car",
    Utilities: "lightbulb",
    Entertainment: "movie",
    Shopping: "shopping_bag",
    Healthcare: "local_hospital",
    "Rent/Mortgage": "home",
    Bills: "receipt_long",
  };
  return map[name] || "category";
}

function getAccountIcon(type) {
  const map = {
    checking: "account_balance",
    savings: "savings",
    credit_card: "credit_card",
    investment: "trending_up",
  };
  return map[type] || "payments";
}
