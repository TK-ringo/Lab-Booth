// frontend/src/components/features/shop/ProductList.jsx
import { forwardRef, useMemo, useState } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import ProductCard from "./ProductCard";

const GridList = forwardRef(({ style, children, ...props }, ref) => (
  <div
    ref={ref}
    style={style}
    {...props}
    className="grid gap-6 pr-1 mt-2 sm:grid-cols-2 md:grid-cols-3 lg:pr-4"
  >
    {children}
  </div>
));

GridList.displayName = "GridList";

const GridItem = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

const EmptyPlaceholder = () => (
  <p className="col-span-full text-center text-gray-400">
    商品が見つかりませんでした。
  </p>
);

export default function ProductList({ products, onAdd, onImageUpload }) {
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
                         text-gray-400 hover:text-gray-200 text-3xl
                         focus:outline-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ── 商品グリッド（仮想スクロール） ───────────────────── */}
      <div className="flex-1 min-h-0">
        <VirtuosoGrid
          data={filtered}
          computeItemKey={(_, product) => product.id}
          style={{ height: "min(31.5rem, calc(100vh - 14rem))" }}
          className="scroll-smooth"
          components={{
            List: GridList,
            Item: GridItem,
            EmptyPlaceholder,
          }}
          itemContent={(_, product) => (
            <ProductCard
              product={product}
              onAdd={onAdd}
              onImageUpload={onImageUpload}
            />
          )}
        />
      </div>
    </div>
  );
}
