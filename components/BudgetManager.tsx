"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, type Category } from "@/lib/categories";

interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
}

interface Expense {
  category: string;
  amount: number;
}

interface Props {
  month: string;
  expenses: Expense[];
}

export default function BudgetManager({ month, expenses }: Props) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    const res = await fetch(`/api/budgets?month=${month}`);
    const data = await res.json();
    setBudgets(data);
  };

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const spendingByCategory = expenses.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {}
  );

  const handleSave = async (category: string) => {
    setSaving(true);
    try {
      await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount: editAmount, month }),
      });
      await fetchBudgets();
      setEditCategory(null);
      setEditAmount("");
    } finally {
      setSaving(false);
    }
  };

  const getBudget = (category: string) =>
    budgets.find((b) => b.category === category);

  return (
    <div className="space-y-3">
      {CATEGORIES.map((category) => {
        const budget = getBudget(category);
        const spent = spendingByCategory[category] || 0;
        const pct = budget ? Math.min((spent / budget.amount) * 100, 100) : 0;
        const isOver = budget && spent > budget.amount;
        const isWarning = budget && !isOver && spent / budget.amount >= 0.8;

        return (
          <div key={category} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700 text-sm">{category}</span>
              <div className="flex items-center gap-2">
                {isOver && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    予算超過
                  </span>
                )}
                {isWarning && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                    80%超過
                  </span>
                )}
                {editCategory === category ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-24 border border-gray-300 rounded px-2 py-1 text-xs"
                      placeholder="予算額"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(category)}
                      disabled={saving}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded disabled:opacity-50"
                    >
                      {saving ? "..." : "保存"}
                    </button>
                    <button
                      onClick={() => {
                        setEditCategory(null);
                        setEditAmount("");
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditCategory(category);
                      setEditAmount(budget?.amount.toString() || "");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {budget ? "編集" : "設定"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>¥{spent.toLocaleString()} 使用</span>
              <span>{budget ? `¥${budget.amount.toLocaleString()} 予算` : "予算未設定"}</span>
            </div>

            {budget && (
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isOver
                      ? "bg-red-500"
                      : isWarning
                      ? "bg-yellow-400"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
            {budget && (
              <p
                className={`text-xs mt-1 ${
                  isOver ? "text-red-600" : isWarning ? "text-yellow-600" : "text-gray-400"
                }`}
              >
                {pct.toFixed(0)}% 使用
                {isOver && ` (¥${(spent - budget.amount).toLocaleString()} 超過)`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
