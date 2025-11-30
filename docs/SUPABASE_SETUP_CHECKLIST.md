# Supabase セットアップチェックリスト

このチェックリストに従って、Supabaseプロジェクトを正しく設定してください。

## ✅ 1. プロジェクト作成

- [ ] [Supabase](https://supabase.com)でアカウント作成
- [ ] 新しいプロジェクトを作成
- [ ] プロジェクト名: `lore-keeper` (または任意の名前)
- [ ] リージョン: 最寄りのリージョンを選択（例: Tokyo）
- [ ] データベースパスワードを安全に保存

## ✅ 2. データベース初期化

- [ ] Supabase Dashboard > SQL Editor に移動
- [ ] `database/init.sql` の内容をコピー＆ペースト
- [ ] "Run" をクリックして実行
- [ ] エラーがないことを確認
- [ ] Database > Tables で以下のテーブルが作成されたことを確認:
  - [ ] campaigns
  - [ ] characters
  - [ ] relationships
  - [ ] lore_entries

## ✅ 3. 認証設定

### 基本設定
- [ ] Authentication > Configuration に移動
- [ ] Email Auth が有効になっていることを確認
- [ ] "Confirm email" が有効になっていることを確認

### Site URL設定
- [ ] Authentication > URL Configuration に移動
- [ ] Site URL を設定:
  - 開発: `http://localhost:3000`
  - 本番: `https://yourdomain.com`
- [ ] Redirect URLs に以下を追加:
  - `http://localhost:3000/auth/callback` (開発)
  - `https://yourdomain.com/auth/callback` (本番)

## ✅ 4. メール送信設定

### 開発環境（デフォルト）
- [ ] Authentication > Email Templates を確認
- [ ] デフォルトのテンプレートが有効になっていることを確認
- [ ] テスト送信（1時間4通まで）

### 本番環境（推奨: Resend）

#### Resendの設定
- [ ] [Resend](https://resend.com)でアカウント作成
- [ ] API Keyを作成
- [ ] （オプション）ドメインを追加・認証

#### SupabaseでのSMTP設定
- [ ] Project Settings > Auth > SMTP Settings に移動
- [ ] "Enable Custom SMTP" をON
- [ ] 以下の情報を入力:
  ```
  Host: smtp.resend.com
  Port: 587
  Username: resend
  Password: re_xxxxxxxxxxxxx (Resend API Key)
  Sender email: noreply@yourdomain.com
  Sender name: Lore Keeper AI
  ```
- [ ] "Save" をクリック

#### メールテンプレートのカスタマイズ
- [ ] Authentication > Email Templates に移動
- [ ] `database/database/email-templates.sql` の内容を参考に各テンプレートを更新:
  - [ ] Confirm signup
  - [ ] Magic Link
  - [ ] Reset Password
  - [ ] Change Email

## ✅ 5. API Keys取得

- [ ] Settings > API に移動
- [ ] 以下の情報をコピー:
  - [ ] Project URL
  - [ ] anon public key (Publishable Key)
  - [ ] service_role key (Service Role Key) ⚠️ 秘密鍵

## ✅ 6. 環境変数設定

### バックエンド
- [ ] `backend/.env` ファイルを作成
- [ ] 以下の環境変数を設定:
  ```
  SUPABASE_URL=https://xxxxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
  ANTHROPIC_API_KEY=sk-ant-xxx...
  PORT=8080
  ```

### フロントエンド
- [ ] `frontend/.env.local` ファイルを作成
- [ ] 以下の環境変数を設定:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx...
  NEXT_PUBLIC_API_URL=http://localhost:8080
  ```

## ✅ 7. Row Level Security (RLS) 確認

- [ ] Database > Tables > campaigns を選択
- [ ] "RLS enabled" が有効になっていることを確認
- [ ] Policies タブで以下のポリシーが存在することを確認:
  - [ ] "Users can only access their own campaigns"

## ✅ 8. テスト

### メール送信テスト
- [ ] アプリケーションを起動
- [ ] 新規アカウントを作成
- [ ] 確認メールが届くことを確認
- [ ] メール内のリンクをクリック
- [ ] アカウントが有効化されることを確認

### 認証テスト
- [ ] ログインできることを確認
- [ ] ログアウトできることを確認
- [ ] 未確認アカウントでログインできないことを確認

### データベーステスト
- [ ] キャンペーンを作成できることを確認
- [ ] キャラクターを作成できることを確認
- [ ] 他のユーザーのデータが見えないことを確認（RLS）

## ✅ 9. 本番環境デプロイ前

- [ ] SMTP設定を本番用に変更
- [ ] Site URLを本番URLに変更
- [ ] Redirect URLsに本番URLを追加
- [ ] 環境変数を本番環境に設定
- [ ] メールテンプレートを最終確認
- [ ] SPF/DKIM/DMARCレコードを設定（メール到達率向上）

## トラブルシューティング

### メールが届かない
1. [ ] スパムフォルダを確認
2. [ ] SMTP設定を再確認
3. [ ] Supabase Dashboard > Logs > Auth Logs でエラーを確認
4. [ ] Resend Dashboard でメール送信ログを確認

### ログインできない
1. [ ] メールアドレスが確認済みか確認
2. [ ] パスワードが正しいか確認
3. [ ] Supabase Dashboard > Authentication > Users でユーザー状態を確認

### データが見えない
1. [ ] RLSが正しく設定されているか確認
2. [ ] ログインしているユーザーIDを確認
3. [ ] データのuser_idが正しいか確認

## 参考資料

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Resend公式ドキュメント](https://resend.com/docs)
- `SUPABASE_EMAIL_SETUP.md` - メール設定の詳細
- `database/database/email-templates.sql` - メールテンプレート例
