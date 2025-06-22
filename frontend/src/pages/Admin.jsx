// frontend/src/pages/Admin.jsx
import { useEffect, useRef, useState } from "react";
import AdminTable from "../components/AdminTable";

export default function Admin() {
  const [password, setPassword] = useState(
    localStorage.getItem("adminPass") || ""
  );
  const [table, setTable] = useState(null);
  const tableRef = useRef(null);

  /* パスワード入力ダイアログ（初回） */
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
    { key: "members", label: "メンバー一覧" },
    { key: "products", label: "商品一覧" },
    { key: "purchases", label: "購入履歴" },
    { key: "restock_history", label: "仕入れ履歴" },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans px-6 py-10">
      {/* ナビゲーション */}
      <header className="flex flex-wrap items-center gap-4 mb-8">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTable(key)}
            className={`px-4 py-2 rounded-xl transition font-bold
              ${
                table === key
                  ? "bg-indigo-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
          >
            {label}
          </button>
        ))}

        {/* 確定ボタン */}
        <button
          onClick={() => tableRef.current?.commit()}
          className="ml-auto px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold shadow-lg"
          disabled={!table}
        >
          ✅ 確定
        </button>
      </header>

      {/* テーブル表示部 */}
      {table ? (
        <AdminTable ref={tableRef} table={table} password={password} />
      ) : (
        <p className="text-gray-400 text-lg">
          上のボタンでテーブルを選択してください 😊
        </p>
      )}
    </div>
  );
}
