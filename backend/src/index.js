// backend/src/index.js
import express from "express";
import dotenv from "dotenv";
import db from "./db/init.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import adminAuth from "./adminAuth.js";
import parseOrderItems from "./parseOrderItems.js"; // ←★★ 追加 ★★

dotenv.config();
const app = express();
app.use(express.json());

/* ===== 画像アップロード設定 ===== */
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product_${req.params.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
app.use("/api/uploads", express.static(uploadDir));
/* ================================= */

/* ───────── 一般利用 API ───────── */
app.get("/api/members", (_req, res) => {
  try {
    const members = db.prepare("SELECT * FROM members").all();
    res.json({ members });
  } catch {
    res.status(500).json({ error: "メンバー取得に失敗しました" });
  }
});

app.get("/api/products", (_req, res) => {
  try {
    const products = db.prepare("SELECT * FROM products").all();
    res.json({ products });
  } catch {
    res.status(500).json({ error: "商品取得に失敗しました" });
  }
});

app.post("/api/purchase", (req, res) => {
  try {
    const { memberId, productIds } = req.body;
    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT INTO purchases (member_id, product_id, timestamp)
      VALUES (?, ?, ?)
    `);
    const updateStock = db.prepare(
      "UPDATE products SET stock = stock - 1 WHERE id = ?"
    );

    db.transaction(() => {
      productIds.forEach((pid) => {
        insert.run(memberId, pid, now);
        updateStock.run(pid);
      });
    })();

    res.json({
      members: db.prepare("SELECT * FROM members").all(),
      products: db.prepare("SELECT * FROM products").all(),
    });
  } catch {
    res.status(500).json({ error: "購入処理に失敗しました" });
  }
});

/* ----- 画像アップロード API ----- */
app.post("/api/products/:id/image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "画像がありません" });
    const id = Number(req.params.id);
    const publicPath = `/api/uploads/${req.file.filename}`;
    db.prepare("UPDATE products SET image = ? WHERE id = ?").run(
      publicPath,
      id
    );
    res.json({
      product: db.prepare("SELECT * FROM products WHERE id = ?").get(id),
    });
  } catch {
    res.status(500).json({ error: "画像アップロードに失敗しました" });
  }
});

/* ----- multer サイズ超過 ----- */
app.use((err, _req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "画像が大きすぎます（最大10MB）" });
  }
  next(err);
});
/* -------------------------------- */

/* ======== 🔐 管理者 API ======== */
const VALID_TABLES = ["members", "products", "purchases", "restock_history"];
app.use("/api/admin", adminAuth);

/* ------ 共通 CRUD ------ */
app.get("/api/admin/:table", (req, res) => {
  try {
    const { table } = req.params;
    const order = req.query.order === "desc" ? "DESC" : "ASC";
    if (!VALID_TABLES.includes(table)) return res.status(404).end();
    const rows = db
      .prepare(`SELECT * FROM ${table} ORDER BY id ${order}`)
      .all();
    res.json({ rows });
  } catch {
    res.status(500).json({ error: "取得失敗" });
  }
});

app.post("/api/admin/:table", (req, res) => {
  try {
    const { table } = req.params;
    if (!VALID_TABLES.includes(table)) return res.status(404).end();
    const row = req.body;
    const cols = Object.keys(row);
    const placeholders = cols.map(() => "?").join(",");
    const stmt = db.prepare(
      `INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`
    );
    const info = stmt.run(...cols.map((c) => row[c]));
    res.json({ id: info.lastInsertRowid });
  } catch {
    res.status(500).json({ error: "追加失敗" });
  }
});

app.put("/api/admin/:table/:id", (req, res) => {
  try {
    const { table, id } = req.params;
    if (!VALID_TABLES.includes(table)) return res.status(404).end();
    const row = req.body;
    const cols = Object.keys(row).filter((c) => c !== "id");
    const setStr = cols.map((c) => `${c}=?`).join(",");
    db.prepare(`UPDATE ${table} SET ${setStr} WHERE id=?`).run(
      ...cols.map((c) => row[c]),
      id
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "更新失敗" });
  }
});

app.delete("/api/admin/:table/:id", (req, res) => {
  try {
    const { table, id } = req.params;
    if (!VALID_TABLES.includes(table)) return res.status(404).end();
    db.prepare(`DELETE FROM ${table} WHERE id=?`).run(id);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "削除失敗" });
  }
});

/* ------ 仕入れ登録エンドポイント ------ */
app.post("/api/admin/restock/import", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text が空です" });

  const items = parseOrderItems(text); // ← ここで正常に呼び出せるように！
  if (items.length === 0)
    return res.status(400).json({ error: "商品が抽出できませんでした" });

  const findProduct = db.prepare("SELECT id FROM products WHERE barcode = ?");
  const insertProduct = db.prepare(`
    INSERT INTO products (name, price, stock, barcode)
    VALUES (?, ?, ?, ?)
  `);
  const updateProduct = db.prepare(
    "UPDATE products SET price = ?, stock = stock + ? WHERE id = ?"
  );
  const insertRestock = db.prepare(`
    INSERT INTO restock_history
      (product_id, product_name, barcode, unit_price, quantity, subtotal)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    items.forEach((it) => {
      // products テーブルを検索／更新／挿入
      let prod = findProduct.get(it.barcode);
      let productId;
      if (prod) {
        updateProduct.run(it.price, it.quantity, prod.id);
        productId = prod.id;
      } else {
        const info = insertProduct.run(
          it.product_name,
          it.price,
          it.quantity,
          it.barcode
        );
        productId = info.lastInsertRowid;
      }

      // restock_history へ追加
      insertRestock.run(
        productId,
        it.product_name,
        it.barcode,
        it.unit_price,
        it.quantity,
        it.subtotal
      );
    });
  })();

  res.json({ ok: true, imported: items.length });
});
/* ================================= */

/* サーバ起動 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Backend listening on http://localhost:${PORT}`)
);
