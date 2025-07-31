// frontend/src/App.jsx
import { useState, useEffect, useCallback } from "react";
import { fetchMembers, fetchProducts, postPurchase } from "./api";
import NameSelector from "./components/NameSelector";
import ProductList from "./components/ProductList";
import CartList from "./components/CartList";
import Toast from "./components/Toast";
import useBarcodeScanner from "./hooks/useBarcodeScanner";
import useSoundEffects from "./hooks/useSoundEffects";
import TopBar from "./components/TopBar";

export default function App() {
  /* ---------- 状態 ---------- */
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentMember, setMember] = useState(null);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setLoading] = useState(true);

  /* 🎵 効果音フック */
  const { play } = useSoundEffects();

  /* ---------- 初期データ取得 ---------- */
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

  /* ---------- カート追加 ---------- */
  /**
   * @param {object} product - 追加する商品
   * @param {boolean} playSound - 効果音を鳴らすか（デフォルト true）
   */
  const addProduct = useCallback(
    (product, playSound = true) => {
      if (playSound) play("addProduct"); // 🔑 ここを条件付きに！
      setCart((c) => [...c, product]);
      setProducts((ps) =>
        ps.map((p) => (p.id === product.id ? { ...p, stock: p.stock - 1 } : p))
      );
      setToast({ msg: `${product.name} を追加しました😊`, type: "success" });
    },
    [play]
  );

  /* ---------- カート削除 ---------- */
  const removeProduct = useCallback((index) => {
    setCart((c) => {
      const removed = c[index];
      setProducts((ps) =>
        ps.map((p) => (p.id === removed.id ? { ...p, stock: p.stock + 1 } : p))
      );
      return c.filter((_, i) => i !== index);
    });
  }, []);

  /* ---------- 画像アップロード後の商品情報更新 ---------- */
  const handleImageUpload = useCallback((updated) => {
    setProducts((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
    setToast({ msg: "画像を更新しました🖼️", type: "success" });
  }, []);

  /* ---------- 購入確定 ---------- */
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
      play("confirm");
      setMembers(ms);
      setProducts(ps);
      setCart([]);
      setMember(null);
      setToast({ msg: "購入が完了しました🎉", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ msg: "購入処理に失敗しました😢", type: "error" });
    }
  };

  /* ---------- バーコードスキャン ---------- */
  const handleScan = useCallback(
    (code) => {
      const product = products.find((p) => p.barcode === code);
      if (!product) {
        play("scanError");
        setToast({ msg: "登録されていない商品です😢", type: "error" });
        return;
      }
      play("scanSuccess");           // ✅ 成功音だけ再生
      addProduct(product, false);    // 🔕 追加音は鳴らさない
    },
    [products, addProduct, play]
  );
  useBarcodeScanner(handleScan);

  /* ---------- ローディング ---------- */
  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        読み込み中…
      </div>
    );

  /* ---------- 画面描画 ---------- */
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-12 h-full">
      {/* タイトル中央・ログインボタン右寄せ */}
      <div className="relative flex items-center mt-6 mb-2 min-h-[3.5rem]">
        <h1
          className="absolute left-1/2 -translate-x-1/2 text-5xl md:text-6xl font-extrabold tracking-wider
                      bg-clip-text text-transparent bg-gradient-to-r
                      from-indigo-400 via-purple-400 to-pink-400"
          style={{ whiteSpace: "nowrap" }}
        >
          Lab Booth
        </h1>
        <div className="ml-auto">
          <TopBar />
        </div>
      </div>

      {/* 名前選択 */}
      <div className="flex justify-center mb-2">
        <NameSelector
          members={members}
          currentMember={currentMember}
          setCurrentMember={setMember}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
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
