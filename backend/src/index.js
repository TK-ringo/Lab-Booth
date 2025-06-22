// backend/src/index.js
import express from "express";
import dotenv from "dotenv";
import db from "./db/init.js";
import multer from "multer";
import fs from "fs";
import path from "path";

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

/* ★ 10MB 上限を付与。超過で LIMIT_FILE_SIZE を throw */
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

app.use("/api/uploads", express.static(uploadDir));
/* ================================= */

/* ---------- 既存 API ---------- */
app.get("/api/members", (req, res) => {
  try {
    const members = db.prepare("SELECT * FROM members").all();
    res.json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "メンバー取得に失敗しました" });
  }
});

app.get("/api/products", (req, res) => {
  try {
    const products = db.prepare("SELECT * FROM products").all();
    res.json({ products });
  } catch (err) {
    console.error(err);
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

    const members = db.prepare("SELECT * FROM members").all();
    const products = db.prepare("SELECT * FROM products").all();
    res.json({ members, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "購入処理に失敗しました" });
  }
});

/* ----- 画像アップロード API ----- */
app.post("/api/products/:id/image", upload.single("image"), (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!req.file) {
      return res.status(400).json({ error: "画像がありません" });
    }
    const publicPath = `/api/uploads/${req.file.filename}`;
    db.prepare("UPDATE products SET image = ? WHERE id = ?").run(
      publicPath,
      id
    );
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "画像アップロードに失敗しました" });
  }
});

/* ----- multer のサイズ超過エラーハンドラ ----- */
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "画像が大きすぎます（最大10MB）" });
  }
  next(err);
});
/* -------------------------------- */

/* サーバ起動 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
