import { useState, useCallback } from "react";
import NameSelector from "./components/NameSelector";
import ProductList from "./components/ProductList";
import CartList from "./components/CartList";
import Toast from "./components/Toast";
import useBarcodeScanner from "./hooks/useBarcodeScanner";
import { products as initialProducts } from "./data/sampleData";

export default function App() {
  const [currentName, setCurrentName] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  // カートに追加＋在庫デクリメント
  const addProduct = useCallback((product) => {
    setCart((c) => [...c, product]);
    setProducts((ps) =>
      ps.map((p) => (p.id === product.id ? { ...p, stock: p.stock - 1 } : p))
    );
    setToast({ msg: `${product.name} を追加しました。`, type: "success" });
  }, []);

  // カートから削除＋在庫インクリメント
  const removeProduct = useCallback((index) => {
    setCart((c) => {
      const removed = c[index];
      setProducts((ps) =>
        ps.map((p) => (p.id === removed.id ? { ...p, stock: p.stock + 1 } : p))
      );
      return c.filter((_, i) => i !== index);
    });
  }, []);

  // バーコードスキャン処理：在庫があるものだけ追加
  const handleScan = useCallback(
    (code) => {
      const found = products.find((p) => p.barcode === code && p.stock > 0);
      if (found) {
        addProduct(found);
      } else {
        setToast({
          msg: "読み取りエラー：もう一度読み取ってください。",
          type: "error",
        });
      }
    },
    [addProduct, products]
  );

  useBarcodeScanner(handleScan);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-16 pb-40">
      {/* タイトル */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-center tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
        ISELab Shop
      </h1>

      {/* 名前選択 */}
      <div className="flex justify-center">
        <NameSelector
          currentName={currentName}
          setCurrentName={setCurrentName}
        />
      </div>

      {/* 商品 & カート */}
      <div className="flex flex-col lg:flex-row gap-12">
        <ProductList products={products} onAdd={addProduct} />
        <CartList cart={cart} onRemove={removeProduct} />
      </div>

      {/* 確定ボタン */}
      <button
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-3/5 rounded-full py-6 text-2xl font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 transition shadow-2xl backdrop-blur-md"
        onClick={() =>
          setToast({ msg: "購入確定機能は未実装です。", type: "info" })
        }
      >
        ✅ 確定
      </button>

      {/* トースト */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
