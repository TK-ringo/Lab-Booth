// frontend/src/components/TopBar.jsx
import { useContext, useState, useCallback } from "react";
import { AuthContext } from "../contexts/AuthContext"; // ← 相対パス修正

export default function TopBar() {
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
      <div className="flex justify-end py-0">
        <button
          onClick={handleButtonClick}
          className="px-4 py-2 rounded-xl bg-gray-800/70 backdrop-blur
                     border border-gray-600 hover:bg-gray-700 font-bold flex items-center"
        >
          {/* モバイル：アイコンのみ */}
          <span className="md:hidden">
            {isLoggedIn ? "🚪" : "🔑"}
          </span>
          {/* PC：アイコン＋テキスト */}
          <span className="hidden md:inline">
            {isLoggedIn ? "🚪 ログアウト" : "🔑 ログイン"}
          </span>
        </button>
      </div>

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
                {show ? "🙈" : "👁️"}
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
