# Project: Lore Keeper AI (仮) - 企画・要件定義書

## 1. プロダクト概要
**コンセプト:**
「断片的なメモを、矛盾のない『世界設定』へと昇華させるAIアシスタント」
TRPGのGM（ゲームマスター）や創作・小説執筆者向けに、単なるデータ管理ではなく、AIが「壁打ち相手」兼「書記」となって世界観構築を支援するWebアプリケーション。

**ターゲット:**
* TRPGのGM（シナリオ準備の負担を減らしたい）
* 一次創作の小説家・脚本家（設定の矛盾に悩みたくない）
* 世界観設定を作るのが好きなクリエイター

**競合優位性:**
既存のメモツール（Notion/Obsidian）は「入力したことしか記録できない」が、本ツールはAIが「行間を埋め、矛盾を指摘し、可視化する」点で差別化する。

---

## 2. コア機能（MVP: Minimum Viable Product）

### ① 設定深掘り生成 (Deep-Dive Generator)
ユーザーの短い入力から、AIが詳細設定を拡張・提案する機能。
* **User Action:** 「名前：アルド、種族：エルフ、職業：パン屋、性格：頑固」といった断片情報を入力。
* **System Action:** 上記を元に、「頑固になった背景（過去のエピソード）」「店の看板メニュー」「街での評判」などを数パターン自動生成して提案する。
* **Value:** 創作における「アイデア出し（0→1）」の苦痛を取り除く。

### ② 世界観の整合性チェック (Consistency Checker)
RAG（検索拡張生成）技術を用い、設定の矛盾を検知する機能。
* **User Action:** 新しい設定（例：「エルフは肉食を忌避する」）を追加。
* **System Action:** データベース内の過去ログを検索し、矛盾がある場合に警告を出す（例：「警告：キャラクター『アルド』は『ミートパイが得意』と設定済みです。種族設定と矛盾する可能性があります」）。
* **Value:** 長期キャンペーンや長編作品における設定崩壊（Lore Breaking）を防ぐ。

### ③ 相関図の自動可視化 (Dynamic Relation Map)
テキスト情報から人間関係のグラフを自動描画する機能。
* **User Action:** 「AはBの師匠」「BはCと敵対」などのテキストデータを入力・保存。
* **System Action:** React Flow等のライブラリを用い、ノード（人物）とエッジ（関係性）で繋がれた相関図をリアルタイムで描画・更新する。
* **Value:** 複雑化する人間関係を視覚的に整理し、直感的な把握を助ける。

---

## 3. 技術スタック案

### Frontend
* **Framework:** Next.js (TypeScript)
* **UI Component:** Tailwind CSS + Shadcn/ui
* **Visualization:** React Flow (相関図用)

### Backend API
* **Language:** Go (Gin or Echo framework)
* **Role:** APIエンドポイントの提供、ビジネスロジック、AIサービスへのプロンプト制御

### Database & Infrastructure
* **DB:** PostgreSQL (Supabase)
    * Relational Data: キャラクター基本情報、ユーザー情報
    * Vector Data (pgvector): RAG用の設定埋め込みベクトル
* **Auth:** Supabase Auth

### AI / LLM
* **Model:** Anthropic Claude 3.5 Sonnet (推奨) or OpenAI GPT-4o
* **Reason:** 文芸・創作表現における自然さと、複雑な文脈理解に優れているため。

---

## 4. 開発ロードマップ（概算）

* **Phase 1 (Month 1):**
    * 環境構築 (Go/Next.js/Supabase)
    * DBスキーマ設計
    * 「深掘り生成」機能のプロトタイプ実装
* **Phase 2 (Month 2):**
    * 相関図（React Flow）の実装
    * RAG（整合性チェック）の組み込み
* **Phase 3 (Month 3):**
    * UIブラッシュアップ
    * β版リリース（SNS等でのテストユーザー募集）