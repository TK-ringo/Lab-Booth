import dotenv from "dotenv";
dotenv.config();

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = process.env.DATABASE_PATH;
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

// テーブル作成
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
`);

// // サンプルデータ投入（初回のみ）
// const count = db.prepare("SELECT COUNT(*) as cnt FROM members").get().cnt;
// if (count === 0) {
//   const insertMember = db.prepare("INSERT INTO members (name) VALUES (?)");
//   ["Alice", "Bob", "Carol"].forEach((name) => insertMember.run(name));

//   const insertProduct = db.prepare(`
//     INSERT INTO products (name, price, stock, barcode, image)
//     VALUES (?, ?, ?, ?, ?)
//   `);
//   insertProduct.run("Notebook", 200, 10, "9784798063546", "/img/notebook.jpg");
//   insertProduct.run("Pen", 100, 20, "0987654321", "/img/pen.png");
// }

export default db;
