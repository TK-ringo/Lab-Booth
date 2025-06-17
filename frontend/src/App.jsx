// src/App.jsx
import { useState, useEffect, useCallback } from "react";
import { fetchMembers, fetchProducts, postPurchase } from "./api";
import NameSelector from "./components/NameSelector";
import ProductList from "./components/ProductList";
import CartList from "./components/CartList";
import Toast from "./components/Toast";
import useBarcodeScanner from "./hooks/useBarcodeScanner";

export default function App() {
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentMember, setMember] = useState(null);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setLoading] = useState(true);

  // 初期データ取得
  useEffect(() => {
    (async () => {
      try {
        const [ms, ps] = await Promise.all([fetchMembers(), fetchProducts()]);
        setMembers(ms);
        setProducts(ps);
      } catch (err) {
        console.error(err);
        setToast({ msg: "初期データの取得に失敗しました😢", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // カートに追加＋在庫デクリメント
  const addProduct = useCallback((product) => {
    setCart((c) => [...c, product]);
    setProducts((ps) =>
      ps.map((p) => (p.id === product.id ? { ...p, stock: p.stock - 1 } : p))
    );
    setToast({ msg: `${product.name} を追加しました😊`, type: "success" });
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

  // 確定ボタン押下時
  const handleConfirm = async () => {
    if (!currentMember) {
      setToast({ msg: "名前を選択してください", type: "info" });
      return;
    }
    if (cart.length === 0) {
      setToast({ msg: "まず商品を追加してください", type: "info" });
      return;
    }
    try {
      const { members: ms, products: ps } = await postPurchase({
        memberId: currentMember.id,
        productIds: cart.map((p) => p.id),
      });
      setMembers(ms);
      setProducts(ps);
      setCart([]);
      setToast({ msg: "購入が完了しました🎉", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ msg: "購入処理に失敗しました😢", type: "error" });
    }
  };

  // バーコード読み取り時
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
    [products, addProduct]
  );

  // フォーカスしていないときのみスキャン有効
  useBarcodeScanner(handleScan);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        読み込み中…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-16 pb-40">
      <h1
        className="text-5xl md:text-6xl font-extrabold text-center tracking-wider
                     bg-clip-text text-transparent bg-gradient-to-r
                     from-indigo-400 via-purple-400 to-pink-400"
      >
        Lab Booth
      </h1>

      <div className="flex justify-center">
        <NameSelector
          members={members}
          currentMember={currentMember}
          setCurrentMember={setMember}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <ProductList products={products} onAdd={addProduct} />
        <CartList
          cart={cart}
          onRemove={removeProduct}
          onConfirm={handleConfirm}
        />
      </div>

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
