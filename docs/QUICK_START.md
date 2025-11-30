# Lore Keeper AI - クイックスタートガイド

## 前提条件

- Go 1.22+
- Node.js 20+
- pnpm
- Supabaseアカウント
- Anthropic APIキー

## セットアップ（5分）

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで `database/init.sql` を実行
3. Settings > API から以下を取得:
   - Project URL
   - Publishable Key (anon public)
   - Service Role Key

### 2. バックエンドの起動

```bash
cd backend
cp .env.example .env
# .envを編集して以下を設定:
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
# ANTHROPIC_API_KEY=sk-ant-xxx...

go mod download
go run cmd/api/main.go
```

バックエンドが `http://localhost:8080` で起動します。

### 3. フロントエンドの起動

```bash
cd frontend
cp .env.local.example .env.local
# .env.localを編集して以下を設定:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
# NEXT_PUBLIC_API_URL=http://localhost:8080

pnpm install
pnpm dev
```

フロントエンドが `http://localhost:3000` で起動します。

### 4. アカウント作成

1. ブラウザで `http://localhost:3000` を開く
2. 「ログイン」をクリック
3. 「アカウントをお持ちでない方はこちら」をクリック
4. メールアドレスとパスワードを入力
5. 確認メールを確認（開発環境では Supabase Dashboard > Authentication > Users で確認リンクを取得）
6. リンクをクリックしてアカウントを有効化

### 5. 使い始める

1. ログイン
2. 「新規作成」でキャンペーンを作成
3. キャラクター、世界設定、相関図を追加

## トラブルシューティング

### バックエンドが起動しない

```bash
# Goのバージョン確認
go version  # 1.22以上

# 依存関係の再インストール
cd backend
rm go.sum
go mod tidy
go mod download
```

### フロントエンドが起動しない

```bash
# Node.jsのバージョン確認
node --version  # 20以上

# 依存関係の再インストール
cd frontend
rm -rf node_modules .next
pnpm install
```

### CORSエラーが発生する

1. バックエンドを再起動
2. ブラウザのキャッシュをクリア（Ctrl+Shift+R / Cmd+Shift+R）
3. `CORS_FIX_SUMMARY.md` を参照

### ログインできない

1. メールアドレスが確認済みか確認
2. Supabase Dashboard > Authentication > Users でユーザー状態を確認
3. パスワードが6文字以上か確認

### メールが届かない

開発環境では、Supabase Dashboard > Authentication > Users > ユーザーを選択 > "Send confirmation email" でリンクを確認できます。

本番環境では、`SUPABASE_EMAIL_SETUP.md` を参照してSMTP設定を行ってください。

## 次のステップ

- `SUPABASE_SETUP_CHECKLIST.md` - 完全なセットアップガイド
- `SUPABASE_EMAIL_SETUP.md` - メール送信の設定
- `AUTH_FIX_SUMMARY.md` - 認証の仕組み
- `CORS_FIX_SUMMARY.md` - CORS設定の詳細

## 開発Tips

### バックエンドのホットリロード

```bash
# Air（ホットリロードツール）をインストール
go install github.com/cosmtrek/air@latest

# バックエンドディレクトリで実行
cd backend
air
```

### フロントエンドのビルド

```bash
cd frontend
pnpm build
pnpm start  # 本番モードで起動
```

### データベースのリセット

```bash
# Supabase Dashboard > SQL Editor で実行
DROP TABLE IF EXISTS lore_entries CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;

# その後、init.sql を再実行
```

## 本番環境へのデプロイ

### バックエンド

推奨: Railway, Render, Fly.io

```bash
# Dockerfileを作成（例）
FROM golang:1.22-alpine
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o main cmd/api/main.go
CMD ["./main"]
```

### フロントエンド

推奨: Vercel, Netlify

```bash
# Vercelへのデプロイ
cd frontend
vercel
```

環境変数を設定:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_URL`

### 本番環境チェックリスト

- [ ] Supabase SMTP設定（Resend推奨）
- [ ] 環境変数の設定
- [ ] CORS設定の確認
- [ ] HTTPS の有効化
- [ ] データベースバックアップの設定
- [ ] エラーログの監視設定

## サポート

問題が発生した場合:

1. 各種ドキュメントを確認
2. GitHub Issuesで報告
3. ログを確認（バックエンド、フロントエンド、Supabase）

## ライセンス

MIT
