# Lore Keeper AI

断片的なメモを、矛盾のない『世界設定』へと昇華させるAIアシスタント

TRPGのGMや創作・小説執筆者向けに、AIが「壁打ち相手」兼「書記」となって世界観構築を支援するWebアプリケーション。

## 主要機能

### 1. 設定深掘り生成 (Deep-Dive Generator)
- 短い入力から、AIが詳細設定を拡張・提案
- Claude 3.5 Sonnetによる自然な創作表現

### 2. 世界観の整合性チェック (Consistency Checker)
- RAG技術を用いた設定の矛盾検知
- 長期キャンペーンや長編作品における設定崩壊を防止

### 3. 相関図の自動可視化 (Dynamic Relation Map)
- React Flowによる人間関係のグラフ描画
- リアルタイムで更新される視覚的な相関図

## 技術スタック

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: React Flow
- **Icons**: Lucide React

### Backend
- **Language**: Go 1.22
- **Framework**: Gin
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **AI**: Anthropic Claude 3.5 Sonnet

## セットアップ

### 前提条件
- Go 1.22+
- Node.js 20+
- pnpm
- Supabaseアカウント
- Anthropic APIキー

### 1. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで `database/init.sql` を実行してテーブルを作成
3. プロジェクトの認証情報を取得:
   - **Project URL**: Settings > API > Project URL
   - **Publishable Key** (フロントエンド用): Settings > API > Project API keys > anon public
   - **Service Role Key** (バックエンド用): Settings > API > Project API keys > service_role (⚠️ 秘密鍵として扱う)

4. **メール送信の設定** (重要):
   
   **開発環境:**
   - Supabaseの組み込みメール機能が自動的に有効
   - 1時間あたり4通まで送信可能
   - Dashboard > Authentication > Users でメール確認リンクを確認可能
   
   **本番環境 (推奨: Resend):**
   1. [Resend](https://resend.com)でアカウント作成（無料枠: 月3,000通）
   2. API Keyを取得
   3. Supabase Dashboard > Project Settings > Auth > SMTP Settings で設定:
      ```
      Enable Custom SMTP: ON
      Host: smtp.resend.com
      Port: 587
      Username: resend
      Password: re_xxxxxxxxxxxxx (Resend API Key)
      Sender email: noreply@yourdomain.com
      Sender name: Lore Keeper AI
      ```
   4. Authentication > Email Templates でテンプレートをカスタマイズ
   
   詳細は `SUPABASE_EMAIL_SETUP.md` と `email-templates.sql` を参照してください。

### 2. バックエンドのセットアップ

```bash
cd backend
cp .env.example .env
# .envファイルを編集して環境変数を設定
```

`.env` の内容:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-api-key
PORT=8080
```

依存関係のインストールと起動:
```bash
go mod download
go run cmd/api/main.go
```

**CORS設定:**
バックエンドは以下のオリジンを自動的に許可します:
- `http://localhost:3000`
- `http://localhost:3001`
- `*.gitpod.io`
- `*gitpod.dev`

追加のオリジンを許可する場合は、`backend/cmd/api/main.go` の `AllowOriginFunc` を編集してください。

### 3. フロントエンドのセットアップ

```bash
cd frontend
cp .env.local.example .env.local
# .env.localファイルを編集して環境変数を設定
```

`.env.local` の内容:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_API_URL=http://localhost:8080
```

依存関係のインストールと起動:
```bash
pnpm install
pnpm dev
```

### 4. アクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8080

## プロジェクト構造

```
lore-keeper/
├── backend/              # Go + Gin バックエンド
│   ├── cmd/api/          # エントリーポイント
│   ├── internal/
│   │   ├── handlers/     # HTTPハンドラー
│   │   ├── models/       # データモデル
│   │   ├── services/     # ビジネスロジック
│   │   ├── database/     # DB接続
│   │   └── middleware/   # 認証など
│   ├── pkg/utils/        # ユーティリティ
│   └── go.mod
├── frontend/             # Next.js + TypeScript フロントエンド
│   ├── app/              # Next.js App Router
│   │   ├── campaigns/    # キャンペーン管理
│   │   ├── auth/         # 認証コールバック
│   │   └── login/        # ログイン
│   ├── lib/              # ユーティリティ
│   └── components/       # 共通コンポーネント
├── database/             # データベース関連
│   ├── init.sql          # データベース初期化
│   └── email-templates.sql # メールテンプレート
├── docs/                 # ドキュメント
│   ├── README.md         # ドキュメント一覧
│   ├── QUICK_START.md    # クイックスタート
│   ├── plan.md           # プロジェクト計画
│   ├── er.md             # ER図
│   └── ...               # その他のドキュメント
├── scripts/              # ユーティリティスクリプト
│   └── test-cors.sh      # CORSテストスクリプト
└── README.md             # このファイル
```

## API エンドポイント

### 認証
すべてのAPIエンドポイントは `Authorization: Bearer <token>` ヘッダーが必要

### キャンペーン
- `GET /api/campaigns` - キャンペーン一覧
- `GET /api/campaigns/:id` - キャンペーン詳細
- `POST /api/campaigns` - キャンペーン作成
- `PUT /api/campaigns/:id` - キャンペーン更新
- `DELETE /api/campaigns/:id` - キャンペーン削除

### キャラクター
- `GET /api/characters?campaign_id=<id>` - キャラクター一覧
- `GET /api/characters/:id` - キャラクター詳細
- `POST /api/characters` - キャラクター作成
- `PUT /api/characters/:id` - キャラクター更新
- `DELETE /api/characters/:id` - キャラクター削除

### 関係性
- `GET /api/relationships?campaign_id=<id>` - 関係性一覧
- `POST /api/relationships` - 関係性作成
- `PUT /api/relationships/:id` - 関係性更新
- `DELETE /api/relationships/:id` - 関係性削除

### 世界設定
- `GET /api/lore-entries?campaign_id=<id>` - 設定一覧
- `GET /api/lore-entries/:id` - 設定詳細
- `POST /api/lore-entries` - 設定作成
- `PUT /api/lore-entries/:id` - 設定更新
- `DELETE /api/lore-entries/:id` - 設定削除

### AI機能
- `POST /api/ai/deep-dive` - 設定深掘り生成
- `POST /api/ai/consistency-check` - 整合性チェック

## 開発ロードマップ

- [x] Phase 1: 基本機能実装
  - [x] 環境構築
  - [x] DBスキーマ設計
  - [x] CRUD API実装
  - [x] 深掘り生成機能
  - [x] 整合性チェック機能
  - [x] 相関図可視化
- [ ] Phase 2: 機能拡張
  - [ ] ベクトル検索の実装
  - [ ] リアルタイム更新
  - [ ] エクスポート機能
- [ ] Phase 3: β版リリース
  - [ ] UIブラッシュアップ
  - [ ] パフォーマンス最適化
  - [ ] テストユーザー募集

## 📚 ドキュメント

詳細なドキュメントは `docs/` ディレクトリにあります：

### セットアップガイド
- [QUICK_START.md](docs/QUICK_START.md) - クイックスタートガイド
- [SUPABASE_SETUP_CHECKLIST.md](docs/SUPABASE_SETUP_CHECKLIST.md) - Supabase設定チェックリスト
- [SUPABASE_EMAIL_SETUP.md](docs/SUPABASE_EMAIL_SETUP.md) - メール送信設定ガイド

### 技術ドキュメント
- [plan.md](docs/plan.md) - プロジェクト計画
- [er.md](docs/er.md) - ER図
- [IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) - 実装状況

### トラブルシューティング
- [AUTH_FIX_SUMMARY.md](docs/AUTH_FIX_SUMMARY.md) - 認証修正サマリー
- [CORS_FIX_SUMMARY.md](docs/CORS_FIX_SUMMARY.md) - CORS修正サマリー
- [USER_ID_AUTH_FIX.md](docs/USER_ID_AUTH_FIX.md) - user_id認証修正サマリー
- [CONTEXT_VALUE_FIX.md](docs/CONTEXT_VALUE_FIX.md) - Context値取得の修正
- [EMAIL_IMPLEMENTATION_SUMMARY.md](docs/EMAIL_IMPLEMENTATION_SUMMARY.md) - メール実装サマリー

## ライセンス

MIT
Lore Keeper
