// backend/src/adminAuth.js
import dotenv from "dotenv";
dotenv.config();

/**
 * 簡易認証ミドルウェア
 *  フロントから送られてくる `x-admin-pass` ヘッダーを検証します。
 */
export default function adminAuth(req, res, next) {
  const pass = req.headers["x-admin-pass"];
  if (pass && pass === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}
