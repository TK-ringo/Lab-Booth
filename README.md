# 🎉 Lab Booth — 研究室向け購買管理アプリ

## 🌟 概要

Lab Booth は **React + Vite + Tailwind CSS** 製フロントエンドと **Express + better-sqlite3** 製バックエンドから成るモノレポ構成のアプリケーションです。  
Docker Compose でワンコマンド起動できるため、面倒な環境構築を気にせず “研究室の無人売店” をすぐに立ち上げられます。

## 🚀 クイックスタート

1. リポジトリをクローンします  
   `git clone https://github.com/<YOUR-ORG>/lab-booth.git && cd lab-booth`

2. **backend/.env** を手元で新規作成します

```env
 # 任意のポートに変更可
 PORT=3001
 # コンテナ内パス。変更不要
 DATABASE_PATH=./data/shop.db
```

3. コンテナをビルドして起動します
   `docker-compose up --build`

ブラウザで **[http://localhost:3000](http://localhost:3000)** にアクセスすれば準備完了です 🎈
バックエンド API は **[http://localhost:3001/api/](http://localhost:3001/api/)** で待ち受けています&#x20;

## 🏗️ ディレクトリ構成

```
lab-booth/
├─ backend/         # Express アプリ
│  ├─ src/          # サーバ本体
│  └─ data/         # SQLite DB（起動時に自動生成）
├─ frontend/        # React + Vite SPA
├─ docker-compose.yml
└─ README.md
```

## ⚙️ 開発モード

ローカルでホットリロードを有効にして開発したい場合は
`npm run dev`
を実行してください。フロントエンドとバックエンドが同時に起動し、変更を即座に反映します&#x20;

## 💾 データベースについて

SQLite ファイル（`.db`）は **コンテナ起動時に自動生成** され、ホスト側の `backend/data` ディレクトリへボリュームマウントされます。
**GitHub にはコミットされない** ため、初回起動後に DB が作られていない場合は権限設定などを確認してください。&#x20;

## 🔐 環境変数 (.env)

`.env` は機密情報を含むため **リポジトリには同梱していません**。必ず各自で準備してください。
最低限必要なのは `PORT` と `DATABASE_PATH` だけです。

## 🖼️ 画像アップロード

- 商品カードの画像をクリックするとファイル選択ダイアログが開き、画像を変更できます
- 1 画像あたりの上限サイズは **10 MB** です（バックエンドで制限）
- Nginx 側では **20 MB** までリクエストを許可しています&#x20;

## 🛠️ カスタマイズのヒント

- **フロントエンド**: `frontend/src/components/` を編集して UI/UX を自由に拡張できます
- **バックエンド** : API を追加したい場合は `backend/src/index.js` にルートを追記し、必要に応じて `db/init.js` でテーブル定義を更新してください

## 🤝 コントリビュート

バグ報告・機能提案は Issue でお気軽にお知らせください。
プルリクエストも大歓迎です 🧑‍💻✨

## 📜 ライセンス

本リポジトリは **MIT License** で公開しています。詳しくは `LICENSE` をご覧ください。
