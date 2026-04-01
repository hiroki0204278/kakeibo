"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  storeName: string | null;
  memo: string | null;
  imageUrl: string | null;
  items: { name: string; amount: number }[] | null;
}

export default function ExpensesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [month, setMonth] = useState(currentMonth);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await fetch(`/api/expenses?month=${month}`);
    const data = await res.json();
    setExpenses(data);
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, month]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const [y, m] = month.split("-").map(Number);

  const prevMonth = () => {
    const d = new Date(y, m - 2, 1);
    setMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };
  const nextMonth = () => {
    const d = new Date(y, m, 1);
    setMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };

  if (status === "loading") return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">支出管理</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {showForm ? "閉じる" : "+ 追加"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              支出を追加
            </h2>
            <ExpenseForm
              onSaved={() => {
                setShowForm(false);
                fetchExpenses();
              }}
            />
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              ‹
            </button>
            <div className="text-center">
              <p className="font-semibold text-gray-800">
                {y}年{m}月
              </p>
              <p className="text-sm text-gray-500">
                合計 ¥{total.toLocaleString()}
              </p>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              disabled={month >= currentMonth}
            >
              ›
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : (
          <ExpenseList expenses={expenses} onChanged={fetchExpenses} />
        )}
      </main>
    </div>
  );
}
