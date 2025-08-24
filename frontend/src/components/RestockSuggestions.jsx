// frontend/src/components/RestockSuggestions.jsx
import { useEffect, useState } from "react";
import ScrollContainer from "./ScrollContainer";

export default function RestockSuggestions({ token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [params, setParams] = useState({ days: 45, targetDays: 30, safetyDays: 10, minSold: 1 });

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError("");
      const q = new URLSearchParams(params).toString();
      const res = await fetch(`/api/admin/restock-suggestions?${q}` , {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "取得に失敗しました");
      setItems(data.suggestions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollContainer
      header={
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm opacity-80">集計日数</label>
            <input
              type="number"
              value={params.days}
              onChange={(e) => setParams((p) => ({ ...p, days: Number(e.target.value) }))}
              className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm opacity-80">購入スパン</label>
            <input
              type="number"
              value={params.targetDays}
              onChange={(e) => setParams((p) => ({ ...p, targetDays: Number(e.target.value) }))}
              className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm opacity-80">安全在庫(日)</label>
            <input
              type="number"
              value={params.safetyDays}
              onChange={(e) => setParams((p) => ({ ...p, safetyDays: Number(e.target.value) }))}
              className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm opacity-80">最低販売数</label>
            <input
              type="number"
              value={params.minSold}
              onChange={(e) => setParams((p) => ({ ...p, minSold: Number(e.target.value) }))}
              className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1"
            />
          </div>
          <button
            onClick={fetchSuggestions}
            className="ml-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
          >
            🔄 更新
          </button>
        </div>
      }
    >
      {loading && <p className="text-gray-400">計算中…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 bg-gray-800 z-10">
            <tr>
              <th className="px-3 py-2 text-left">商品</th>
              <th className="px-3 py-2 text-right">在庫</th>
              <th className="px-3 py-2 text-right">7日販売</th>
              <th className="px-3 py-2 text-right">{params.days}日販売</th>
              <th className="px-3 py-2 text-right">1日速度</th>
              <th className="px-3 py-2 text-right">在庫日数</th>
              <th className="px-3 py-2 text-right">推奨数</th>
              <th className="px-3 py-2 text-left">理由</th>
              <th className="px-3 py-2 text-left">最終購入</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="odd:bg-gray-800/40">
                <td className="px-3 py-2">
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-xs opacity-70">{it.barcode}</div>
                </td>
                <td className="px-3 py-2 text-right">{it.stock}</td>
                <td className="px-3 py-2 text-right">{it.sold_7d}</td>
                <td className="px-3 py-2 text-right">{it.sold_nd}</td>
                <td className="px-3 py-2 text-right">{it.velocity_per_day}</td>
                <td className="px-3 py-2 text-right">{it.days_of_supply === 9999 ? "∞" : it.days_of_supply}</td>
                <td className="px-3 py-2 text-right font-bold text-emerald-400">{it.suggested_qty}</td>
                <td className="px-3 py-2">{it.reason}</td>
                <td className="px-3 py-2 text-xs opacity-70">{it.last_sold_at || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ScrollContainer>
  );
}
