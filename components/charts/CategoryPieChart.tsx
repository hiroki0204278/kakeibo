"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { CATEGORY_COLORS, type Category } from "@/lib/categories";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Expense {
  category: string;
  amount: number;
}

interface Props {
  expenses: Expense[];
}

export default function CategoryPieChart({ expenses }: Props) {
  const spending = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const labels = Object.keys(spending);
  const values = Object.values(spending);
  const colors = labels.map(
    (l) => CATEGORY_COLORS[l as Category] || "#94a3b8"
  );

  if (labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        データがありません
      </div>
    );
  }

  return (
    <div className="max-w-xs mx-auto">
      <Pie
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        }}
        options={{
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: { size: 11 },
                padding: 8,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  ` ¥${(ctx.raw as number).toLocaleString()}`,
              },
            },
          },
        }}
      />
    </div>
  );
}
