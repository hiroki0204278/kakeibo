"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CATEGORY_COLORS, type Category } from "@/lib/categories";

const CategoryPieChart = dynamic(
  () => import("@/components/charts/CategoryPieChart"),
  { ssr: false }
);

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  storeName: string | null;
  memo: string | null;
}

interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
}

interface Props {
  expenses: Expense[];
  budgets: Budget[];
  totalExpense: number;
  month: string;
  userName: string;
}

export default function DashboardClient({
  expenses,
  budgets,
  totalExpense,
  month,
  userName,
}: Props) {
  const [, setYear] = useState(parseInt(month.split("-")[0]));
  const [, setMonthNum] = useState(parseInt(month.split("-")[1]));

  const [y, m] = month.split("-").map(Number);
  const monthLabel = `${y}年${m}月`;

  const spendingByCategory = expenses.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {}
  );

  const recentExpenses = expenses.slice(0, 5);

  const alertBudgets = budgets.filter((b) => {
    const spent = spendingByCategory[b.category] || 0;
    return spent / b.amount >= 0.8;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {userName ? `${userName}さんの` : ""}ダッシュボード
        </h1>
        <p className="text-sm text-gray-500">{monthLabel}の家計状況</p>
      </div>

      {alertBudgets.length > 0 && (
        <div className="space-y-2">
          {alertBudgets.map((b) => {
            const spent = spendingByCategory[b.category] || 0;
            const pct = (spent / b.amount) * 100;
            const isOver = spent > b.amount;
            return (
              <div
                key={b.id}
                className={`p-3 rounded-xl border text-sm ${
                  isOver
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800"
                }`}
              >
                {isOver
                  ? `⚠️ ${b.category}の予算を超過しています（${pct.toFixed(0)}%使用）`
                  : `⚡ ${b.category}の予算の${pct.toFixed(0)}%を使用しました`}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm text-gray-500">{monthLabel}の合計支出</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          ¥{totalExpense.toLocaleString()}
        </p>
      </div>

      {expenses.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            カテゴリ別支出
          </h2>
          <CategoryPieChart expenses={expenses} />
        </div>
      )}

      {Object.keys(spendingByCategory).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            カテゴリ別内訳
          </h2>
          <div className="space-y-2">
            {Object.entries(spendingByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amount]) => (
                <div key={cat} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[cat as Category] || "#94a3b8",
                    }}
                  />
                  <span className="text-sm text-gray-600 flex-1">{cat}</span>
                  <span className="text-sm font-medium text-gray-900">
                    ¥{amount.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">最近の支出</h2>
          <Link href="/expenses" className="text-xs text-blue-600 hover:underline">
            すべて見る
          </Link>
        </div>
        {recentExpenses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            まだ支出記録がありません
          </p>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {e.storeName || e.category}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(e.date).toLocaleDateString("ja-JP")} ·{" "}
                    {e.category}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ¥{e.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/expenses"
        className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        + 支出を追加する
      </Link>
    </div>
  );
}
