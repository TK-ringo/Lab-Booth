// backend/src/index.js
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

// 購入処理（従来の購入）
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

// 仕入れ履歴一覧取得
app.get("/api/restocks", (req, res) => {
  try {
    const restocks = db
      .prepare("SELECT * FROM restock_history ORDER BY timestamp DESC")
      .all();
    res.json({ restocks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "仕入れ履歴の取得に失敗しました" });
  }
});

// 仕入れ登録API
app.post("/api/restock", (req, res) => {
  try {
    const { productId, unitPrice, quantity } = req.body;
    // 商品情報取得
    const product = db
      .prepare("SELECT name, barcode FROM products WHERE id = ?")
      .get(productId);
    if (!product) {
      return res.status(404).json({ error: "商品が見つかりません" });
    }

    const subtotal = unitPrice * quantity;
    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT INTO restock_history
        (product_id, product_name, barcode, unit_price, quantity, subtotal, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const updateStock = db.prepare(`
      UPDATE products SET stock = stock + ? WHERE id = ?
    `);

    // トランザクションで在庫更新＋履歴記録
    db.transaction(() => {
      insert.run(
        productId,
        product.name,
        product.barcode,
        unitPrice,
        quantity,
        subtotal,
        now
      );
      updateStock.run(quantity, productId);
    })();

    // 更新後の在庫情報を返却
    const products = db.prepare("SELECT * FROM products").all();
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "仕入れ登録に失敗しました" });
  }
});

// サーバ起動
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
