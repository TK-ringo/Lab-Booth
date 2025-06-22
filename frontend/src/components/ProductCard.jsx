// src/components/ProductCard.jsx
import { useRef } from "react";
import { uploadProductImage } from "../api";

export default function ProductCard({ product, onAdd, onImageUpload }) {
  const fileRef = useRef(null);

  /* 画像クリックで input:file を開く */
  const handleImageClick = () => {
    fileRef.current?.click();
  };

  /* ファイル選択後にアップロード */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const updated = await uploadProductImage(product.id, file);
      onImageUpload(updated);
    } catch (err) {
      console.error(err);
      alert("画像のアップロードに失敗しました😢");
    }
  };

  return (
    <div
      className="h-80 group relative overflow-hidden rounded-3xl bg-gray-800/50
                 backdrop-blur-md shadow-glass p-4 flex flex-col gap-3
                 hover:scale-[1.03] transition"
    >
      {/* 画像はクリック可能に */}
      <img
        src={product.image}
        alt={product.name}
        title="クリックして画像を変更"
        className="w-full h-40 object-cover rounded-2xl cursor-pointer"
        onClick={handleImageClick}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 商品名・価格・在庫 */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-400">{product.price}円</p>
        <p className="text-sm text-gray-400">残量: {product.stock}</p>
      </div>

      {/* 追加ボタン */}
      <button
        onClick={() => onAdd(product)}
        disabled={product.stock <= 0}
        className="mt-auto w-full py-2 font-semibold rounded-xl
                   bg-gradient-to-r from-indigo-600 to-purple-600
                   hover:opacity-90 transition text-white
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        追加
      </button>
    </div>
  );
}
