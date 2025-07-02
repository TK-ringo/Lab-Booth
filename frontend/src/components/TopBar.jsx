// frontend/src/components/TopBar.jsx
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function TopBar() {
  const { isLoggedIn, login, logout } = useContext(AuthContext);

  /* ---- クリックでログイン / ログアウト ---- */
  const handleClick = async () => {
    if (isLoggedIn) return logout();

    const pwd = window.prompt("管理者パスワードを入力してください 🔐");
    if (!pwd) return;

    try {
      await login(pwd);
      alert("🙌 ログインしました！");
    } catch {
      alert("❌ パスワードが違います");
    }
  };

  /* ---- 右上寄せだけの通常フロー ---- */
  return (
    <div className="w-full flex justify-end py-4">
      <button
        onClick={handleClick}
        className="px-4 py-2 rounded-xl bg-gray-800/70 backdrop-blur
                   border border-gray-600 hover:bg-gray-700 font-bold"
      >
        {isLoggedIn ? "🚪 ログアウト" : "🔑 ログイン"}
      </button>
    </div>
  );
}
