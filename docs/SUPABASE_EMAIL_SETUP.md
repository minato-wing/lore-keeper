# Supabase メール送信設定ガイド

## 概要
Supabaseでメール送信を有効にするための設定手順です。

## 方法1: Supabase組み込みメール（開発・テスト用）

Supabaseは開発環境用に組み込みのメール送信機能を提供しています。

### 設定手順
1. Supabaseダッシュボード > Authentication > Email Templates
2. 各テンプレート（Confirm signup, Reset password等）を確認
3. デフォルトで有効になっています

### 制限事項
- 1時間あたり4通まで（開発用）
- 本番環境では使用不可

## 方法2: カスタムSMTP（本番環境推奨）

### 対応サービス
- SendGrid
- AWS SES
- Resend
- Mailgun
- その他のSMTPサービス

### 設定手順

#### 1. SMTPプロバイダーの設定（例: Resend）

1. [Resend](https://resend.com)でアカウント作成
2. API Keyを取得
3. ドメインを認証（オプション）

#### 2. Supabaseでの設定

1. Supabaseダッシュボード > Project Settings > Auth
2. SMTP Settings セクションに移動
3. 以下の情報を入力:

```
Enable Custom SMTP: ON
Sender email: noreply@yourdomain.com
Sender name: Lore Keeper AI

Host: smtp.resend.com
Port: 587
Username: resend
Password: re_xxxxxxxxxxxxx (Resend API Key)
```

#### 3. メールテンプレートのカスタマイズ

Supabaseダッシュボード > Authentication > Email Templates

**Confirm signup テンプレート例:**
```html
<h2>メールアドレスの確認</h2>
<p>Lore Keeper AIへようこそ！</p>
<p>以下のリンクをクリックしてメールアドレスを確認してください：</p>
<p><a href="{{ .ConfirmationURL }}">メールアドレスを確認</a></p>
<p>このリンクは24時間有効です。</p>
```

## 方法3: Firebase Extensions（高度な設定）

Firebase Extensionsを使用する場合は、以下の手順が必要です：

### 前提条件
- Firebaseプロジェクト
- Cloud Functionsの有効化
- Trigger Email Extension のインストール

### 統合手順

1. **Firebaseプロジェクトの作成**
   ```bash
   firebase init
   ```

2. **Trigger Email Extension のインストール**
   ```bash
   firebase ext:install firebase/firestore-send-email
   ```

3. **Supabase Webhookの設定**
   - Supabaseダッシュボード > Database > Webhooks
   - `auth.users` テーブルの `INSERT` イベントでWebhookを作成
   - Firebase Cloud FunctionのURLを指定

4. **Cloud Functionの実装**
   ```typescript
   import * as functions from 'firebase-functions';
   import * as admin from 'firebase-admin';

   admin.initializeApp();

   export const sendConfirmationEmail = functions.https.onRequest(async (req, res) => {
     const { email, confirmation_url } = req.body;
     
     await admin.firestore().collection('mail').add({
       to: email,
       template: {
         name: 'confirmation',
         data: {
           confirmationUrl: confirmation_url,
         },
       },
     });
     
     res.json({ success: true });
   });
   ```

## 推奨設定（本番環境）

### Resend を使用する場合（推奨）

**理由:**
- 無料枠: 月3,000通
- シンプルなAPI
- 高い到達率
- 日本からも利用可能

**設定:**
1. [Resend](https://resend.com)でアカウント作成
2. API Keyを取得
3. Supabaseの SMTP Settings に以下を設定:
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: `re_xxxxxxxxxxxxx`

### SendGrid を使用する場合

**無料枠:** 月100通

**設定:**
1. [SendGrid](https://sendgrid.com)でアカウント作成
2. API Keyを取得
3. Supabaseの SMTP Settings に以下を設定:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: `SG.xxxxxxxxxxxxx`

## トラブルシューティング

### メールが届かない場合

1. **スパムフォルダを確認**
2. **SMTP設定を確認**
   - ホスト名、ポート、認証情報が正しいか
3. **Supabaseログを確認**
   - Dashboard > Logs > Auth Logs
4. **メールプロバイダーのログを確認**
   - 送信エラーがないか

### 開発環境でのテスト

開発中は、Supabaseの組み込みメール機能で十分です。
メールは Supabase Dashboard > Authentication > Users で確認できます。

または、[Mailhog](https://github.com/mailhog/MailHog)などのローカルSMTPサーバーを使用できます。

## セキュリティ注意事項

- SMTP認証情報は環境変数として管理
- `.env`ファイルは`.gitignore`に追加
- 本番環境では必ずカスタムSMTPを使用
- SPF/DKIM/DMARCレコードを設定（到達率向上のため）
