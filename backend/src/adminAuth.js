// backend/src/adminAuth.js
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

/**
 * 管理者用認証ミドルウェア
 * ・Bearer トークン（JWT）
 * ・HTTP Basic
 * ・x-admin-pass ヘッダー
 * のいずれかが .env の ADMIN_PASSWORD と一致すれば許可します。
 */
export default function adminAuth(req, res, next) {
  const secret = process.env.ADMIN_PASSWORD;

  /* --- Bearer JWT ---------------------------- */
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(auth.slice(7), secret);
      if (payload?.role === "admin") return next();
    } catch {
      /* fallthrough */
    }
  }

  /* --- Basic 認証 ---------------------------- */
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(auth.slice(6), "base64").toString();
      const [, pwd] = decoded.split(":");
      if (pwd === secret) return next();
    } catch {
      /* fallthrough */
    }
  }

  /* --- x-admin-pass -------------------------- */
  if (req.headers["x-admin-pass"] === secret) return next();

  /* --- 失敗 ---------------------------------- */
  res.setHeader("WWW-Authenticate", 'Basic realm="Lab Booth Admin"');
  res.status(401).json({ error: "Unauthorized" });
}
