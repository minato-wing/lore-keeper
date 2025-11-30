# Lore Keeper AI - ドキュメント

このディレクトリには、Lore Keeper AI プロジェクトの詳細なドキュメントが含まれています。

## 📖 ドキュメント一覧

### 🚀 セットアップガイド

#### [QUICK_START.md](QUICK_START.md)
5分で始められるクイックスタートガイド。環境構築からアカウント作成までの手順を説明。

**対象**: 初めてプロジェクトをセットアップする方

**内容**:
- 前提条件
- バックエンド・フロントエンドの起動方法
- アカウント作成
- トラブルシューティング

---

#### [SUPABASE_SETUP_CHECKLIST.md](SUPABASE_SETUP_CHECKLIST.md)
Supabaseプロジェクトの完全なセットアップチェックリスト。

**対象**: Supabaseの設定を行う方

**内容**:
- プロジェクト作成
- データベース初期化
- 認証設定
- メール送信設定
- API Keys取得
- 環境変数設定
- RLS確認
- テスト手順

---

#### [SUPABASE_EMAIL_SETUP.md](SUPABASE_EMAIL_SETUP.md)
メール送信機能の詳細な設定ガイド。

**対象**: メール送信を設定する方

**内容**:
- Supabase組み込みメール（開発用）
- カスタムSMTP設定（本番用）
- 推奨サービス（Resend, SendGrid）
- メールテンプレートのカスタマイズ
- トラブルシューティング

---

### 📋 プロジェクト設計

#### [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
プロジェクトのディレクトリ構造と各ファイルの役割。

**対象**: プロジェクト構造を理解したい方

**内容**:
- ディレクトリ構成
- 各ディレクトリの役割
- ファイル命名規則
- 環境変数
- 依存関係管理
- ビルド・実行方法
- デプロイ方法

---

#### [plan.md](plan.md)
プロジェクトの企画・要件定義書。

**内容**:
- プロダクト概要
- コア機能
- 技術スタック
- 開発ロードマップ

---

#### [er.md](er.md)
データベースのER図（Entity-Relationship Diagram）。

**内容**:
- テーブル構造
- リレーションシップ
- カラム定義

---

#### [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)
プロジェクトの実装状況と進捗管理。

**内容**:
- 完了した機能
- 未実装の機能
- 技術的負債
- 既知の問題
- 次のステップ
- 成功指標
- 変更履歴

---

### 🔧 技術ドキュメント

#### [AUTH_FIX_SUMMARY.md](AUTH_FIX_SUMMARY.md)
認証フローとリダイレクト問題の修正サマリー。

**対象**: 認証の仕組みを理解したい方

**内容**:
- 問題の原因
- Supabaseセッション管理
- AuthGuardコンポーネント
- ログイン処理の修正
- API呼び出しの修正
- 認証フロー
- テスト方法

---

#### [CORS_FIX_SUMMARY.md](CORS_FIX_SUMMARY.md)
CORS（Cross-Origin Resource Sharing）エラーの修正サマリー。

**対象**: CORSエラーに遭遇した方

**内容**:
- 問題の原因
- CORS設定の改善
- 認証ミドルウェアの修正
- プリフライトリクエストの仕組み
- テスト方法
- トラブルシューティング
- 本番環境での設定

---

#### [USER_ID_AUTH_FIX.md](USER_ID_AUTH_FIX.md)
user_id認証処理の修正サマリー。

**対象**: バックエンドの認証・認可を理解したい方

**内容**:
- 問題の原因
- 認証ミドルウェアの改善
- 全ハンドラーでの権限チェック
- セキュリティの改善
- 認証フロー
- データアクセスパターン
- テスト方法
- ベストプラクティス

---

#### [CONTEXT_VALUE_FIX.md](CONTEXT_VALUE_FIX.md)
Gin Context値取得の正しい方法。

**対象**: Ginフレームワークを使用する開発者

**内容**:
- 問題の原因（`c.GetString()` vs `c.Get()`）
- 正しい取得方法
- ユーティリティ関数の作成
- Gin Contextメソッドの違い
- テスト方法
- ベストプラクティス

---

#### [EMAIL_IMPLEMENTATION_SUMMARY.md](EMAIL_IMPLEMENTATION_SUMMARY.md)
メール送信機能の実装サマリー。

**対象**: メール機能の実装を理解したい方

**内容**:
- 実装内容
- 変更されたファイル
- メール送信フロー
- 設定方法
- テスト方法
- トラブルシューティング

---

## 📂 ドキュメント構成

```
docs/
├── README.md                          # このファイル
├── QUICK_START.md                     # クイックスタート
├── SUPABASE_SETUP_CHECKLIST.md        # Supabase設定
├── SUPABASE_EMAIL_SETUP.md            # メール設定
├── plan.md                            # プロジェクト計画
├── er.md                              # ER図
├── IMPLEMENTATION_STATUS.md           # 実装状況
├── AUTH_FIX_SUMMARY.md                # 認証修正
├── CORS_FIX_SUMMARY.md                # CORS修正
├── USER_ID_AUTH_FIX.md                # user_id認証修正
├── CONTEXT_VALUE_FIX.md               # Context値取得修正
└── EMAIL_IMPLEMENTATION_SUMMARY.md    # メール実装
```

## 🎯 用途別ガイド

### 初めてセットアップする場合

1. [QUICK_START.md](QUICK_START.md) - 全体の流れを把握
2. [SUPABASE_SETUP_CHECKLIST.md](SUPABASE_SETUP_CHECKLIST.md) - Supabaseを設定
3. [SUPABASE_EMAIL_SETUP.md](SUPABASE_EMAIL_SETUP.md) - メール送信を設定

### エラーが発生した場合

1. [QUICK_START.md](QUICK_START.md) の「トラブルシューティング」セクション
2. 該当するエラーの修正サマリーを参照:
   - 認証エラー → [AUTH_FIX_SUMMARY.md](AUTH_FIX_SUMMARY.md)
   - CORSエラー → [CORS_FIX_SUMMARY.md](CORS_FIX_SUMMARY.md)
   - user_idエラー → [USER_ID_AUTH_FIX.md](USER_ID_AUTH_FIX.md)
   - メールエラー → [EMAIL_IMPLEMENTATION_SUMMARY.md](EMAIL_IMPLEMENTATION_SUMMARY.md)

### 開発に参加する場合

1. [plan.md](plan.md) - プロジェクトの目的と方向性を理解
2. [er.md](er.md) - データベース構造を理解
3. [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - 実装状況を確認
4. 技術ドキュメントで実装の詳細を理解

### 本番環境にデプロイする場合

1. [SUPABASE_SETUP_CHECKLIST.md](SUPABASE_SETUP_CHECKLIST.md) の「本番環境デプロイ前」セクション
2. [SUPABASE_EMAIL_SETUP.md](SUPABASE_EMAIL_SETUP.md) の「本番環境（推奨: Resend）」セクション
3. [CORS_FIX_SUMMARY.md](CORS_FIX_SUMMARY.md) の「本番環境での設定」セクション

## 🔄 ドキュメントの更新

ドキュメントは常に最新の状態に保つよう心がけています。

- 新機能追加時: 該当ドキュメントを更新
- バグ修正時: トラブルシューティングセクションを更新
- 設定変更時: セットアップガイドを更新

## 📝 ドキュメントへの貢献

ドキュメントの改善提案や誤字脱字の修正は大歓迎です。

1. 該当ファイルを編集
2. 変更内容を説明
3. プルリクエストを作成

## 🤝 サポート

ドキュメントを読んでも解決しない問題がある場合:

1. GitHub Issuesで質問
2. 既存のIssuesを検索
3. 新しいIssueを作成（テンプレートに従って記入）

## 📄 ライセンス

すべてのドキュメントはMITライセンスの下で公開されています。
