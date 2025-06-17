import express from "express";
import dotenv from "dotenv";
import db from "./db/init.js";

dotenv.config();
const app = express();
app.use(express.json());

// メンバー一覧取得
app.get("/api/members", (req, res) => {
  try {
    const members = db.prepare("SELECT * FROM members").all();
    res.json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "メンバー取得に失敗しました" });
  }
});

// 商品一覧取得
app.get("/api/products", (req, res) => {
  try {
    const products = db.prepare("SELECT * FROM products").all();
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "商品取得に失敗しました" });
  }
});

// 購入処理
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

    // 更新後データを返却
    const members = db.prepare("SELECT * FROM members").all();
    const products = db.prepare("SELECT * FROM products").all();
    res.json({ members, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "購入処理に失敗しました" });
  }
});

// サーバ起動
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
