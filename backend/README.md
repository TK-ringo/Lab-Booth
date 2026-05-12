# Lab Booth Backend API

## 概要
- Base URL: `http://localhost:3001`
- すべてのリクエスト/レスポンスは JSON を基本とします（画像アップロードは `multipart/form-data`）。
- エラー形式: `{"error": "message"}`

## 環境変数
- `ADMIN_PASSWORD`: 管理者認証のパスワード
- `DATABASE_PATH`: SQLite の保存パス

## 認証（管理者 API）
管理者 API は、次のいずれかで認証できます。
- Bearer JWT: `Authorization: Bearer <token>`
- Basic 認証: `Authorization: Basic base64(<any-user>:<ADMIN_PASSWORD>)`
- ヘッダー: `x-admin-pass: <ADMIN_PASSWORD>`

JWT は `POST /api/login` で取得します。

## エンドポイント一覧

### 認証
#### POST /api/login
管理者ログイン。成功時に JWT を返します。

**Request (JSON)**
```json
{ "password": "<ADMIN_PASSWORD>" }
```

**Response 200**
```json
{ "token": "<jwt>" }
```

**Response 400**
```json
{ "error": "password が空です" }
```

**Response 401**
```json
{ "error": "Invalid password" }
```

---

### 一般 API
#### GET /api/members
**Response 200**
```json
{ "members": [ { "id": 1, "name": "Alice" } ] }
```

#### GET /api/products
**Response 200**
```json
{ "products": [ { "id": 1, "name": "Snack", "price": 120, "stock": 5, "barcode": "123", "image": "/api/uploads/product_1_....jpg" } ] }
```

#### POST /api/purchase
購入確定。`productIds` は購入する商品の ID 配列です。

**Request (JSON)**
```json
{ "memberId": 1, "productIds": [1, 2, 3] }
```

**Response 200**
```json
{ "members": [ ... ], "products": [ ... ] }
```

**Response 400**
```json
{ "error": "memberId が必要です" }
```

**Response 409**
```json
{ "error": "同一内容の購入リクエストが短時間に連続しています" }
```

#### POST /api/products/:id/image
商品画像のアップロード（`multipart/form-data`）。
- フィールド名: `image`
- 最大サイズ: 10MB
- 画像は 600x600 以内に縮小し JPEG で保存

**Response 200**
```json
{ "product": { "id": 1, "image": "/api/uploads/product_1_....jpg", "name": "Snack", "price": 120, "stock": 5, "barcode": "123" } }
```

**Response 400**
```json
{ "error": "画像がありません" }
```

**Response 413**
```json
{ "error": "画像が大きすぎます（最大10MB）" }
```

---

### 管理者 API（要認証）
#### GET /api/admin/restock-suggestions
在庫/購買頻度から仕入れ候補を返します。

**Query Params**
- `days` (number, default 30)
- `limit` (number, default 100, max 500)
- `targetDays` (number, default 14)
- `safetyDays` (number, default 3)
- `minSold` (number, default 1)
- `includeOOS` (boolean, default false)

**Response 200**
```json
{
  "suggestions": [
    {
      "id": 1,
      "name": "Snack",
      "barcode": "123",
      "price": 120,
      "stock": 0,
      "sold_7d": 5,
      "sold_nd": 12,
      "window_days": 30,
      "velocity_per_day": 0.4,
      "days_of_supply": 0,
      "last_sold_at": "2026-02-14 10:00:00",
      "suggested_qty": 6,
      "reason": "在庫切れ"
    }
  ],
  "meta": { "days": 30, "targetDays": 14, "safetyDays": 3, "minSold": 1, "limit": 100 }
}
```

#### GET /api/admin/invoice-summary
月次の購入金額をメンバーごとに集計します。

**Query Params**
- `year` (number, default 現在年)
- `month` (number, default 現在月)

**Response 200**
```json
{ "rows": [ { "member_id": 1, "member_name": "Alice", "settlement": 1200 } ] }
```

#### GET /api/admin/:table/columns
テーブル列名を返します。

**Path Params**
- `table`: `members | products | purchases | restock_history`

**Response 200**
```json
{ "columns": ["id", "name"] }
```

#### GET /api/admin/:table
テーブル行を取得します。

**Query Params**
- `order`: `asc | desc`（default asc）

**Response 200**
```json
{ "rows": [ { "id": 1, "name": "Alice" } ] }
```

#### POST /api/admin/:table
テーブル行を追加します。
- `restock_history` の場合は在庫調整が走ります

**Response 200**
```json
{ "id": 123 }
```

**Response 400**
```json
{ "error": "quantity が必要です" }
```

#### PUT /api/admin/:table/:id
テーブル行を更新します。
- `restock_history` の場合は在庫調整が走ります

**Response 200**
```json
{ "ok": true }
```

#### DELETE /api/admin/:table/:id
テーブル行を削除します。
- `restock_history` の場合は在庫調整が走ります

**Response 200**
```json
{ "ok": true }
```

#### POST /api/admin/restock/import
仕入れのテキストを一括インポートします。

**Request (JSON)**
```json
{ "text": "..." }
```

**Response 200**
```json
{ "ok": true, "imported": 12 }
```

**Response 400**
```json
{ "error": "text が空です" }
```

---

## スキーマ概要
### Member
- `id` (number)
- `name` (string)

### Product
- `id` (number)
- `name` (string)
- `price` (number)
- `stock` (number)
- `barcode` (string)
- `image` (string, URL path)

### Purchase
- `id` (number)
- `member_id` (number)
- `member_name` (string)
- `product_id` (number)
- `product_name` (string)
- `timestamp` (string, datetime)

### RestockHistory
- `id` (number)
- `product_id` (number)
- `product_name` (string)
- `barcode` (string)
- `unit_price` (number)
- `price` (number)
- `quantity` (number)
- `subtotal` (number)
- `timestamp` (string, datetime)
