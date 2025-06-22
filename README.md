## 🌟 Lab Booth アプリケーション概要

本リポジトリは、研究室用の簡易購買管理システム「Lab Booth」を構築するためのモノレポ構成です。
フロントエンドとバックエンドをそれぞれコンテナ化し、Docker Compose で一括して起動できるようになっています ✨

## 📂 ディレクトリ構成

リポジトリ直下には主に以下のディレクトリ・ファイルがあります。
`frontend` と `backend` に加え、Docker 関連の設定ファイルや.gitignore も配置しています

## 🚀 動作環境・前提条件

- Docker（バージョン 20.10 以上推奨）🐳
- Docker Compose（バージョン 1.29 以上推奨）
- Node.js（開発時のみ。Docker ビルド内で自動インストールされます）

お使いのマシンに Docker と Docker Compose がインストールされていれば、その他のセットアップは不要です 🎉

## 🏗️ インストール＆起動手順

1. リポジトリをクローン

   ```bash
   git clone [https://github.com/your-org/lab-booth.git](https://github.com/your-org/lab-booth.git)
   cd lab-booth
   ```

2. Docker Compose で一括起動

   ```bash
   docker-compose up --build
   ```

   - バックエンドは `localhost:3001` で起動
   - フロントエンドは `localhost:3000` で起動

3. ブラウザで `http://localhost:3000` にアクセスして、動作確認を行ってください 🎈

## 🔍 主な機能

### バックエンド（Express + SQLite）

- 会員一覧取得 API：`GET /api/members`
- 商品一覧取得 API：`GET /api/products`
- 購入処理 API：`POST /api/purchase`

  - リクエストボディ例

    ```json
    {
      "memberId": 1,
      "productIds": [2, 3]
    }
    ```

- better-sqlite3 を用いた軽量 DB 実装&#x20;

### フロントエンド（React + Vite + Tailwind CSS）

- 会員選択ドロップダウン
- 商品一覧表示＆検索
- バーコードスキャン入力対応（Enter キーで確定）
- カート追加・削除・合計金額表示
- 購入確定ボタンでバックエンド連携
- Toast による操作フィードバック表示

## ⚙️ 環境変数

バックエンド用の`.env`ファイル（`backend/.env`）に以下を設定してください

```
PORT=3001
DATABASE_PATH=./data/shop.db
```

## 📦 Docker 設定

- **docker-compose.yml**

  - `frontend` サービスは Nginx でビルド成果物を配信
  - `backend` サービスは Node.js コンテナで Express アプリを起動

- **.dockerignore** / **.gitignore**

  - 不要ファイル（`node_modules`, `dist`, `.env`など）を除外設定済み

## 🛠️ 開発モード

ローカルでホットリロードを効かせたい場合は、以下コマンドで両方の開発サーバーを同時起動できます 🛠️

```bash
npm run dev
```

（`concurrently` が両方の `dev` スクリプトを並列実行します）

## 🤝 貢献について

バグ報告や機能追加のプルリクエストは大歓迎です！
Issue を立ててから進めていただけるとスムーズです 😘

## 📄 ライセンス

MIT License

Happy Coding！🔧🎉
