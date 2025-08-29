// src/components/ProductList.jsx
import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";

/**
 * props:
 * - viewMode: 'icons-lg' | 'icons-md' | 'icons-sm' | 'details'
 */
export default function ProductList({ products, onAdd, onImageUpload, viewMode = "icons-lg" }) {
  const [query, setQuery] = useState("");

  /* --- フィルタリング --- */
  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query, products]
  );

  return (
    <div className="flex flex-col w-full lg:w-2/3 min-h-0">
      {/* ── 検索バー ───────────────────────── */}
      <div
        className="sticky top-0 z-10 pb-4 bg-gradient-to-b
                    from-gray-900/90 to-transparent backdrop-blur-sm"
      >
        {/* relative でボタンを重ねるためのラッパー */}
        <div className="relative">
          {/* 入力欄 */}
          <input
            type="text"
            placeholder="🔍 商品名で検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 pr-10 rounded-2xl bg-gray-800/60
                       backdrop-blur-md border border-gray-700
                       focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />

          {/* クリアボタン（入力があるときのみ表示） */}
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="検索語をクリア"
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-gray-400 hover:text-gray-200 text-xl
                         focus:outline-none"
            >
              ×
            </button>
          )}
        </div>

  {/* 表示切替は TopBar 側に移動 */}
      </div>

      {/* ── 商品グリッド ───────────────────── */}
      <div className="flex-1 min-h-0">
        {viewMode === "details" ? (
          <div className="overflow-y-auto max-h-[31.5rem] pr-1 lg:pr-4 mt-2">
            <table className="w-full text-sm border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-gray-900/80 backdrop-blur-sm">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-300">商品名</th>
                  <th className="text-right px-3 py-2 text-gray-300">価格</th>
                  <th className="text-right px-3 py-2 text-gray-300">在庫</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="bg-gray-800/50 backdrop-blur-md border border-gray-700/60 rounded-xl">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        {/* サムネイル */}
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-md" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-700" />
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium">{p.name}</span>
                          {p.barcode && (
                            <span className="text-xs text-gray-400">{p.barcode}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">{p.price}円</td>
                    <td className="px-3 py-2 text-right">{p.stock}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => onAdd(p)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:opacity-90"
                      >
                        追加
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-6">
                      商品が見つかりませんでした。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className={`grid gap-6 pr-1 mt-2 lg:pr-4 overflow-y-auto max-h-[31.5rem] scroll-smooth ${
              viewMode === "icons-sm"
                ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6"
                : viewMode === "icons-md"
                ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "sm:grid-cols-2 md:grid-cols-3" // icons-lg default
            }`}
          >
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={onAdd}
                onImageUpload={onImageUpload}
                size={
                  viewMode === "icons-sm"
                    ? "sm"
                    : viewMode === "icons-md"
                    ? "md"
                    : "lg"
                }
              />
            ))}

            {filtered.length === 0 && (
              <p className="col-span-full text-center text-gray-400">
                商品が見つかりませんでした。
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
