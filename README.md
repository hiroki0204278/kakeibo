# 家計簿アプリ

AIがレシート・請求書・食材の写真を自動解析して家計簿に記録するWebアプリです。

## 機能

- **AI画像解析**: レシートや請求書の写真をアップロードするだけで店名・日付・金額・品目を自動入力
- **カテゴリ管理**: 食費・外食・日用品・交通費・光熱費・通信費・医療費・娯楽・その他
- **月別フィルタリング**: 月ごとの支出一覧を確認
- **グラフ表示**: カテゴリ別円グラフ・月別棒グラフ
- **予算管理**: カテゴリごとに予算を設定、80%/100%超過アラート
- **レスポンシブ**: スマートフォン・PC対応

## セットアップ手順

### 1. 前提条件

- Node.js 18以上
- PostgreSQL（ローカルまたはクラウド）
- Anthropic APIキー（[console.anthropic.com](https://console.anthropic.com)で取得）

### 2. 依存関係のインストール

```bash
cd kakeibo
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env`を編集して各値を設定します：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/kakeibo?schema=public"
NEXTAUTH_SECRET="ランダムな文字列（openssl rand -base64 32 で生成）"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."
```

### 4. データベースの初期化

```bash
# Prismaクライアントの生成
npm run db:generate

# データベースにスキーマを反映
npm run db:push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリが起動します。

## 本番ビルド

```bash
npm run build
npm start
```

## データベース管理

```bash
# Prisma Studioでデータを確認
npm run db:studio
```

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 14 (App Router) |
| スタイリング | Tailwind CSS |
| 認証 | NextAuth.js |
| ORM | Prisma |
| データベース | PostgreSQL |
| AI解析 | Anthropic Claude API |
| グラフ | Chart.js + react-chartjs-2 |
| ファイルアップロード | react-dropzone + ローカル保存 |
