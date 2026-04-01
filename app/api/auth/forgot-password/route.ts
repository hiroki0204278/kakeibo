import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "メールアドレスを入力してください" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // ユーザーが存在しない場合も成功メッセージを返す（セキュリティのため）
    if (!user) {
      return NextResponse.json({
        message: "メールを送信しました（登録済みの場合）",
      });
    }

    // 既存のトークンを削除
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // 新しいトークンを生成
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1時間有効

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "【家計簿アプリ】パスワードリセット",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2563eb;">パスワードリセット</h2>
          <p>以下のボタンをクリックして、パスワードを再設定してください。</p>
          <p>このリンクは<strong>1時間</strong>有効です。</p>
          <a href="${resetUrl}"
            style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            パスワードを再設定する
          </a>
          <p style="color:#888;font-size:12px;">
            このメールに心当たりがない場合は無視してください。
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "パスワードリセット用のメールを送信しました",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "メール送信中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
