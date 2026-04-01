import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  const budgets = await prisma.budget.findMany({
    where: { userId, ...(month ? { month } : {}) },
  });

  return NextResponse.json(budgets);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { category, amount, month } = await request.json();

    if (!category || !amount || !month) {
      return NextResponse.json(
        { error: "カテゴリ・金額・月は必須です" },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.upsert({
      where: { userId_category_month: { userId, category, month } },
      update: { amount: parseFloat(amount) },
      create: { userId, category, amount: parseFloat(amount), month },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "保存中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
