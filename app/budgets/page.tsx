"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import BudgetManager from "@/components/BudgetManager";
import dynamic from "next/dynamic";

const MonthlyBarChart = dynamic(
  () => import("@/components/charts/MonthlyBarChart"),
  { ssr: false }
);

interface Expense {
  category: string;
  amount: number;
}

export default function BudgetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(currentMonth);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/expenses?month=${month}`)
      .then((r) => r.json())
      .then(setExpenses);
  }, [session, month]);

  const [y, m] = month.split("-").map(Number);

  const prevMonth = () => {
    const d = new Date(y, m - 2, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const nextMonth = () => {
    const d = new Date(y, m, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  if (status === "loading") return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-xl font-bold text-gray-900">予算管理</h1>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            月別支出推移（過去6ヶ月）
          </h2>
          <MonthlyBarChart />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              ‹
            </button>
            <p className="font-semibold text-gray-800">
              {y}年{m}月の予算
            </p>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              disabled={month >= currentMonth}
            >
              ›
            </button>
          </div>
        </div>

        <BudgetManager month={month} expenses={expenses} />
      </main>
    </div>
  );
}
