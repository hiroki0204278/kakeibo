"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface MonthData {
  month: string;
  total: number;
}

export default function MonthlyBarChart() {
  const [data, setData] = useState<MonthData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const months: MonthData[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const res = await fetch(`/api/expenses?month=${month}`);
        const expenses = await res.json();
        const total = expenses.reduce(
          (sum: number, e: { amount: number }) => sum + e.amount,
          0
        );
        months.push({ month, total });
      }
      setData(months);
    };

    fetchData();
  }, []);

  const labels = data.map((d) => {
    const [y, m] = d.month.split("-");
    return `${y}年${parseInt(m)}月`;
  });

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "支出合計",
            data: data.map((d) => d.total),
            backgroundColor: "#3b82f6",
            borderRadius: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ¥${(ctx.raw as number).toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => `¥${Number(v).toLocaleString()}`,
            },
          },
        },
      }}
    />
  );
}
