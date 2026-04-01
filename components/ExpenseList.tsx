"use client";

import { useState } from "react";
import ExpenseForm from "@/components/ExpenseForm";

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

interface Props {
  expenses: Expense[];
  onChanged: () => void;
}

export default function ExpenseList({ expenses, onChanged }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      onChanged();
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">📋</p>
        <p>支出記録がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div key={expense.id}>
          {editId === expense.id ? (
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-800">支出を編集</h3>
                <button
                  onClick={() => setEditId(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <ExpenseForm
                initial={{
                  id: expense.id,
                  date: expense.date.split("T")[0],
                  amount: expense.amount.toString(),
                  category: expense.category,
                  storeName: expense.storeName || "",
                  memo: expense.memo || "",
                  imageUrl: expense.imageUrl || "",
                  items: expense.items || [],
                }}
                onSaved={() => {
                  setEditId(null);
                  onChanged();
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {expense.category}
                  </span>
                  {expense.storeName && (
                    <span className="text-sm text-gray-700 font-medium truncate">
                      {expense.storeName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {new Date(expense.date).toLocaleDateString("ja-JP")}
                  </span>
                  {expense.memo && (
                    <span className="text-xs text-gray-400 truncate">
                      {expense.memo}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900">
                  ¥{expense.amount.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditId(expense.id)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="編集"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setDeleteId(expense.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">削除の確認</h3>
            <p className="text-sm text-gray-500 mb-5">
              この支出記録を削除しますか？この操作は元に戻せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
