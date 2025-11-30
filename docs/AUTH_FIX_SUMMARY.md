# 認証リダイレクト問題の修正サマリー

## 問題

ログイン後、`/campaigns` にリダイレクトしようとしてもログイン画面から遷移しない問題がありました。

## 原因

1. **Middlewareの問題**: 存在しないクッキー名（`supabase-auth-token`）を参照していた
2. **セッション管理の問題**: localStorageに手動でトークンを保存していたが、Supabaseのセッション管理と同期されていなかった
3. **認証状態の不一致**: クライアントサイドとサーバーサイドで認証状態が一致していなかった

## 修正内容

### 1. Supabaseクライアントの設定更新

**ファイル**: `frontend/lib/supabase.ts`

```typescript
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,        // セッションを永続化
    autoRefreshToken: true,      // トークンを自動更新
    detectSessionInUrl: true,    // URLからセッションを検出
    storage: window.localStorage, // localStorageを使用
    storageKey: 'sb-auth-token', // ストレージキー
  },
})
```

### 2. ログイン処理の修正

**ファイル**: `frontend/app/login/page.tsx`

**変更前:**
```typescript
if (data.session) {
  localStorage.setItem('supabase_token', data.session.access_token)
  router.push('/campaigns')
}
```

**変更後:**
```typescript
if (data.session) {
  // Session is automatically stored by Supabase client
  // Force a hard navigation to ensure middleware picks up the session
  window.location.href = '/campaigns'
}
```

**理由:**
- Supabaseクライアントが自動的にセッションを管理
- `window.location.href`でハードナビゲーションを行い、確実にセッションを反映

### 3. API呼び出しの修正

**ファイル**: `frontend/lib/api.ts`

**変更前:**
```typescript
const token = localStorage.getItem('supabase_token')
```

**変更後:**
```typescript
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

**理由:**
- Supabaseのセッション管理APIを使用
- 常に最新のトークンを取得

### 4. AuthGuardコンポーネントの追加

**ファイル**: `frontend/components/AuthGuard.tsx` (新規)

クライアントサイドで認証を保護するコンポーネント:

```typescript
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // セッションをチェック
  // 未認証の場合は /login にリダイレクト
  // 認証状態の変更を監視
}
```

**適用ページ:**
- `/campaigns`
- `/campaigns/[id]`
- `/campaigns/[id]/characters`
- `/campaigns/[id]/relationships`
- `/campaigns/[id]/lore`

### 5. Middlewareの簡素化

**ファイル**: `frontend/middleware.ts`

**変更前:**
- 複雑なクッキーチェック
- Supabaseセッションの検証

**変更後:**
- シンプルな実装
- 実際の認証チェックはクライアントサイド（AuthGuard）で実施

**理由:**
- Next.js middlewareでのSupabaseセッション検証は複雑
- クライアントサイドでの認証チェックの方がシンプルで確実

### 6. コールバックページの修正

**ファイル**: `frontend/app/auth/callback/page.tsx`

```typescript
if (data.session) {
  // Session is automatically stored by Supabase client
  setStatus('success')
  setMessage('メールアドレスの確認が完了しました！')
  
  setTimeout(() => {
    window.location.href = '/campaigns'
  }, 2000)
}
```

## 認証フロー

### ログイン
```
1. ユーザーがメール/パスワードを入力
2. supabase.auth.signInWithPassword() を呼び出し
3. Supabaseがセッションを自動的にlocalStorageに保存
4. window.location.href で /campaigns にリダイレクト
5. AuthGuardがセッションをチェック
6. 認証済みの場合、ページを表示
```

### ページ遷移
```
1. ユーザーが保護されたページにアクセス
2. AuthGuardがマウント
3. supabase.auth.getSession() でセッションをチェック
4. セッションがある場合、ページを表示
5. セッションがない場合、/login にリダイレクト
```

### セッション監視
```
AuthGuardが supabase.auth.onAuthStateChange() でセッション変化を監視
- ログアウト時: 自動的に /login にリダイレクト
- トークン更新時: 自動的に反映
```

## テスト方法

### 1. ログインテスト

```bash
# フロントエンド起動
cd frontend
pnpm dev

# ブラウザで http://localhost:3000/login を開く
# メール/パスワードでログイン
# /campaigns にリダイレクトされることを確認
```

### 2. セッション永続化テスト

```bash
# ログイン後、ブラウザをリロード
# ログイン状態が維持されることを確認
```

### 3. 認証保護テスト

```bash
# ログアウト状態で http://localhost:3000/campaigns にアクセス
# /login にリダイレクトされることを確認
```

### 4. ログアウトテスト

```bash
# ブラウザのDevToolsコンソールで実行:
await supabase.auth.signOut()

# /login にリダイレクトされることを確認
```

## トラブルシューティング

### ログイン後もリダイレクトされない

1. ブラウザのDevToolsコンソールでエラーを確認
2. localStorageに `sb-auth-token` が保存されているか確認
3. ネットワークタブでSupabase APIのレスポンスを確認

### セッションが保持されない

1. ブラウザのlocalStorageを確認
2. Supabaseクライアントの設定を確認
3. ブラウザのクッキー設定を確認

### 無限リダイレクトループ

1. AuthGuardのロジックを確認
2. middlewareの設定を確認
3. ブラウザのlocalStorageをクリア

## セキュリティ考慮事項

1. **トークンの保存**: localStorageに保存（XSS対策が必要）
2. **自動更新**: トークンは自動的に更新される
3. **セッション監視**: 認証状態の変更を常に監視
4. **HTTPS**: 本番環境では必ずHTTPSを使用

## 今後の改善案

- [ ] サーバーサイドでの認証チェック（SSR対応）
- [ ] トークンリフレッシュのエラーハンドリング強化
- [ ] ログアウト機能の実装
- [ ] セッションタイムアウトの通知
- [ ] Remember me 機能
