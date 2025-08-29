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
  const [viewMode, setViewMode] = useState("icons-lg"); // 大をデフォルト

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

  // 表示モードの永続化（名前ごと）
  useEffect(() => {
    if (!currentMember?.name) return; // 未選択時は保存しない/読み込まない
    const key = `labbooth:viewMode:${currentMember.name}`;
    const saved = localStorage.getItem(key);
    setViewMode(saved || "icons-lg");
  }, [currentMember?.name]);
  useEffect(() => {
    if (!currentMember?.name) return;
    const key = `labbooth:viewMode:${currentMember.name}`;
    localStorage.setItem(key, viewMode);
  }, [viewMode, currentMember?.name]);

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
    <>
      <TopBar>
        {/* 表示切替（ログインボタン下に表示） */}
        <div className="w-full flex justify-end px-4 -mt-4">
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-400 mr-1">表示:</span>
            {[
              { id: "icons-lg", label: "大" },
              { id: "icons-md", label: "中" },
              { id: "icons-sm", label: "小" },
              { id: "details", label: "詳細" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id)}
                className={`px-3 py-1 rounded-full border transition ${
                  viewMode === m.id
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-gray-800/60 text-gray-200 border-gray-700 hover:bg-gray-700/60"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </TopBar>
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-16 pb-40">
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

        <div className="flex flex-col lg:flex-row gap-12">
          <ProductList
            products={products}
            onAdd={addProduct}          
            onImageUpload={handleImageUpload}
            viewMode={viewMode}
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
    </>
  );
}
