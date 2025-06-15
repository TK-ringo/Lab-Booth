export default function ProductCard({ product, onAdd }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-gray-800/50 backdrop-blur-md shadow-glass p-4 flex flex-col gap-3 hover:scale-[1.03] transition">
      <img
        src={product.image}
        alt={product.name}
        className="aspect-square object-cover rounded-2xl"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-400">{product.price}円</p>
        <p className="text-sm text-gray-400">残量: {product.stock}</p>
      </div>
      <button
        onClick={() => onAdd(product)}
        disabled={product.stock <= 0}
        className="mt-auto w-full py-2 font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        追加
      </button>
    </div>
  );
}
