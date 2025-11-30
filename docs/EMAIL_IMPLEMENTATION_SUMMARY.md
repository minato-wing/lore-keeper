# メール送信機能 実装サマリー

## 実装内容

アカウント作成時のメール送信機能を実装しました。Supabaseの組み込みメール機能を使用し、本番環境ではカスタムSMTP（Resend推奨）を使用できます。

## 変更されたファイル

### フロントエンド

1. **`frontend/app/login/page.tsx`**
   - サインアップ時にメール確認ページへリダイレクト
   - エラーメッセージの改善
   - メール未確認エラーの適切な処理

2. **`frontend/app/auth/callback/page.tsx`** (新規)
   - メール確認リンクのコールバック処理
   - トークン交換とセッション作成
   - 成功/エラー状態の表示

3. **`frontend/app/auth/confirm/page.tsx`** (新規)
   - メール確認待ちページ
   - 確認メール再送信機能
   - トラブルシューティングガイド

### ドキュメント

4. **`SUPABASE_EMAIL_SETUP.md`** (新規)
   - メール送信設定の詳細ガイド
   - 開発環境と本番環境の設定方法
   - 推奨SMTPプロバイダー（Resend, SendGrid等）

5. **`database/database/email-templates.sql`** (新規)
   - Supabaseメールテンプレートの例
   - 日本語テンプレート
   - 設定手順

6. **`SUPABASE_SETUP_CHECKLIST.md`** (新規)
   - Supabase設定の完全チェックリスト
   - ステップバイステップガイド
   - トラブルシューティング

7. **`README.md`** (更新)
   - メール設定セクションを追加
   - セットアップ手順を更新

## メール送信フロー

### 1. アカウント作成
```
ユーザー → サインアップフォーム → Supabase Auth
                                      ↓
                              確認メール送信
                                      ↓
                              ユーザーのメールボックス
```

### 2. メール確認
```
ユーザー → メール内リンクをクリック → /auth/callback
                                          ↓
                                    トークン検証
                                          ↓
                                    セッション作成
                                          ↓
                                    /campaigns へリダイレクト
```

### 3. メール再送信
```
ユーザー → /auth/confirm → 再送信ボタン → Supabase Auth
                                              ↓
                                        確認メール再送信
```

## 設定方法

### 開発環境（すぐに使える）

Supabaseの組み込みメール機能がデフォルトで有効です。

**制限:**
- 1時間あたり4通まで
- 開発・テスト用途のみ

**確認方法:**
1. アカウントを作成
2. Supabase Dashboard > Authentication > Users
3. ユーザーを選択 > "Send confirmation email" でリンクを確認

### 本番環境（推奨: Resend）

#### 1. Resendアカウント作成
```bash
# https://resend.com でアカウント作成
# API Keyを取得
```

#### 2. Supabase SMTP設定
```
Dashboard > Project Settings > Auth > SMTP Settings

Enable Custom SMTP: ON
Host: smtp.resend.com
Port: 587
Username: resend
Password: re_xxxxxxxxxxxxx (Resend API Key)
Sender email: noreply@yourdomain.com
Sender name: Lore Keeper AI
```

#### 3. メールテンプレート設定
```
Dashboard > Authentication > Email Templates

各テンプレート（Confirm signup等）を日本語化
database/email-templates.sql を参考に編集
```

#### 4. URL設定
```
Dashboard > Authentication > URL Configuration

Site URL: https://yourdomain.com
Redirect URLs:
  - https://yourdomain.com/auth/callback
  - http://localhost:3000/auth/callback (開発用)
```

## テスト方法

### 1. ローカルでテスト

```bash
# フロントエンド起動
cd frontend
pnpm dev

# ブラウザで http://localhost:3000 を開く
# アカウント作成を試す
```

### 2. メール確認

**開発環境:**
1. Supabase Dashboard > Authentication > Users
2. 作成したユーザーを選択
3. "Email confirmation link" をコピー
4. ブラウザで開く

**本番環境:**
1. 実際のメールボックスを確認
2. 確認メール内のリンクをクリック

### 3. 動作確認

- [ ] アカウント作成後、確認ページが表示される
- [ ] 確認メールが届く（または Dashboard で確認できる）
- [ ] メール内のリンクをクリックするとログインできる
- [ ] 未確認アカウントではログインできない
- [ ] メール再送信が機能する

## トラブルシューティング

### メールが届かない

**開発環境:**
- Supabase Dashboard > Authentication > Users でリンクを確認
- 1時間4通の制限を超えていないか確認

**本番環境:**
1. スパムフォルダを確認
2. SMTP設定を再確認
3. Supabase Dashboard > Logs > Auth Logs でエラーを確認
4. Resend Dashboard でメール送信ログを確認

### ログインできない

1. メールアドレスが確認済みか確認
   - Dashboard > Authentication > Users > Email Confirmed
2. パスワードが正しいか確認
3. エラーメッセージを確認

### 確認リンクが無効

1. リンクの有効期限（24時間）を確認
2. 既に使用済みでないか確認
3. メール再送信を試す

## セキュリティ考慮事項

1. **SMTP認証情報の管理**
   - 環境変数として管理
   - `.env`ファイルは`.gitignore`に追加済み
   - Service Role Keyは絶対に公開しない

2. **メール到達率向上**
   - SPF/DKIM/DMARCレコードを設定（本番環境）
   - 認証済みドメインを使用
   - 送信元メールアドレスを適切に設定

3. **レート制限**
   - Supabaseの組み込み制限: 1時間4通（開発）
   - Resend無料枠: 月3,000通
   - 必要に応じてプラン変更

## 今後の拡張

- [ ] パスワードリセット機能
- [ ] メールアドレス変更機能
- [ ] マジックリンクログイン
- [ ] メール通知機能（キャンペーン招待等）
- [ ] メールテンプレートのカスタマイズUI

## 参考リンク

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Resend Documentation](https://resend.com/docs)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
