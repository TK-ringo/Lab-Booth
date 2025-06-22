// backend/src/parseOrderItems.js
/**
 * イオン注文確認メールから商品情報を抽出するユーティリティ
 * 戻り値: [
 *   { product_name, barcode, unit_price, price, quantity, subtotal },
 *   ...
 * ]
 */
export default function parseOrderItems(text) {
  let body;
  try {
    body = text.split("[ご注文内容]")[1].split("【お支払い情報】")[0];
  } catch {
    return [];
  }

  const pattern =
    /\[品番\]\s*(\d+).*?\[商品名\]\s*(.+?)\s*\[商品区分\].*?\[価格\/数量\]\s*価格[:：]\s*([\d,]+)円\s*x数量[:：]\s*([\d,]+).*?=\s*小計[:：]\s*([\d,]+)円/gs;

  const items = [];
  let match;
  while ((match = pattern.exec(body)) !== null) {
    const rawBarcode = match[1];
    const name = match[2].trim();
    const origPrice = parseInt(match[3].replace(/,/g, ""), 10);
    const origQty = parseInt(match[4].replace(/,/g, ""), 10);
    const subtotal = parseInt(match[5].replace(/,/g, ""), 10);

    let barcode = rawBarcode.replace(/^0+/, "");
    if (barcode === "") barcode = "0";

    // ケース販売判定 & 単価・数量計算
    let quantity, unitPrice;
    if (name.startsWith("【ケース販売】")) {
      const mCase = name.match(/×\s*(\d+)/);
      const perCase = mCase ? parseInt(mCase[1], 10) : 1;
      quantity = perCase * origQty;
      unitPrice = subtotal / quantity;
    } else {
      quantity = origQty;
      unitPrice = origPrice;
    }

    const price = Math.round(unitPrice * 1.2); // 売価 = 単価×1.2 (四捨五入)

    items.push({
      product_name: name,
      barcode,
      unit_price: Math.round(unitPrice * 100) / 100,
      price,
      quantity,
      subtotal,
    });
  }
  return items;
}
