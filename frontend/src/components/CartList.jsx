export default function CartList({ cart, onRemove }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="w-full lg:w-1/3 rounded-3xl bg-gray-800/50 backdrop-blur-md shadow-glass p-6 h-fit lg:sticky lg:top-4">
      <h2 className="text-2xl font-semibold mb-6">🛍️ 追加した商品</h2>

      {cart.length === 0 ? (
        <p className="text-gray-400">まだ何も追加されていません。</p>
      ) : (
        <ul className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {cart.map((item, idx) => (
            <li
              key={`${item.id}-${idx}`}
              className="flex justify-between items-center"
            >
              <span className="truncate max-w-[55%]">{item.name}</span>
              <div className="flex items-center gap-3">
                <span>{item.price}円</span>
                <button
                  onClick={() => onRemove(idx)}
                  className="text-red-400 hover:text-red-300 text-lg font-bold"
                  aria-label="削除"
                >
                  ✖
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cart.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-600 flex justify-between text-xl font-bold">
          <span>合計</span>
          <span>{total}円</span>
        </div>
      )}
    </div>
  );
}
