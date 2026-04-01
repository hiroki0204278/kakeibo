import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // "YYYY-MM"

  const userId = (session.user as { id: string }).id;

  let dateFilter = {};
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    dateFilter = { date: { gte: start, lt: end } };
  }

  const expenses = await prisma.expense.findMany({
    where: { userId, ...dateFilter },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await request.json();
    const { date, amount, category, storeName, memo, imageUrl, items } = body;

    if (!date || !amount || !category) {
      return NextResponse.json(
        { error: "日付・金額・カテゴリは必須です" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        date: new Date(date),
        amount: parseFloat(amount),
        category,
        storeName: storeName || null,
        memo: memo || null,
        imageUrl: imageUrl || null,
        items: items || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "保存中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
