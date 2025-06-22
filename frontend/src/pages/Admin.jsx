// frontend/src/pages/Admin.jsx
import { useEffect, useRef, useState } from "react";
import AdminTable from "../components/AdminTable";
import RestockForm from "../components/RestockForm";

export default function Admin() {
  const [password, setPassword] = useState(
    localStorage.getItem("adminPass") || ""
  );
  const [tab, setTab] = useState(null);
  const ref = useRef(null);

  /* 初回パスワード入力 */
  useEffect(() => {
    if (!password) {
      const p = window.prompt("管理者パスワードを入力してください 🔐");
      if (p) {
        setPassword(p);
        localStorage.setItem("adminPass", p);
      }
    }
  }, [password]);

  const tabs = [
    { key: "members", label: "メンバー一覧", type: "table" },
    { key: "products", label: "商品一覧", type: "table" },
    { key: "purchases", label: "購入履歴", type: "table" },
    { key: "restock_history", label: "仕入れ履歴", type: "table" },
    { key: "restock_import", label: "仕入れ登録", type: "import" }, // ★追加
  ];

  /* コンテンツ切替 */
  const renderBody = () => {
    if (!tab)
      return (
        <p className="text-gray-400 text-lg">
          上のボタンで機能を選択してください 😊
        </p>
      );
    const current = tabs.find((t) => t.key === tab);
    if (current.type === "table") {
      return <AdminTable ref={ref} table={tab} password={password} key={tab} />;
    }
    if (current.type === "import") {
      return <RestockForm ref={ref} password={password} key="import" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans px-6 py-10">
      {/* ナビゲーション */}
      <header className="flex flex-wrap items-center gap-4 mb-8">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl transition font-bold
              ${
                tab === key ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
          >
            {label}
          </button>
        ))}

        {/* 確定ボタン */}
        <button
          onClick={() => ref.current?.commit()}
          className="ml-auto px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold shadow-lg"
          disabled={!tab}
        >
          ✅ 確定
        </button>
      </header>

      {/* メイン表示 */}
      {renderBody()}
    </div>
  );
}
