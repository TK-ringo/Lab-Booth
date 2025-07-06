## 🎉 Lab Booth リポジトリへようこそ

### 🌟 概要

Lab Booth は研究室向けの無人売店管理アプリケーションです。
フロントエンドに **React + Vite + Tailwind CSS**、バックエンドに **Express + better-sqlite3** を採用し、Docker Compose 一発起動で手軽に利用できます🏪✨

### 🚀 必要条件

1. Docker と Docker Compose が動作する環境🐳
2. 空きポート `3000`（フロント）および `3001`（バック）🔌
3. `.env` に設定する管理者パスワード（後述）

### ⚙️ クイックスタート

1. **リポジトリをクローン**

   ```bash
   git clone https://github.com/TK-ringo/Lab-Booth.git
   cd Lab-Booth
   ```
2. **環境変数ファイルを準備**
   プロジェクト直下に `.env` を作成し、以下を記載します

   ```env
   PORT=3001
   DATABASE_PATH=./data/shop.db
   ADMIN_PASSWORD=your-strong-password  # 管理画面のログインに使用します🔑
   ```
3. **コンテナをビルド＆起動**

   ```bash
   docker-compose up --build
   ```
4. **ブラウザでアクセス**
   フロントエンド：[http://localhost:3000](http://localhost:3000)
   管理画面：[http://localhost:3000/admin](http://localhost:3000/admin)

### 🗂️ ディレクトリ構成

```
Lab-Booth/
├─ backend/        ← Express API & SQLite データベース
│  ├─ src/         ← ソースコード一式
│  ├─ data/        ← DB 保存先（起動時自動生成）
│  └─ uploads/     ← 商品画像保存先（自動生成）
├─ frontend/       ← React + Vite SPA
├─ docker-compose.yml
└─ README.md       ← ★ こちら！
```

### 🔐 認証と管理画面

バックエンドの管理用 API `/api/admin/*` へは以下のいずれかでログイン可能です

1. `/api/login` へ POST で `{"password": "<ADMIN_PASSWORD>"}` を送信し、返却される Bearer トークン
2. HTTP Basic 認証（ユーザー名は任意、パスワードに `<ADMIN_PASSWORD>`）
3. `x-admin-pass` ヘッダーに `<ADMIN_PASSWORD>` を設定

フロントの管理画面は `/admin` 以下で展開され、CRUD 操作や請求書集計が可能です🛠️

### 🧾 請求書（インボイス）生成機能

管理画面の「Invoice」タブでは以下を行えます

* 対象年月を選択すると自動的にメンバーごとの精算額を集計
* CSV ダウンロード📥
* 印刷／PDF 保存🖨️

### 💾 データと画像の永続化

* `backend/data/shop.db` に SQLite データが保存
* `backend/uploads/` にアップロード画像が保存
  いずれもホスト側ボリュームにマウントされるため、再ビルドしても消えません🤩

### 🛠️ 開発モード

ホットリロード付きでフロントとバックを同時起動するには

```bash
npm install   # 各ディレクトリで一度だけ実行
npm run dev   # プロジェクトルートで実行
```

これでコードを保存すると即時ブラウザ反映🔄✨

### 🤝 コントリビュート大歓迎

バグ報告や機能提案は Issue や Pull Request でお気軽にどうぞ🧑‍💻💬


ぜひ Lab Booth をお試しください！🎈
