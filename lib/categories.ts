export const CATEGORIES = [
  "食費",
  "外食",
  "日用品",
  "交通費",
  "光熱費",
  "通信費",
  "医療費",
  "娯楽",
  "その他",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  食費: "#4ade80",
  外食: "#f97316",
  日用品: "#60a5fa",
  交通費: "#a78bfa",
  光熱費: "#fbbf24",
  通信費: "#34d399",
  医療費: "#f87171",
  娯楽: "#e879f9",
  その他: "#94a3b8",
};
