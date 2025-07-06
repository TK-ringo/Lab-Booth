# 🎉 Lab Booth のリポジトリへようこそ

## 🌟 概要

Lab Booth は **React + Vite + Tailwind CSS** 製のフロントエンドと **Express + SQLite（better-sqlite3）** 製のバックエンドで構成された、研究室向けの購買管理アプリです 🧪🍫

**Docker Compose で一発起動**でき、商品購入や請求書作成を簡単に管理できます 📦🧾


## 🚀 前提条件

- Docker / Docker Compose 🐳
- ポート `3000`（フロント）・`3001`（バックエンド）を使用可能であること


## ⚙️ クイックスタート

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/your/repo.git
   cd lab-booth
   ```

2. **`.env` ファイルを backend に配置**

   ```env
   PORT=3001
   DATABASE_PATH=./data/shop.db
   ADMIN_PASSWORD=your-strong-password
   ```

3. **コンテナ起動**

   ```bash
   docker-compose up --build
   ```

4. **アクセス**

   * フロントエンド: [http://localhost:3000](http://localhost:3000)
   * 管理画面: [http://localhost:3000/admin](http://localhost:3000/admin)


## 🖼️ 商品画像のアップロード

商品カード右下の ✏️ アイコンをクリックすると画像変更が可能です。

* **最大サイズ: 10MB**
* 画像は `backend/uploads/` に保存され、**データベースとともに永続化**されます。


## 🧾 請求書の自動生成

管理画面 `/admin` から次のことが可能です：

* 月ごとの清算データをもとに**請求額を自動計算**
* 任意の「繰越」「前払い」を入力
* **CSV ダウンロード / PDF 印刷機能付き**

💡 **ファイル名は自動で `invoice_2025_07.csv` のように生成されます**


## 🛠️ 開発モードでの起動（ホットリロード対応）

```bash
npm run dev
```

* `frontend/` と `backend/` を同時にホットリロードで開発可能


## 📁 ディレクトリ構成

```
lab-booth/
├─ backend/         # Express + SQLite API
│  ├─ src/
│  └─ uploads/      # 商品画像
│  └─ data/         # データベース（自動生成）
├─ frontend/        # React + Vite UI
├─ docker-compose.yml
└─ README.md        
```


## 📦 永続化されるデータ

* `backend/data/shop.db`：SQLite データベース
* `backend/uploads/`：商品画像

これらはホスト側にマウントされているため、コンテナを削除しても保持されます 📂


## 🔐 認証情報（管理画面）

管理画面 `/admin` では以下のいずれかでログイン可能です：

* HTTP Basic 認証
* `x-admin-pass` ヘッダー
* JWT（/login で取得）


## 🤝 コントリビュート

バグ報告や改善提案は Issue または Pull Request にて歓迎します！


