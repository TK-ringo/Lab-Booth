// src/App.jsx
import { useState, useEffect, useCallback } from "react";
import { fetchMembers, fetchProducts, postPurchase } from "./api";
import NameSelector from "./components/NameSelector";
import ProductList from "./components/ProductList";
import CartList from "./components/CartList";
import Toast from "./components/Toast";
import useBarcodeScanner from "./hooks/useBarcodeScanner";
import TopBar from "./components/TopBar";
import { AuthContext } from "./contexts/AuthContext";

export default function App() {
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentMember, setMember] = useState(null);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setLoading] = useState(true);

  /* ────── 初期データ取得 ────── */
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

  /* ────── カート追加 ────── */
  const addProduct = useCallback((product) => {
    setCart((c) => [...c, product]);
    setProducts((ps) =>
      ps.map((p) => (p.id === product.id ? { ...p, stock: p.stock - 1 } : p))
    );
    setToast({ msg: `${product.name} を追加しました😊`, type: "success" });
  }, []);

  /* ────── カート削除 ────── */
  const removeProduct = useCallback((index) => {
    setCart((c) => {
      const removed = c[index];
      setProducts((ps) =>
        ps.map((p) => (p.id === removed.id ? { ...p, stock: p.stock + 1 } : p))
      );
      return c.filter((_, i) => i !== index);
    });
  }, []);

  /* ────── 画像アップロード後の更新 ────── */
  const handleImageUpload = useCallback((updatedProduct) => {
    setProducts((ps) =>
      ps.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setToast({ msg: "画像を更新しました🖼️", type: "success" });
  }, []);

  /* ────── 購入確定 ────── */
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

  /* ────── バーコードスキャン ────── */
  const handleScan = useCallback(
    (code) => {
      // ① 登録商品かどうか確認
      const product = products.find((p) => p.barcode === code);

      if (!product) {
        setToast({
          msg: "読み取りエラー：登録されていない商品です😢",
          type: "error",
        });
        return;
      }

      // ② 売り切れチェック
      if (product.stock <= 0) {
        setToast({
          msg: `残念！「${product.name}」は売り切れです🍂`,
          type: "error",
        });
        return;
      }

      // ③ 在庫あり → カートへ追加
      addProduct(product);
    },
    [products, addProduct]
  );
  useBarcodeScanner(handleScan);

  /* ────── ローディング表示 ────── */
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        読み込み中…
      </div>
    );
  }

  /* ────── 画面描画 ────── */
  return (
    <>
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-16 pb-40">
        {/* タイトル */}
        <h1
          className="text-5xl md:text-6xl font-extrabold text-center tracking-wider
                     bg-clip-text text-transparent bg-gradient-to-r
                     from-indigo-400 via-purple-400 to-pink-400"
        >
          Lab Booth
        </h1>

        {/* 名前選択 */}
        <div className="flex justify-center">
          <NameSelector
            members={members}
            currentMember={currentMember}
            setCurrentMember={setMember}
          />
        </div>

        {/* 商品一覧 & カート */}
        <div className="flex flex-col lg:flex-row gap-12">
          <ProductList
            products={products}
            onAdd={addProduct}
            onImageUpload={handleImageUpload}
          />
          <CartList
            cart={cart}
            onRemove={removeProduct}
            onConfirm={handleConfirm}
          />
        </div>

        {/* トースト通知 */}
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </>
  );
}
