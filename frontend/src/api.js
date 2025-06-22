const BASE = import.meta.env.VITE_API_BASE || "/api";

export async function fetchMembers() {
  const res = await fetch(`${BASE}/members`);
  if (!res.ok) throw new Error("メンバー取得に失敗しました");
  return (await res.json()).members;
}

export async function fetchProducts() {
  const res = await fetch(`${BASE}/products`);
  if (!res.ok) throw new Error("商品取得に失敗しました");
  return (await res.json()).products;
}

export async function postPurchase({ memberId, productIds }) {
  const res = await fetch(`${BASE}/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId, productIds }),
  });
  if (!res.ok) throw new Error("購入処理に失敗しました");
  return await res.json();
}

/* 画像アップロード用 🖼️ */
export async function uploadProductImage(productId, file) {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${BASE}/products/${productId}/image`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("画像アップロードに失敗しました");
  return (await res.json()).product;
}
