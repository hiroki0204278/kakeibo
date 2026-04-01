"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import ImageUpload from "@/components/ImageUpload";

interface ExpenseFormData {
  date: string;
  amount: string;
  category: string;
  storeName: string;
  memo: string;
  imageUrl: string;
  items: { name: string; amount: number }[];
}

interface Props {
  onSaved: () => void;
  initial?: Partial<ExpenseFormData> & { id?: string };
}

const today = new Date().toISOString().split("T")[0];

export default function ExpenseForm({ onSaved, initial }: Props) {
  const [form, setForm] = useState<ExpenseFormData>({
    date: initial?.date || today,
    amount: initial?.amount || "",
    category: initial?.category || "その他",
    storeName: initial?.storeName || "",
    memo: initial?.memo || "",
    imageUrl: initial?.imageUrl || "",
    items: initial?.items || [],
  });
  const [showUpload, setShowUpload] = useState(!initial?.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzed = (result: {
    storeName: string | null;
    date: string | null;
    totalAmount: number | null;
    items: { name: string; amount: number }[];
    category: string;
    memo: string | null;
    imageUrl: string;
  }) => {
    setForm((prev) => ({
      ...prev,
      storeName: result.storeName || prev.storeName,
      date: result.date || prev.date,
      amount: result.totalAmount?.toString() || prev.amount,
      category: result.category || prev.category,
      memo: result.memo || prev.memo,
      imageUrl: result.imageUrl || prev.imageUrl,
      items: result.items || prev.items,
    }));
    setShowUpload(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = initial?.id
        ? `/api/expenses/${initial.id}`
        : "/api/expenses";
      const method = initial?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存に失敗しました");

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showUpload && (
        <div>
          <ImageUpload onAnalyzed={handleAnalyzed} />
          <button
            type="button"
            onClick={() => setShowUpload(false)}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            手入力する
          </button>
        </div>
      )}
      {!showUpload && !initial?.id && (
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          画像から自動入力する
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            金額 (円) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            min="0"
            placeholder="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          店名・請求元
        </label>
        <input
          type="text"
          value={form.storeName}
          onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          placeholder="例: スーパーマーケット"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
          rows={2}
          placeholder="メモを入力..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {form.items.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">品目リスト</p>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            {form.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name}</span>
                <span className="text-gray-900">¥{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "保存中..." : initial?.id ? "更新する" : "保存する"}
      </button>
    </form>
  );
}
