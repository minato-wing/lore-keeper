# User ID 認証処理の修正サマリー

## 問題

1. `/campaigns` エンドポイントにおいて、バックエンドへのリクエストに `user_id` が含まれていなくてエラーになっていました。
2. `c.GetString("user_id")` では Gin の context に `c.Set()` で設定した値を正しく取り出せませんでした。

## 根本的な問題

フロントエンドから `user_id` を送信するのではなく、**認証トークンから `user_id` をバックエンドで特定すべき**という設計上の問題がありました。

## 修正内容

### 0. コンテキスト値取得の修正

**問題**: `c.GetString("user_id")` はクエリパラメータを取得するメソッドで、`c.Set()` で設定した値は取得できない

**解決**: `c.Get()` + 型アサーションを使用するユーティリティ関数を作成

**ファイル**: `backend/pkg/utils/context.go`

```go
func GetUserID(c *gin.Context) (string, bool) {
	value, exists := c.Get("user_id")
	if !exists {
		return "", false
	}
	userID, ok := value.(string)
	return userID, ok
}
```

**使用方法**:
```go
// 変更前
userID := c.GetString("user_id")
if userID == "" {
    return 401
}

// 変更後
userID, exists := utils.GetUserID(c)
if !exists {
    return 401
}
```

詳細は `CONTEXT_VALUE_FIX.md` を参照してください。

### 1. 認証ミドルウェアの改善

**ファイル**: `backend/internal/middleware/auth.go`

認証ミドルウェアは既に正しく実装されていましたが、以下の改善を追加:

```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Skip authentication for OPTIONS requests (CORS preflight)
        if c.Request.Method == "OPTIONS" {
            c.Next()
            return
        }

        // ... 認証処理 ...

        // Use WithToken to authenticate the request
        authClient := database.Client.Auth.WithToken(token)
        user, err := authClient.GetUser()
        if err != nil {
            log.Printf("Auth error: %v", err)
            c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
            c.Abort()
            return
        }

        log.Printf("Authenticated user: %s", user.ID)
        c.Set("user_id", user.ID)  // コンテキストに user_id を設定
        c.Next()
    }
}
```

**改善点:**
- OPTIONSリクエストのスキップ処理を追加
- ログ出力を追加してデバッグを容易に
- `c.Set("user_id", user.ID)` でコンテキストに user_id を設定

### 2. 全ハンドラーでの user_id 取得と権限チェック

すべてのハンドラーで以下のパターンを実装:

#### パターン1: キャンペーン操作（直接所有権チェック）

```go
func (h *CampaignHandler) GetCampaigns(c *gin.Context) {
    // 1. コンテキストから user_id を取得
    userID := c.GetString("user_id")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    // 2. user_id でフィルタリング
    var campaigns []models.Campaign
    _, err := database.Client.From("campaigns").
        Select("*", "", false).
        Eq("user_id", userID).  // ユーザー自身のデータのみ取得
        ExecuteTo(&campaigns)
    
    // ...
}
```

#### パターン2: キャンペーン配下のリソース操作（間接的な所有権チェック）

```go
func (h *CharacterHandler) GetCharacters(c *gin.Context) {
    // 1. コンテキストから user_id を取得
    userID := c.GetString("user_id")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    campaignID := c.Query("campaign_id")
    if campaignID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "campaign_id is required"})
        return
    }

    // 2. キャンペーンの所有権を確認
    var campaign models.Campaign
    _, err := database.Client.From("campaigns").
        Select("id", "", false).
        Eq("id", campaignID).
        Eq("user_id", userID).  // ユーザーがこのキャンペーンを所有しているか確認
        Single().
        ExecuteTo(&campaign)

    if err != nil {
        c.JSON(http.StatusForbidden, gin.H{"error": "campaign not found or access denied"})
        return
    }

    // 3. キャンペーンに属するリソースを取得
    var characters []models.Character
    _, err = database.Client.From("characters").
        Select("*", "", false).
        Eq("campaign_id", campaignID).
        ExecuteTo(&characters)
    
    // ...
}
```

### 3. 修正されたハンドラー

以下のすべてのハンドラーで user_id の取得と権限チェックを実装:

#### Campaigns (`internal/handlers/campaigns.go`)
- ✅ `GetCampaigns` - user_id でフィルタリング
- ✅ `GetCampaign` - user_id で所有権確認
- ✅ `CreateCampaign` - user_id を自動設定
- ✅ `UpdateCampaign` - user_id で所有権確認
- ✅ `DeleteCampaign` - user_id で所有権確認

#### Characters (`internal/handlers/characters.go`)
- ✅ `GetCharacters` - キャンペーンの所有権確認
- ✅ `GetCharacter` - キャンペーンの所有権確認
- ✅ `CreateCharacter` - キャンペーンの所有権確認
- ✅ `UpdateCharacter` - キャンペーンの所有権確認
- ✅ `DeleteCharacter` - キャンペーンの所有権確認

#### Relationships (`internal/handlers/relationships.go`)
- ✅ `GetRelationships` - キャンペーンの所有権確認
- ✅ `CreateRelationship` - キャンペーンの所有権確認
- ✅ `UpdateRelationship` - キャンペーンの所有権確認
- ✅ `DeleteRelationship` - キャンペーンの所有権確認

#### Lore Entries (`internal/handlers/lore_entries.go`)
- ✅ `GetLoreEntries` - キャンペーンの所有権確認
- ✅ `GetLoreEntry` - キャンペーンの所有権確認
- ✅ `CreateLoreEntry` - キャンペーンの所有権確認
- ✅ `UpdateLoreEntry` - キャンペーンの所有権確認
- ✅ `DeleteLoreEntry` - キャンペーンの所有権確認

## セキュリティの改善

### Before（修正前）

```
問題点:
1. キャラクター取得時に campaign_id のみチェック
2. 他のユーザーのキャンペーンに属するキャラクターも取得可能
3. 権限チェックが不十分
```

### After（修正後）

```
改善点:
1. すべての操作で user_id をコンテキストから取得
2. キャンペーンの所有権を必ず確認
3. 他のユーザーのデータへのアクセスを完全にブロック
4. 403 Forbidden を適切に返す
```

## 認証フロー

```
1. クライアント → サーバー
   Headers:
   - Authorization: Bearer <access_token>

2. AuthMiddleware
   - トークンを検証
   - Supabase Auth API で user 情報を取得
   - c.Set("user_id", user.ID) でコンテキストに設定

3. ハンドラー
   - c.GetString("user_id") で user_id を取得
   - user_id で所有権を確認
   - 権限がある場合のみ操作を実行

4. レスポンス
   - 200 OK: 成功
   - 401 Unauthorized: 認証失敗
   - 403 Forbidden: 権限なし
   - 404 Not Found: リソースが存在しない
```

## データアクセスパターン

### パターン1: 直接所有（Campaigns）

```
User → Campaign (user_id で直接紐付け)

クエリ:
SELECT * FROM campaigns WHERE user_id = ?
```

### パターン2: 間接所有（Characters, Relationships, Lore Entries）

```
User → Campaign → Character/Relationship/LoreEntry

クエリ:
1. SELECT id FROM campaigns WHERE id = ? AND user_id = ?  (所有権確認)
2. SELECT * FROM characters WHERE campaign_id = ?         (データ取得)
```

## テスト方法

### 1. 正常系テスト

```bash
# ログイン
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# トークンを取得
TOKEN="<access_token>"

# キャンペーン一覧取得
curl -X GET http://localhost:8080/api/campaigns \
  -H "Authorization: Bearer $TOKEN"

# キャンペーン作成
curl -X POST http://localhost:8080/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Campaign", "description": "Test"}'
```

### 2. 異常系テスト

```bash
# トークンなし（401 Unauthorized）
curl -X GET http://localhost:8080/api/campaigns

# 無効なトークン（401 Unauthorized）
curl -X GET http://localhost:8080/api/campaigns \
  -H "Authorization: Bearer invalid-token"

# 他のユーザーのキャンペーンにアクセス（403 Forbidden）
curl -X GET http://localhost:8080/api/characters?campaign_id=other-user-campaign-id \
  -H "Authorization: Bearer $TOKEN"
```

### 3. ログ確認

バックエンドのログで認証フローを確認:

```
2024/11/30 19:00:00 Authenticated user: 12345678-1234-1234-1234-123456789abc
2024/11/30 19:00:01 start GetCampaigns
```

## トラブルシューティング

### user_id が空の場合

**症状**: `401 Unauthorized: unauthorized`

**原因**:
1. 認証トークンが無効
2. 認証ミドルウェアが実行されていない
3. トークンの形式が間違っている

**解決**:
```bash
# トークンを確認
echo $TOKEN

# トークンの形式を確認（Bearer プレフィックスが必要）
curl -X GET http://localhost:8080/api/campaigns \
  -H "Authorization: Bearer $TOKEN"  # "Bearer " を忘れずに
```

### 403 Forbidden が返される

**症状**: `403 Forbidden: campaign not found or access denied`

**原因**:
1. 他のユーザーのキャンペーンにアクセスしようとしている
2. campaign_id が間違っている
3. キャンペーンが削除されている

**解決**:
```bash
# 自分のキャンペーン一覧を確認
curl -X GET http://localhost:8080/api/campaigns \
  -H "Authorization: Bearer $TOKEN"

# 正しい campaign_id を使用
curl -X GET http://localhost:8080/api/characters?campaign_id=<correct-id> \
  -H "Authorization: Bearer $TOKEN"
```

## ベストプラクティス

### 1. 常にコンテキストから user_id を取得

```go
// ❌ Bad: リクエストから user_id を受け取る
type CreateRequest struct {
    UserID string `json:"user_id"`
}

// ✅ Good: コンテキストから user_id を取得
userID := c.GetString("user_id")
```

### 2. 権限チェックを必ず実施

```go
// ❌ Bad: campaign_id のみチェック
var characters []models.Character
database.Client.From("characters").
    Eq("campaign_id", campaignID).
    ExecuteTo(&characters)

// ✅ Good: キャンペーンの所有権を確認
var campaign models.Campaign
err := database.Client.From("campaigns").
    Eq("id", campaignID).
    Eq("user_id", userID).  // 所有権確認
    Single().
    ExecuteTo(&campaign)
if err != nil {
    return 403 Forbidden
}
```

### 3. 適切なHTTPステータスコードを返す

- `401 Unauthorized`: 認証失敗（トークンなし、無効なトークン）
- `403 Forbidden`: 権限なし（他のユーザーのリソースへのアクセス）
- `404 Not Found`: リソースが存在しない

## まとめ

- ✅ 認証トークンから user_id を自動抽出
- ✅ すべてのハンドラーで権限チェックを実施
- ✅ セキュリティの大幅な改善
- ✅ フロントエンドは user_id を送信不要
- ✅ バックエンドで一元的に認証・認可を管理

これにより、セキュアで保守性の高いAPIが実現されました。
