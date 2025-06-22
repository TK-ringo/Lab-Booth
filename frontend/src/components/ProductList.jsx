// src/components/ProductList.jsx
import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";

export default function ProductList({ products, onAdd }) {
  const [query, setQuery] = useState("");

  // 検索フィルター
  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query, products]
  );

  return (
    <div className="flex flex-col w-full lg:w-2/3 min-h-0">
      {/* 🔍 検索ボックス（スクロールしても常に表示） */}
      <div
        className="sticky top-0 z-10 pb-4 bg-gradient-to-b
                    from-gray-900/90 to-transparent backdrop-blur-sm"
      >
        <input
          type="text"
          placeholder="🔍 商品名で検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-gray-800/60
                     backdrop-blur-md border border-gray-700
                     focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* 🎴 カード領域（1.5 行ぶんだけ見せて残りはスクロール） */}
      <div className="relative flex-1 min-h-0">
        {/* フェード（上） */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-8
                     bg-gradient-to-b from-gray-900 via-gray-900/80 to-transparent"
        />
        {/* フェード（下） */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8
                     bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"
        />

        <div
          className="grid gap-6 pr-1 mt-2 sm:grid-cols-2 md:grid-cols-3 lg:pr-4
                     overflow-y-auto max-h-[31.5rem] scroll-smooth"
        >
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
          ))}

          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-400">
              商品が見つかりませんでした。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
