import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import DashboardClient from "@/app/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [expenses, budgets] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
    }),
    prisma.budget.findMany({ where: { userId, month } }),
  ]);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <DashboardClient
          expenses={JSON.parse(JSON.stringify(expenses))}
          budgets={JSON.parse(JSON.stringify(budgets))}
          totalExpense={totalExpense}
          month={month}
          userName={session.user.name || ""}
        />
      </main>
    </div>
  );
}
