// src/api.js
const BASE = import.meta.env.VITE_API_BASE || "";

export async function fetchMembers() {
  const res = await fetch(`${BASE}/api/members`);
  if (!res.ok) throw new Error("メンバー取得に失敗しました");
  const { members } = await res.json();
  return members;
}

export async function fetchProducts() {
  const res = await fetch(`${BASE}/api/products`);
  if (!res.ok) throw new Error("商品取得に失敗しました");
  const { products } = await res.json();
  return products;
}

export async function postPurchase({ memberId, productIds }) {
  const res = await fetch(`${BASE}/api/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId, productIds }),
  });
  if (!res.ok) throw new Error("購入処理に失敗しました");
  return await res.json(); // { members, products }
}
