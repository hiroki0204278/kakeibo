import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const budget = await prisma.budget.findUnique({ where: { id: params.id } });

  if (!budget || budget.userId !== userId) {
    return NextResponse.json(
      { error: "予算が見つかりません" },
      { status: 404 }
    );
  }

  await prisma.budget.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
