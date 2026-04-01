import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "画像ファイルが必要です" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    // 画像をbase64のデータURLとして保存（ファイル保存不要）
    const imageUrl = `data:${mimeType};base64,${base64}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      `この画像（レシート・食材・請求書・明細書など）を解析し、以下の情報をJSON形式で返してください。
情報が読み取れない場合はnullを返してください。

{
  "storeName": "店名または請求元（文字列またはnull）",
  "date": "日付（YYYY-MM-DD形式またはnull）",
  "totalAmount": 合計金額（数値またはnull）,
  "items": [
    { "name": "品目名", "amount": 金額（数値） }
  ],
  "category": "カテゴリ（食費/外食/日用品/交通費/光熱費/通信費/医療費/娯楽/その他 のいずれか）",
  "memo": "その他の補足情報（文字列またはnull）"
}

JSONのみを返してください。説明や追加テキストは不要です。`,
    ]);

    const text = result.response.text();

    let analysisResult;
    try {
      const jsonText = text.trim().replace(/^```json\n?|\n?```$/g, "");
      analysisResult = JSON.parse(jsonText);
    } catch {
      analysisResult = {
        storeName: null,
        date: null,
        totalAmount: null,
        items: [],
        category: "その他",
        memo: null,
      };
    }

    return NextResponse.json({ ...analysisResult, imageUrl });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "画像の解析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
