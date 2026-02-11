import { useRef, useState, useMemo } from "react";
import { uploadProductImage } from "../api";
import MarqueeText from "./MarqueeText";

/**
 * Product card tile
 * props:
 * - size: 'lg' | 'md' | 'sm' (default 'lg')
 */
export default function ProductCard({ product, onAdd, onImageUpload, size = "lg" }) {
  const fileRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  const styles = useMemo(() => {
    switch (size) {
      case "md":
        return {
          image: "h-32",
          title: "text-base",
          padding: "p-3",
          addBtn: "py-1.5 text-sm",
          editBtnPad: "p-1.5",
          editBtnText: "text-lg",
          editOffset: "bottom-2 right-2",
        };
      case "sm":
        return {
          image: "h-24",
          title: "text-sm",
          padding: "p-2.5",
          addBtn: "py-1.5 text-sm",
          editBtnPad: "p-1",
          editBtnText: "text-base",
          editOffset: "bottom-1 right-1",
        };
      case "lg":
      default:
        return {
          image: "h-40",
          title: "text-lg",
          padding: "p-4",
          addBtn: "py-2 text-base",
          editBtnPad: "p-2",
          editBtnText: "text-xl",
          editOffset: "bottom-2 right-2",
        };
    }
  }, [size]);

  /* ---------- 画像アップロード ---------- */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const updated = await uploadProductImage(product.id, file);
      onImageUpload(updated);
      setImgError(false);
    } catch (err) {
      console.error(err);
      alert("画像のアップロードに失敗しました😢");
    }
  };

  /* ---------- 画像領域 ---------- */
  const ImageArea = () =>
    product.image && !imgError ? (
      <img
        src={product.image}
        alt={product.name}
        className={`w-full ${styles.image} object-cover rounded-2xl`}
        onError={() => setImgError(true)}
      />
    ) : (
      <div className={`w-full ${styles.image} flex items-center justify-center rounded-2xl bg-gray-700 text-gray-400 text-sm`}>
        no image
      </div>
    );

  /* ---------- 描画 ---------- */
  return (
    <div
  className={`group relative overflow-hidden rounded-3xl
              bg-gray-800/50 backdrop-blur-md shadow-glass
              ${styles.padding} flex flex-col gap-3 hover:scale-[1.03] transition`}
    >
      {/* 画像 + 編集ボタン */}
      <div className="relative">
        <ImageArea />

        <button
          onClick={() => fileRef.current?.click()}
          title="画像を追加 / 編集"
          className={`absolute ${styles.editOffset} ${styles.editBtnPad} rounded-full
                      bg-gray-900/70 text-white ${styles.editBtnText} hover:bg-gray-800/80`}
        >
          ✏️
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 商品名 & 価格 */}
      <div>
        <h3 className={`${styles.title} font-semibold leading-snug`}>
          <MarqueeText>{product.name}</MarqueeText>
        </h3>
        <p className="text-sm text-gray-400">{product.price}円</p>
      </div>

      {/* 追加ボタン */}
      <button
        onClick={() => onAdd(product)}
        className={`w-full font-semibold rounded-xl ${styles.addBtn}
                    bg-gradient-to-r from-indigo-600 to-purple-600
                    hover:opacity-90 transition text-white`}
      >
        追加
      </button>
    </div>
  );
}
