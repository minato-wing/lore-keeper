# プロジェクト構造

## ディレクトリ構成

```
lore-keeper/
├── backend/              # Go + Gin バックエンド
│   ├── cmd/
│   │   └── api/          # エントリーポイント (main.go)
│   ├── internal/         # 内部パッケージ
│   │   ├── handlers/     # HTTPハンドラー (campaigns, characters, etc.)
│   │   ├── models/       # データモデル定義
│   │   ├── services/     # ビジネスロジック (AI統合など)
│   │   ├── database/     # Supabaseクライアント
│   │   └── middleware/   # 認証ミドルウェア
│   ├── pkg/              # 公開パッケージ
│   │   └── utils/        # ユーティリティ関数
│   ├── go.mod            # Go依存関係
│   ├── go.sum            # Go依存関係ロックファイル
│   └── .env.example      # 環境変数テンプレート
│
├── frontend/             # Next.js + TypeScript フロントエンド
│   ├── app/              # Next.js App Router
│   │   ├── campaigns/    # キャンペーン管理ページ
│   │   │   ├── page.tsx  # キャンペーン一覧
│   │   │   └── [id]/     # キャンペーン詳細・サブページ
│   │   ├── auth/         # 認証関連ページ
│   │   │   ├── callback/ # メール確認コールバック
│   │   │   └── confirm/  # メール確認待ち
│   │   ├── login/        # ログイン・サインアップ
│   │   ├── layout.tsx    # ルートレイアウト
│   │   ├── page.tsx      # ホームページ
│   │   └── globals.css   # グローバルスタイル
│   ├── components/       # 共通コンポーネント
│   │   └── AuthGuard.tsx # 認証保護コンポーネント
│   ├── lib/              # ユーティリティ
│   │   ├── api.ts        # API クライアント
│   │   └── supabase.ts   # Supabase クライアント
│   ├── middleware.ts     # Next.js ミドルウェア
│   ├── package.json      # npm依存関係
│   ├── pnpm-lock.yaml    # pnpm依存関係ロックファイル
│   ├── tsconfig.json     # TypeScript設定
│   ├── next.config.ts    # Next.js設定
│   ├── tailwind.config.ts # Tailwind CSS設定
│   └── .env.local.example # 環境変数テンプレート
│
├── database/             # データベース関連ファイル
│   ├── init.sql          # データベース初期化SQL
│   └── email-templates.sql # メールテンプレート設定
│
├── docs/                 # ドキュメント
│   ├── README.md         # ドキュメント一覧
│   ├── QUICK_START.md    # クイックスタートガイド
│   ├── plan.md           # プロジェクト計画
│   ├── er.md             # ER図
│   ├── IMPLEMENTATION_STATUS.md # 実装状況
│   ├── SUPABASE_SETUP_CHECKLIST.md # Supabase設定
│   ├── SUPABASE_EMAIL_SETUP.md # メール設定
│   ├── AUTH_FIX_SUMMARY.md # 認証修正
│   ├── CORS_FIX_SUMMARY.md # CORS修正
│   ├── USER_ID_AUTH_FIX.md # user_id認証修正
│   ├── CONTEXT_VALUE_FIX.md # Context値取得修正
│   └── EMAIL_IMPLEMENTATION_SUMMARY.md # メール実装
│
├── scripts/              # ユーティリティスクリプト
│   └── test-cors.sh      # CORSテストスクリプト
│
├── .devcontainer/        # Dev Container設定
│   ├── devcontainer.json # Dev Container設定
│   └── Dockerfile        # コンテナイメージ定義
│
├── .gitignore            # Git除外設定
└── README.md             # プロジェクト概要
```

## ディレクトリの役割

### `/backend` - バックエンド

Go言語で実装されたRESTful APIサーバー。

**主要ファイル:**
- `cmd/api/main.go` - アプリケーションのエントリーポイント
- `internal/handlers/` - 各エンドポイントのハンドラー
- `internal/middleware/auth.go` - JWT認証ミドルウェア
- `internal/services/ai_service.go` - Claude API統合
- `pkg/utils/context.go` - コンテキスト値取得ユーティリティ

**技術スタック:**
- Gin (Webフレームワーク)
- Supabase Go SDK (データベース・認証)
- Anthropic Claude API (AI機能)

### `/frontend` - フロントエンド

Next.js (App Router) で実装されたWebアプリケーション。

**主要ファイル:**
- `app/page.tsx` - ホームページ
- `app/login/page.tsx` - ログイン・サインアップ
- `app/campaigns/page.tsx` - キャンペーン一覧
- `components/AuthGuard.tsx` - 認証保護
- `lib/api.ts` - バックエンドAPIクライアント
- `lib/supabase.ts` - Supabase認証クライアント

**技術スタック:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Flow (相関図可視化)
- Supabase JS SDK (認証)

### `/database` - データベース

データベース関連のSQLファイル。

**ファイル:**
- `init.sql` - テーブル定義、RLS設定、インデックス
- `email-templates.sql` - メールテンプレート設定例

**使用方法:**
1. Supabase Dashboard > SQL Editor
2. `init.sql` の内容をコピー＆ペースト
3. "Run" をクリック

### `/docs` - ドキュメント

プロジェクトの詳細なドキュメント。

**カテゴリ:**
- **セットアップガイド**: QUICK_START.md, SUPABASE_SETUP_CHECKLIST.md
- **設計ドキュメント**: plan.md, er.md
- **技術ドキュメント**: 各種修正サマリー
- **実装状況**: IMPLEMENTATION_STATUS.md

### `/scripts` - スクリプト

開発・テスト用のユーティリティスクリプト。

**スクリプト:**
- `test-cors.sh` - CORS設定のテストスクリプト

**使用方法:**
```bash
./scripts/test-cors.sh [API_URL] [ORIGIN]
```

### `/.devcontainer` - Dev Container

Gitpod/VS Code Dev Container の設定。

**ファイル:**
- `devcontainer.json` - Dev Container設定
- `Dockerfile` - Go, Node.js, PostgreSQLクライアントをインストール

## ファイル命名規則

### バックエンド (Go)

- **パッケージ名**: 小文字、単数形 (`handler`, `model`, `service`)
- **ファイル名**: スネークケース (`campaigns.go`, `auth_middleware.go`)
- **関数名**: パスカルケース (`GetCampaigns`, `CreateCharacter`)
- **変数名**: キャメルケース (`userID`, `campaignID`)

### フロントエンド (TypeScript)

- **コンポーネント**: パスカルケース (`AuthGuard.tsx`, `CampaignsPage.tsx`)
- **ユーティリティ**: キャメルケース (`api.ts`, `supabase.ts`)
- **関数名**: キャメルケース (`getCampaigns`, `createCharacter`)
- **変数名**: キャメルケース (`userId`, `campaignId`)

### ドキュメント

- **ファイル名**: 大文字スネークケース (`QUICK_START.md`, `USER_ID_AUTH_FIX.md`)
- **例外**: 設計ドキュメントは小文字 (`plan.md`, `er.md`)

## 環境変数

### バックエンド (`.env`)

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
ANTHROPIC_API_KEY=sk-ant-xxx...
PORT=8080
```

### フロントエンド (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 依存関係管理

### バックエンド

```bash
# 依存関係の追加
go get github.com/package/name

# 依存関係の更新
go get -u ./...

# 未使用の依存関係を削除
go mod tidy
```

### フロントエンド

```bash
# 依存関係の追加
pnpm add package-name

# 依存関係の更新
pnpm update

# 依存関係のインストール
pnpm install
```

## ビルド・実行

### バックエンド

```bash
# 開発モード
cd backend
go run cmd/api/main.go

# ビルド
go build -o bin/api cmd/api/main.go

# 実行
./bin/api
```

### フロントエンド

```bash
# 開発モード
cd frontend
pnpm dev

# ビルド
pnpm build

# 本番モード
pnpm start
```

## テスト

### バックエンド

```bash
# すべてのテストを実行
go test ./...

# カバレッジ付き
go test -cover ./...

# 特定のパッケージ
go test ./internal/handlers
```

### フロントエンド

```bash
# テストを実行（未実装）
pnpm test

# 型チェック
pnpm tsc --noEmit

# リント
pnpm lint
```

## デプロイ

### バックエンド

推奨プラットフォーム:
- Railway
- Render
- Fly.io

### フロントエンド

推奨プラットフォーム:
- Vercel (推奨)
- Netlify

## 開発ワークフロー

1. **機能開発**
   - ブランチを作成
   - コードを実装
   - ローカルでテスト

2. **コミット**
   - 変更をステージング
   - 意味のあるコミットメッセージ
   - Co-authored-by: Ona <no-reply@ona.com>

3. **プルリクエスト**
   - 変更内容を説明
   - レビューを依頼
   - マージ

4. **ドキュメント更新**
   - 新機能: ドキュメントを追加
   - バグ修正: トラブルシューティングを更新
   - 設定変更: セットアップガイドを更新

## まとめ

このプロジェクト構造は、以下の原則に基づいています:

- **関心の分離**: バックエンド、フロントエンド、ドキュメントを明確に分離
- **スケーラビリティ**: 機能追加が容易な構造
- **保守性**: 一貫した命名規則とディレクトリ構造
- **ドキュメント重視**: 詳細なドキュメントで開発を支援

詳細は各ディレクトリのREADMEやドキュメントを参照してください。
