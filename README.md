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
2. SQL Editorで `init.sql` を実行してテーブルを作成
3. プロジェクトのURL、Anon Key、Service Role Keyを取得

### 2. バックエンドのセットアップ

```bash
cd backend
cp .env.example .env
# .envファイルを編集して環境変数を設定
```

`.env` の内容:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-api-key
PORT=8080
```

依存関係のインストールと起動:
```bash
go mod download
go run cmd/api/main.go
```

### 3. フロントエンドのセットアップ

```bash
cd frontend
cp .env.local.example .env.local
# .env.localファイルを編集して環境変数を設定
```

`.env.local` の内容:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
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
├── backend/
│   ├── cmd/api/          # エントリーポイント
│   ├── internal/
│   │   ├── handlers/     # HTTPハンドラー
│   │   ├── models/       # データモデル
│   │   ├── services/     # ビジネスロジック
│   │   ├── database/     # DB接続
│   │   └── middleware/   # 認証など
│   └── go.mod
├── frontend/
│   ├── app/              # Next.js App Router
│   │   ├── campaigns/    # キャンペーン管理
│   │   └── login/        # 認証
│   ├── lib/              # ユーティリティ
│   └── components/       # 共通コンポーネント
├── init.sql              # データベース初期化
├── er.md                 # ER図
└── plan.md               # プロジェクト計画

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

## ライセンス

MIT
Lore Keeper
