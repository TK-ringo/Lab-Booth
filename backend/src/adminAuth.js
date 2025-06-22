// backend/src/adminAuth.js
import dotenv from "dotenv";
dotenv.config();

/**
 * 管理者用認証ミドルウェア
 *
 * 1. HTTP Basic 認証       → Authorization: Basic base64("admin:<password>")
 * 2. 独自ヘッダー          → x-admin-pass: <password>
 *
 * いずれかが .env の ADMIN_PASSWORD と一致すれば許可します。
 */
export default function adminAuth(req, res, next) {
  const secret = process.env.ADMIN_PASSWORD;

  /* --- Basic 認証判定 ------------------------------ */
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(auth.slice(6), "base64").toString();
      const [, pwd] = decoded.split(":");
      if (pwd === secret) return next();
    } catch {
      /* デコード失敗は無視して次の判定へ */
    }
  }

  /* --- カスタムヘッダー判定 ------------------------ */
  const pass = req.headers["x-admin-pass"];
  if (pass && pass === secret) return next();

  /* --- 認証失敗 ----------------------------------- */
  res.setHeader("WWW-Authenticate", 'Basic realm="Lab Booth Admin"');
  res.status(401).json({ error: "Unauthorized" });
}
