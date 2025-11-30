# CORS エラー修正サマリー

## 問題

フロントエンドからバックエンドへのリクエストで 403 CORS error (OPTIONS) が発生していました。

## 原因

1. **CORS設定の問題**: 
   - `AllowOrigins`に末尾のスラッシュが含まれていた
   - Gitpod URLが正しく許可されていなかった

2. **認証ミドルウェアの問題**:
   - OPTIONSリクエスト（プリフライトリクエスト）が認証チェックでブロックされていた
   - プリフライトリクエストには認証ヘッダーが含まれないため、401エラーが返されていた

## 修正内容

### 1. CORS設定の改善

**ファイル**: `backend/cmd/api/main.go`

**変更前:**
```go
r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:3000",
                                "https://3000--019acce4-79da-7aa9-bc74-a27dac2b2089.us-east-1-01.gitpod.dev/"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    AllowCredentials: true,
}))
```

**変更後:**
```go
r.Use(cors.New(cors.Config{
    AllowOriginFunc: func(origin string) bool {
        // Allow localhost and Gitpod URLs
        return origin == "http://localhost:3000" ||
            origin == "http://localhost:3001" ||
            strings.HasSuffix(origin, ".gitpod.io") ||
            strings.Contains(origin, "gitpod.dev")
    },
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
    ExposeHeaders:    []string{"Content-Length"},
    AllowCredentials: true,
    MaxAge:           12 * 3600, // 12 hours
}))
```

**改善点:**
- `AllowOriginFunc`を使用して動的にオリジンをチェック
- Gitpod URLのパターンマッチングを追加
- `PATCH`メソッドを追加
- `Accept`ヘッダーを許可
- `MaxAge`を設定してプリフライトリクエストのキャッシュを有効化

### 2. 認証ミドルウェアの修正

**ファイル**: `backend/internal/middleware/auth.go`

**変更前:**
```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
            c.Abort()
            return
        }
        // ... rest of the code
    }
}
```

**変更後:**
```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Skip authentication for OPTIONS requests (CORS preflight)
        if c.Request.Method == "OPTIONS" {
            c.Next()
            return
        }

        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
            c.Abort()
            return
        }
        // ... rest of the code
    }
}
```

**改善点:**
- OPTIONSリクエストをスキップして認証チェックを回避
- プリフライトリクエストが正常に処理されるようになった

## CORS の仕組み

### プリフライトリクエスト

ブラウザは、以下の条件を満たすリクエストの前に「プリフライトリクエスト」を送信します：

1. **メソッド**: GET, HEAD, POST 以外
2. **ヘッダー**: カスタムヘッダー（Authorization等）を含む
3. **Content-Type**: application/json 等

プリフライトリクエストの流れ:

```
1. ブラウザ → サーバー: OPTIONS リクエスト
   Headers:
   - Origin: http://localhost:3000
   - Access-Control-Request-Method: GET
   - Access-Control-Request-Headers: Authorization

2. サーバー → ブラウザ: 204 No Content
   Headers:
   - Access-Control-Allow-Origin: http://localhost:3000
   - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   - Access-Control-Allow-Headers: Authorization, Content-Type
   - Access-Control-Allow-Credentials: true
   - Access-Control-Max-Age: 43200

3. ブラウザ → サーバー: 実際のリクエスト (GET, POST等)
   Headers:
   - Origin: http://localhost:3000
   - Authorization: Bearer xxx

4. サーバー → ブラウザ: レスポンス
   Headers:
   - Access-Control-Allow-Origin: http://localhost:3000
   - Access-Control-Allow-Credentials: true
```

### 重要なポイント

1. **OPTIONSリクエストには認証ヘッダーが含まれない**
   - プリフライトリクエストは認証前に送信される
   - 認証ミドルウェアはOPTIONSをスキップする必要がある

2. **オリジンの完全一致**
   - 末尾のスラッシュも含めて完全一致が必要
   - `http://localhost:3000` と `http://localhost:3000/` は異なる

3. **クレデンシャル付きリクエスト**
   - `AllowCredentials: true` の場合、`AllowOrigins: ["*"]` は使用不可
   - 明示的にオリジンを指定する必要がある

## テスト方法

### 1. CORSテストスクリプト

```bash
# デフォルト（localhost:8080）
./test-cors.sh

# カスタムURL
./test-cors.sh http://localhost:8080 http://localhost:3000
```

### 2. ブラウザのDevTools

1. ブラウザのDevToolsを開く（F12）
2. Networkタブを選択
3. フロントエンドからAPIリクエストを送信
4. OPTIONSリクエストを確認:
   - Status: 204 No Content
   - Response Headers:
     - `Access-Control-Allow-Origin: http://localhost:3000`
     - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
     - `Access-Control-Allow-Headers: Origin, Content-Type, Authorization, Accept`
     - `Access-Control-Allow-Credentials: true`

### 3. curlコマンド

```bash
# プリフライトリクエスト
curl -i -X OPTIONS http://localhost:8080/api/campaigns \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization"

# 実際のリクエスト
curl -i -X GET http://localhost:8080/api/campaigns \
  -H "Origin: http://localhost:3000" \
  -H "Authorization: Bearer your-token"
```

## トラブルシューティング

### CORSエラーが解決しない場合

1. **バックエンドを再起動**
   ```bash
   cd backend
   go run cmd/api/main.go
   ```

2. **ブラウザのキャッシュをクリア**
   - DevTools > Network > Disable cache にチェック
   - ハードリロード（Ctrl+Shift+R / Cmd+Shift+R）

3. **オリジンを確認**
   ```javascript
   // ブラウザのコンソールで実行
   console.log(window.location.origin)
   ```

4. **バックエンドのログを確認**
   - Ginのログでリクエストが到達しているか確認
   - 認証エラーが発生していないか確認

### よくあるエラー

**エラー1: "Access to fetch at ... has been blocked by CORS policy"**
- 原因: オリジンが許可されていない
- 解決: `AllowOriginFunc`にオリジンを追加

**エラー2: "Response to preflight request doesn't pass access control check"**
- 原因: OPTIONSリクエストが正しく処理されていない
- 解決: 認証ミドルウェアでOPTIONSをスキップ

**エラー3: "The value of the 'Access-Control-Allow-Origin' header ... must not be the wildcard '*'"**
- 原因: `AllowCredentials: true` と `AllowOrigins: ["*"]` の組み合わせ
- 解決: 明示的にオリジンを指定

## 本番環境での設定

### 環境変数での制御

本番環境では、環境変数でオリジンを制御することを推奨:

```go
// cmd/api/main.go
allowedOrigins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")

r.Use(cors.New(cors.Config{
    AllowOriginFunc: func(origin string) bool {
        for _, allowed := range allowedOrigins {
            if origin == strings.TrimSpace(allowed) {
                return true
            }
        }
        return false
    },
    // ... rest of config
}))
```

```bash
# .env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### セキュリティ考慮事項

1. **本番環境では特定のオリジンのみ許可**
   - ワイルドカードは使用しない
   - 信頼できるドメインのみ許可

2. **HTTPS を使用**
   - 本番環境では必ずHTTPSを使用
   - Mixed Content（HTTP/HTTPS混在）を避ける

3. **適切なヘッダーのみ許可**
   - 必要最小限のヘッダーのみ許可
   - 不要なヘッダーは除外

4. **MaxAge を適切に設定**
   - プリフライトリクエストのキャッシュ時間
   - 開発: 短め（1時間）
   - 本番: 長め（12-24時間）

## 参考資料

- [MDN: CORS](https://developer.mozilla.org/ja/docs/Web/HTTP/CORS)
- [Gin CORS Middleware](https://github.com/gin-contrib/cors)
- [CORS Preflight Request](https://developer.mozilla.org/ja/docs/Glossary/Preflight_request)
