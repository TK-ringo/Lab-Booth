# 🎉 Lab Booth README.txt

## 🌟 概要

Lab Booth は **React + Vite + Tailwind CSS** 製のフロントエンドと **Express + better-sqlite3** 製のバックエンドから成る “研究室向け購買管理アプリ” です。Docker Compose で一発起動できるので、複雑なセットアップなしに “無人売店” をサクッと立ち上げられます 🏪✨

## 🚀 必要条件

1. **Docker** と **Docker Compose** が動く環境 🐳
2. ポート `3000`（フロント）と `3001`（バックエンド）が空いていること 🔌

## ⚙️ クイックスタート

1. **リポジトリをクローン**

   ```bash
   git clone https://github.com/<YOUR-ORG>/lab-booth.git
   cd lab-booth
   ```

2. **backend/.env を用意**

   ```
   PORT=3001
   DATABASE_PATH=./data/shop.db
   ADMIN_PASSWORD=your-strong-password
   ```

3. **コンテナをビルドして起動**

   ```bash
   docker-compose up --build
   ```

4. ブラウザで [http://localhost:3000](http://localhost:3000) を開けば完了 🎈

## 🗂️ ディレクトリ構成

```
lab-booth/
├─ backend/        ← Express API & SQLite
│  ├─ src/
│  └─ data/        (起動時に自動生成・Git 管理外)
├─ frontend/       ← React + Vite SPA
├─ docker-compose.yml
└─ README.md      ← ★ コレ！
```

## 🔐 非公開ファイルと .gitignore

- **`.env`** : パスワードやポート設定を含むため **リポジトリには入れません** 🛡️
- **`backend/data/`** : SQLite データベース。コンテナ起動時に生成され、ホスト側にボリュームマウントされます 📂
- **`backend/uploads/`** : 商品画像の保存先。こちらもボリュームで永続化されます 🖼️
- **`node_modules/` / `dist/` / `*.log`** などの生成物も Git には含まれません 🚫

これらは `.gitignore` で除外されていますので、GitHub 上には存在しません。クローン直後は空ディレクトリ、または存在しない状態が正しい挙動です 💡

## 💾 データベースと画像の永続化

初回起動後に **backend/data/shop.db** と **backend/uploads/** が自動生成されます。
ホスト側にマウントされるため、コンテナを再ビルドしてもデータと画像は失われません 🤩

## 🛠️ 開発モード

ローカルでホットリロードを有効にしたい場合は、次のコマンドでフロントエンドとバックエンドを同時起動できます。

```bash
npm run dev
```

コードを保存すると即座にブラウザへ反映 🔄✨

## 📮 管理者ページ

- URL: `/admin`
- 認証: **Basic 認証** または **`x-admin-pass` ヘッダー**
- パスワードは `.env` の `ADMIN_PASSWORD` で設定します 🔑

## 🎨 画像アップロード

商品カード右下の ✏️ アイコンから画像を変更できます。
1 ファイルあたり **10 MB** までアップロード可能です（Nginx 側で 20 MB まで許可）。

## 🤝 コントリビュート

バグ報告や機能提案、大歓迎です！
Issue や Pull Request でお気軽にご連絡ください 🧑‍💻💬

## 📜 ライセンス

本プロジェクトは **MIT License** です。詳細は `LICENSE` をご確認ください 📄✨

✨ 以上で README は終わりです。Lab Booth を楽しんでください 🎉
