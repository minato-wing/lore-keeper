# Gin Context 値取得の修正

## 問題

`c.GetString("user_id")` では Gin の context に `c.Set()` で設定した値を正しく取り出せませんでした。

## 原因

Gin の `c.GetString()` メソッドは、クエリパラメータやフォームデータから文字列を取得するためのメソッドで、`c.Set()` で設定したコンテキスト値を取得するためのものではありません。

## 正しい方法

### 1. `c.Get()` を使用して型アサーション

```go
// 間違った方法
userID := c.GetString("user_id")  // これはクエリパラメータを取得する

// 正しい方法
value, exists := c.Get("user_id")
if !exists {
    // 値が存在しない
    return
}

userID, ok := value.(string)
if !ok {
    // 型アサーション失敗
    return
}
```

### 2. ユーティリティ関数の作成

繰り返しコードを避けるため、ユーティリティ関数を作成しました。

**ファイル**: `backend/pkg/utils/context.go`

```go
package utils

import (
	"github.com/gin-gonic/gin"
)

// GetUserID retrieves the user_id from the Gin context
// Returns the user_id string and a boolean indicating if it was found
func GetUserID(c *gin.Context) (string, bool) {
	value, exists := c.Get("user_id")
	if !exists {
		return "", false
	}

	userID, ok := value.(string)
	if !ok {
		return "", false
	}

	return userID, true
}
```

## 修正内容

### すべてのハンドラーで修正

**変更前:**
```go
func (h *CampaignHandler) GetCampaigns(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	// ...
}
```

**変更後:**
```go
import "github.com/minato-wing/lore-keeper/backend/pkg/utils"

func (h *CampaignHandler) GetCampaigns(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	// ...
}
```

### 修正されたファイル

1. ✅ `internal/handlers/campaigns.go` - 5箇所
2. ✅ `internal/handlers/characters.go` - 5箇所
3. ✅ `internal/handlers/relationships.go` - 4箇所
4. ✅ `internal/handlers/lore_entries.go` - 5箇所

**合計**: 19箇所

## Gin Context メソッドの違い

### `c.Get(key)` - コンテキスト値の取得

```go
// c.Set() で設定した値を取得
c.Set("user_id", "12345")
value, exists := c.Get("user_id")  // value = "12345", exists = true
```

**用途**: ミドルウェアで設定した値をハンドラーで取得

### `c.GetString(key)` - クエリパラメータの取得

```go
// URL: /api/users?name=john
name := c.GetString("name")  // name = "john"
```

**用途**: クエリパラメータやフォームデータの取得

### `c.Param(key)` - パスパラメータの取得

```go
// Route: /api/users/:id
// URL: /api/users/123
id := c.Param("id")  // id = "123"
```

**用途**: URLパスパラメータの取得

### `c.Query(key)` - クエリパラメータの取得

```go
// URL: /api/users?page=1
page := c.Query("page")  // page = "1"
```

**用途**: クエリパラメータの取得（`c.GetString()` と同じ）

## 認証フロー（修正後）

```
1. リクエスト
   GET /api/campaigns
   Authorization: Bearer <token>

2. AuthMiddleware
   - トークンを検証
   - Supabase Auth API で user 情報を取得
   - c.Set("user_id", user.ID)  ← interface{} として保存

3. ハンドラー
   - userID, exists := utils.GetUserID(c)  ← c.Get() + 型アサーション
   - if !exists { return 401 }
   - 権限チェック
   - データ取得

4. レスポンス
   200 OK
```

## テスト

### 単体テスト例

```go
func TestGetUserID(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(nil)

	// Test 1: 値が存在する場合
	c.Set("user_id", "test-user-123")
	userID, exists := utils.GetUserID(c)
	if !exists || userID != "test-user-123" {
		t.Errorf("Expected user_id=test-user-123, got %s", userID)
	}

	// Test 2: 値が存在しない場合
	c2, _ := gin.CreateTestContext(nil)
	_, exists = utils.GetUserID(c2)
	if exists {
		t.Error("Expected exists=false")
	}

	// Test 3: 型が違う場合
	c3, _ := gin.CreateTestContext(nil)
	c3.Set("user_id", 12345)  // int型
	_, exists = utils.GetUserID(c3)
	if exists {
		t.Error("Expected exists=false for non-string value")
	}
}
```

### 統合テスト

```bash
# バックエンド起動
cd backend
go run cmd/api/main.go

# ログイン
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}' \
  | jq -r '.access_token')

# キャンペーン一覧取得（user_id が正しく取得されることを確認）
curl -X GET http://localhost:8080/api/campaigns \
  -H "Authorization: Bearer $TOKEN"

# ログで確認
# GetCampaigns for user: 12345678-1234-1234-1234-123456789abc
```

## トラブルシューティング

### 問題: `401 Unauthorized: unauthorized`

**原因1**: `c.Set()` で設定した値が取得できていない

**解決**:
```go
// ミドルウェアで確認
log.Printf("Set user_id: %s", user.ID)
c.Set("user_id", user.ID)

// ハンドラーで確認
userID, exists := utils.GetUserID(c)
log.Printf("Got user_id: %s, exists: %v", userID, exists)
```

**原因2**: ミドルウェアが実行されていない

**解決**:
```go
// ルート設定を確認
protected := api.Group("")
protected.Use(middleware.AuthMiddleware())  // ← これが必要
{
    protected.GET("/campaigns", handler.GetCampaigns)
}
```

### 問題: 型アサーション失敗

**原因**: `c.Set()` で文字列以外の型を設定している

**解決**:
```go
// 間違い
c.Set("user_id", 12345)  // int型

// 正しい
c.Set("user_id", "12345")  // string型
```

## ベストプラクティス

### 1. コンテキスト値には型安全なヘルパーを使用

```go
// ❌ Bad: 毎回型アサーション
value, _ := c.Get("user_id")
userID := value.(string)

// ✅ Good: ヘルパー関数を使用
userID, exists := utils.GetUserID(c)
if !exists {
    return
}
```

### 2. 存在チェックを必ず行う

```go
// ❌ Bad: 存在チェックなし
userID, _ := utils.GetUserID(c)
// userID が空文字列の可能性

// ✅ Good: 存在チェック
userID, exists := utils.GetUserID(c)
if !exists {
    c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
    return
}
```

### 3. 型安全なヘルパーを追加

他のコンテキスト値にも同様のヘルパーを追加できます:

```go
// pkg/utils/context.go

func GetCampaignID(c *gin.Context) (string, bool) {
	value, exists := c.Get("campaign_id")
	if !exists {
		return "", false
	}
	campaignID, ok := value.(string)
	return campaignID, ok
}

func GetUserRole(c *gin.Context) (string, bool) {
	value, exists := c.Get("user_role")
	if !exists {
		return "", false
	}
	role, ok := value.(string)
	return role, ok
}
```

## まとめ

- ✅ `c.Get()` + 型アサーションが正しい方法
- ✅ `c.GetString()` はクエリパラメータ用
- ✅ ユーティリティ関数で型安全に
- ✅ 存在チェックを必ず実施
- ✅ すべてのハンドラーで統一的に使用

これにより、型安全で保守性の高いコードが実現されました。
