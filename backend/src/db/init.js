// backend/src/db/init.js
import dotenv from "dotenv";
dotenv.config();

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = process.env.DATABASE_PATH;
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

/* ───────── テーブル作成 ───────── */
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id      INTEGER PRIMARY KEY,
    name    TEXT,
    price   INTEGER,
    stock   INTEGER,
    barcode TEXT UNIQUE,
    image   TEXT
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id         INTEGER PRIMARY KEY,
    member_id  INTEGER,
    product_id INTEGER,
    timestamp  TEXT
  );

  -- restock_history（price 列を含む完全版）
  CREATE TABLE IF NOT EXISTS restock_history (
    id           INTEGER PRIMARY KEY,
    product_id   INTEGER NOT NULL,
    product_name TEXT    NOT NULL,
    barcode      TEXT    NOT NULL,
    unit_price   INTEGER NOT NULL,
    price        INTEGER NOT NULL,
    quantity     INTEGER NOT NULL,
    subtotal     INTEGER NOT NULL,
    timestamp    TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  );
`);

/* ───────── 既存 DB に price 列が無い場合は追加 ───────── */
try {
  const colExists = db
    .prepare("PRAGMA table_info(restock_history)")
    .all()
    .some((c) => c.name === "price");

  if (!colExists) {
    db.exec("ALTER TABLE restock_history ADD COLUMN price INTEGER");
  }
} catch (e) {
  console.error("⚠️ price 列の追加に失敗しました:", e.message);
}

export default db;
