-- Supabase Email Templates Configuration
-- これらの設定はSupabaseダッシュボードで行います
-- このファイルは参考用です

-- 1. Authentication > Email Templates で以下のテンプレートをカスタマイズ

-- ========================================
-- Confirm signup (メールアドレス確認)
-- ========================================
-- Subject: Lore Keeper AI - メールアドレスの確認
-- Body:
/*
<h2>メールアドレスの確認</h2>
<p>Lore Keeper AIへようこそ！</p>
<p>アカウント登録ありがとうございます。以下のリンクをクリックしてメールアドレスを確認してください：</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">メールアドレスを確認</a></p>
<p>または、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p style="margin-top: 24px; color: #666; font-size: 14px;">このリンクは24時間有効です。</p>
<p style="color: #666; font-size: 14px;">このメールに心当たりがない場合は、無視してください。</p>
*/

-- ========================================
-- Magic Link (マジックリンクログイン)
-- ========================================
-- Subject: Lore Keeper AI - ログインリンク
-- Body:
/*
<h2>ログインリンク</h2>
<p>以下のリンクをクリックしてログインしてください：</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">ログイン</a></p>
<p>または、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p style="margin-top: 24px; color: #666; font-size: 14px;">このリンクは1時間有効です。</p>
*/

-- ========================================
-- Reset Password (パスワードリセット)
-- ========================================
-- Subject: Lore Keeper AI - パスワードリセット
-- Body:
/*
<h2>パスワードリセット</h2>
<p>パスワードリセットのリクエストを受け付けました。</p>
<p>以下のリンクをクリックして新しいパスワードを設定してください：</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">パスワードをリセット</a></p>
<p>または、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p style="margin-top: 24px; color: #666; font-size: 14px;">このリンクは1時間有効です。</p>
<p style="color: #666; font-size: 14px;">パスワードリセットをリクエストしていない場合は、このメールを無視してください。</p>
*/

-- ========================================
-- Change Email (メールアドレス変更)
-- ========================================
-- Subject: Lore Keeper AI - メールアドレス変更の確認
-- Body:
/*
<h2>メールアドレス変更の確認</h2>
<p>メールアドレスの変更リクエストを受け付けました。</p>
<p>以下のリンクをクリックして変更を確認してください：</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">変更を確認</a></p>
<p>または、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p style="margin-top: 24px; color: #666; font-size: 14px;">このリンクは24時間有効です。</p>
*/

-- ========================================
-- 設定手順
-- ========================================
-- 1. Supabaseダッシュボードにログイン
-- 2. プロジェクトを選択
-- 3. Authentication > Email Templates に移動
-- 4. 各テンプレートを上記の内容で更新
-- 5. "Save" をクリック

-- ========================================
-- SMTP設定（本番環境用）
-- ========================================
-- Project Settings > Auth > SMTP Settings で設定
-- 
-- 推奨: Resend (https://resend.com)
-- - Host: smtp.resend.com
-- - Port: 587
-- - Username: resend
-- - Password: re_xxxxxxxxxxxxx (API Key)
-- - Sender email: noreply@yourdomain.com
-- - Sender name: Lore Keeper AI

-- ========================================
-- 開発環境での確認
-- ========================================
-- 開発中は、Supabaseの組み込みメール機能を使用
-- メールは以下で確認可能:
-- Dashboard > Authentication > Users > ユーザーを選択 > Email confirmation link
