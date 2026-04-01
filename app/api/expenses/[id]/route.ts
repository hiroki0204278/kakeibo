import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await request.json();
    const { date, amount, category, storeName, memo, imageUrl, items } = body;

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
    });

    if (!expense || expense.userId !== userId) {
      return NextResponse.json(
        { error: "支出が見つかりません" },
        { status: 404 }
      );
    }

    const updated = await prisma.expense.update({
      where: { id: params.id },
      data: {
        date: date ? new Date(date) : undefined,
        amount: amount ? parseFloat(amount) : undefined,
        category: category || undefined,
        storeName: storeName ?? undefined,
        memo: memo ?? undefined,
        imageUrl: imageUrl ?? undefined,
        items: items ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "更新中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const expense = await prisma.expense.findUnique({
    where: { id: params.id },
  });

  if (!expense || expense.userId !== userId) {
    return NextResponse.json(
      { error: "支出が見つかりません" },
      { status: 404 }
    );
  }

  await prisma.expense.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
