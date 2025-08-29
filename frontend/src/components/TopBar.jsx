// frontend/src/components/TopBar.jsx
import { useContext, useState, useCallback } from "react";
import { AuthContext } from "../contexts/AuthContext"; // ← 相対パス修正

export default function TopBar({ children }) {
  const { isLoggedIn, login, logout } = useContext(AuthContext);

  /* ------- モーダル状態 ------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  /* ------- 認証処理 ------- */
  const handleLogin = useCallback(async () => {
    try {
      await login(password);
      alert("🙌 ログインしました！");
      setIsModalOpen(false);
      setPassword("");
      setError("");
    } catch {
      setError("❌ パスワードが違います");
    }
  }, [login, password]);

  /* ------- 右上ボタン ------- */
  const handleButtonClick = () => {
    if (isLoggedIn) {
      logout();
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      {/* 右上のログイン / ログアウト ボタン */}
      <div className="w-full flex justify-end gap-x-4 py-4">
        {/* /admin へのリンク（ログイン時のみ表示） */}
        {isLoggedIn && (
          window.location.pathname.startsWith("/admin") ? (
            <a
              href="/"
              className="px-4 py-2 rounded-xl bg-gray-800/70 backdrop-blur
                        border border-gray-600 hover:bg-gray-700 font-bold"
            >
              🏠 ホームに戻る
            </a>
          ) : (
            <a
              href="/admin"
              className="px-4 py-2 rounded-xl bg-gray-800/70 backdrop-blur
                        border border-gray-600 hover:bg-gray-700 font-bold"
            >
              🛠️ 管理ページ
            </a>
          )
        )}

        <button
          onClick={handleButtonClick}
          className="px-4 py-2 rounded-xl bg-gray-800/70 backdrop-blur
                     border border-gray-600 hover:bg-gray-700 font-bold"
        >
          {isLoggedIn ? "🚪 ログアウト" : "🔑 ログイン"}
        </button>
      </div>

  {/* ログインボタン下の任意コンテンツ */}
  {children}

      {/* ===== モーダル本体 ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-80 shadow-glass">
            <h2 className="text-xl font-bold mb-4 text-center">
              🔐 管理者ログイン
            </h2>

            {/* パスワード入力 + 👁️ トグル */}
            <div className="relative mb-4">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                className="w-full px-4 py-2 pr-10 rounded-lg bg-gray-900
                           border border-gray-600 focus:outline-none"
                placeholder="パスワード"
                autoFocus
              />
              <button
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-200"
                aria-label="パスワード表示切替"
              >
                <span className="material-symbols-outlined">
                  {show ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            {/* エラー表示 */}
            {error && <p className="text-red-400 mb-3 text-sm">{error}</p>}

            {/* 操作ボタン */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setPassword("");
                  setError("");
                }}
                className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold"
              >
                ログイン
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
