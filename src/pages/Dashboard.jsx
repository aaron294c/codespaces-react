// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dbHelpers } from "../lib/supabase";

/* ---------- Utils: safe coercion & formatting ---------- */
const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const formatMoney = (v, digits = 2) => {
  const n = toNumber(v, 0);
  try {
    return n.toFixed(digits);
  } catch {
    return (0).toFixed(digits);
  }
};

const safeDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
};

/* ---------- Small UI bits ---------- */
const LoadingSkeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <span className="material-symbols-outlined text-gray-400 text-2xl">
        {icon}
      </span>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{description}</p>
    {action || null}
  </div>
);

/* ---------- Page ---------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, householdId, loading: authLoading } = useAuth();

  const [data, setData] = useState({
    accounts: [],
    monthlySpend: [],
    budgetProgress: [],
    recentTransactions: [],
    upcomingBills: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      // Always start a fresh load on dependency change
      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);

      // If householdId isn't ready yet, end loading and wait for next run
      if (!householdId) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const [
          accounts,
          monthlySpend,
          budgetProgress,
          recentTransactions,
          upcomingBills,
        ] = await Promise.all([
          dbHelpers.getAccounts(householdId),
          dbHelpers.getMonthlySpend(householdId, currentYear, currentMonth),
          dbHelpers.getBudgetProgress(householdId, currentYear, currentMonth),
          dbHelpers.getRecentTransactions(householdId, 10),
          dbHelpers.getUpcomingBills(householdId, 3),
        ]);

        if (cancelled) return;

        setData({
          accounts: accounts || [],
          monthlySpend: monthlySpend || [],
          budgetProgress: budgetProgress || [],
          recentTransactions: recentTransactions || [],
          upcomingBills: upcomingBills || [],
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load dashboard data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      cancelled = true;
    };
  }, [householdId, currentYear, currentMonth]);

  // Spending summary with guards
  const spendingSummary = useMemo(() => {
    const totalBudget = (data.budgetProgress || []).reduce(
      (sum, item) => sum + toNumber(item.budget_amount),
      0
    );
    const totalSpent = (data.budgetProgress || []).reduce(
      (sum, item) => sum + toNumber(item.spent),
      0
    );
    const totalRemaining = totalBudget - totalSpent;
    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const currentDay = now.getDate();
    const dailyRate = currentDay > 0 ? totalSpent / currentDay : 0;
    const projectedMonthly = dailyRate * daysInMonth;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      spentPercentage: Math.min(spentPercentage, 100),
      dailyRate,
      projectedMonthly,
    };
  }, [data.budgetProgress, currentYear, currentMonth, now]);

  // If auth finished but no household is configured, show CTA instead of skeleton
  if (!authLoading && !householdId) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-gray-400 text-2xl">
              group_add
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Create a Household
          </h2>
          <p className="text-gray-500 mb-6">
            You’ll need a household to see accounts, budgets, and transactions.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/onboarding")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/households/join")}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Join Existing
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="p-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <LoadingSkeleton className="h-10 w-10 rounded-full" />
              <div>
                <LoadingSkeleton className="h-4 w-16 mb-1" />
                <LoadingSkeleton className="h-6 w-24" />
              </div>
            </div>
            <LoadingSkeleton className="h-10 w-10 rounded-full" />
          </div>

          {/* Budget overview skeleton */}
          <LoadingSkeleton className="h-48 w-full rounded-2xl mb-6" />

          {/* Quick stats skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <LoadingSkeleton className="h-24 w-full rounded-2xl" />
            <LoadingSkeleton className="h-24 w-full rounded-2xl" />
          </div>

          {/* Recent transactions skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-16 w-full rounded-2xl" />
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
            <span className="material-symbols-outlined text-red-500 text-2xl">
              error
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
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

  // Dev helper: view shapes in console once loaded
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[Dashboard] Shapes:", {
      accounts: (data.accounts || []).slice(0, 2),
      recentTransactions: (data.recentTransactions || []).slice(0, 2),
      budgetProgress: (data.budgetProgress || []).slice(0, 2),
      upcomingBills: (data.upcomingBills || []).slice(0, 2),
    });
  }, [data]);

  const userName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Hello,</p>
              <p className="font-bold text-gray-900 text-lg">{userName}</p>
            </div>
          </div>
          <button
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </header>

        {/* Budget Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Budget Overview
          </h2>

          {(data.budgetProgress || []).length === 0 ? (
            <EmptyState
              icon="account_balance_wallet"
              title="No Budget Set"
              description="Create your first budget to start tracking your spending"
              action={
                <button
                  onClick={() => navigate("/budgets/new")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Budget
                </button>
              }
            />
          ) : (
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.8"
                  />
                  <path
                    className="text-blue-600 transition-all duration-1000 ease-out"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${spendingSummary.spentPercentage}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.8"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-light text-gray-900">
                    ${formatMoney(spendingSummary.totalSpent, 0)}
                  </span>
                  <span className="text-sm text-gray-500">
                    of ${formatMoney(spendingSummary.totalBudget, 0)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                ${formatMoney(spendingSummary.totalRemaining, 0)} remaining this
                month
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-green-500 text-xl">
                trending_up
              </span>
              <h3 className="text-sm font-semibold text-gray-600">
                Daily Average
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${formatMoney(spendingSummary.dailyRate, 0)}/day
            </p>
            <p className="text-xs text-gray-500">Current spending pace</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              Monthly Projection
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ${formatMoney(spendingSummary.projectedMonthly, 0)}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full ${
                  spendingSummary.projectedMonthly >
                  toNumber(spendingSummary.totalBudget)
                    ? "bg-red-500"
                    : "bg-blue-600"
                }`}
                style={{
                  width: `${Math.min(
                    toNumber(spendingSummary.totalBudget) > 0
                      ? (spendingSummary.projectedMonthly /
                          toNumber(spendingSummary.totalBudget)) *
                          100
                      : 0,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 text-right mt-0.5">
              {spendingSummary.projectedMonthly >
              toNumber(spendingSummary.totalBudget)
                ? "Over budget"
                : "On track"}
            </p>
          </div>
        </div>

        {/* Upcoming Bills */}
        {(data.upcomingBills || []).length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              Upcoming Bills
            </h3>
            {data.upcomingBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-lg font-bold text-gray-900">{bill.name}</p>
                  <p className="text-sm text-gray-500">
                    Due {safeDate(bill.due_date)} - ${formatMoney(bill.amount)}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/bills/${bill.id || ""}`)}
                  className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow hover:opacity-90 transition-opacity"
                >
                  Pay Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Transactions
            </h2>
            {(data.recentTransactions || []).length > 0 && (
              <button
                onClick={() => navigate("/transactions")}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                View All
              </button>
            )}
          </div>

          {(data.recentTransactions || []).length === 0 ? (
            <EmptyState
              icon="receipt_long"
              title="No Transactions Yet"
              description="Add your first expense to start tracking your spending"
              action={
                <button
                  onClick={() => navigate("/expense/new")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Expense
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((tx) => {
                const categoryName = tx.category?.name || "Uncategorized";
                const categoryColor = tx.category?.color || "#6B7280";
                const accountName =
                  tx.account?.account_name ||
                  tx.account?.name ||
                  "Account";
                const isOutflow = (tx.direction || "outflow") === "outflow";

                return (
                  <div
                    key={tx.id}
                    className="bg-white rounded-2xl flex items-center gap-4 p-4 shadow-sm border border-gray-100"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full shrink-0"
                      style={{
                        backgroundColor: `${categoryColor}20`,
                        color: categoryColor,
                      }}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {getCategoryIcon(categoryName)}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">
                        {tx.merchant || categoryName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {categoryName} • {accountName}
                      </p>
                      {tx.note && (
                        <p className="text-xs text-gray-400 mt-1">{tx.note}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          isOutflow ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isOutflow ? "-" : "+"}${formatMoney(tx.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {safeDate(tx.occurred_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Account Balances */}
        {(data.accounts || []).length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Balances
            </h2>
            <div className="space-y-3">
              {data.accounts.map((account) => {
                const typeLabel = (account.account_type || "").replace("_", " ");
                const currency = account.currency || "USD";
                const balance = formatMoney(account.current_balance);
                const net = toNumber(account.net_change, 0);

                return (
                  <div
                    key={account.account_id}
                    className="bg-white rounded-2xl flex items-center gap-4 p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shrink-0">
                      <span className="material-symbols-outlined text-gray-600">
                        {getAccountIcon(account.account_type)}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900">
                        {account.account_name || "Account"}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {typeLabel} • {currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        ${balance}
                      </p>
                      {net !== 0 && (
                        <p
                          className={`text-sm ${
                            net > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {net > 0 ? "+" : ""}${formatMoney(net)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Icon helpers ---------- */
function getCategoryIcon(categoryName) {
  const iconMap = {
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
  return iconMap[categoryName] || "receipt";
}

function getAccountIcon(accountType) {
  const iconMap = {
    checking: "account_balance",
    savings: "savings",
    credit_card: "credit_card",
    investment: "trending_up",
    cash: "payments",
  };
  return iconMap[accountType] || "account_balance";
}
