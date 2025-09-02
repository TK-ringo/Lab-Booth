// frontend/src/pages/Admin.jsx
import { useRef, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import TopBar from "../components/TopBar";
import AdminTable from "../components/AdminTable";
import RestockForm from "../components/RestockForm";
import InvoiceGenerator from "../components/InvoiceGenerator";
import RestockSuggestions from "../components/RestockSuggestions";

export default function Admin() {
  const { token, isLoggedIn } = useContext(AuthContext);
  const [tab, setTab] = useState(null);
  const ref = useRef(null);

  /* ----- 未ログイン時案内 ----- */
  if (!isLoggedIn)
    return (
      <>
        <TopBar />
        <div className="h-screen flex items-center justify-center text-xl">
          🔑 右上からログインしてください…
        </div>
      </>
    );

  /* ----- タブ定義 ----- */
  const tabs = [
    { key: "members", label: "メンバー一覧", type: "table" },
    { key: "products", label: "商品一覧", type: "table" },
    { key: "purchases", label: "購入履歴", type: "table" },
    { key: "restock_history", label: "仕入れ履歴", type: "table" },
    { key: "restock_suggestions", label: "仕入れ候補", type: "suggest" },
    { key: "restock_import", label: "仕入れ登録", type: "import" },
    { key: "invoice", label: "請求書作成", type: "invoice" },
  ];

  // 現在のタブ情報を一度だけ算出
  const currentTab = tabs.find((t) => t.key === tab);
  const currentType = currentTab?.type;

  /* ----- タブごとの中身 ----- */
  const renderBody = () => {
    if (!tab)
      return (
        <p className="text-gray-400">上のボタンで機能を選択してください 😊</p>
      );

    if (currentType === "table")
      return <AdminTable ref={ref} table={tab} token={token} key={tab} />;
    if (currentType === "import")
      return <RestockForm ref={ref} token={token} key="import" />;
    if (currentType === "invoice")
      return <InvoiceGenerator token={token} key="inv" />;
    if (currentType === "suggest")
      return <RestockSuggestions token={token} key="sug" />;
  };

  /* ----- 画面 ----- */
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-black text-gray-100 font-sans px-6 py-6">
      <TopBar />

      <header className="flex flex-wrap items-center gap-4 mb-8">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl font-bold transition
              ${
                tab === key ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
          >
            {label}
          </button>
        ))}

        {/* ✅ 右端に寄る確定ボタン */}
        <button
          onClick={() => ref.current?.commit()}
          className="ml-auto px-6 py-2 rounded-xl bg-emerald-600
                     hover:bg-emerald-500 font-bold shadow-lg"
          disabled={!tab || currentType === "invoice" || currentType === "suggest"}
        >
          ✅ 確定
        </button>
      </header>

      <div className="flex-1 overflow-hidden">
        {renderBody()}
      </div>
    </div>
  );
}
