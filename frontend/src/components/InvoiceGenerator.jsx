// InvoiceGenerator.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchMembers } from "../api";

const ADMIN_BASE = "/api/admin";

export default function InvoiceGenerator({ password }) {
  /* === 対象年月 === */
  const now = new Date();
  const [ym, setYm] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  /* === メンバー & 清算額 === */
  const [rows, setRows] = useState([]);

  /* -------- データ取得 -------- */
  useEffect(() => {
    (async () => {
      const [year, month] = ym.split("-").map(Number);

      const members = await fetchMembers();
      const res = await fetch(
        `${ADMIN_BASE}/invoice-summary?year=${year}&month=${month}`,
        { headers: { "x-admin-pass": password } }
      );
      const { rows: settlements } = await res.json();

      const merged = members.map((m) => {
        const found = settlements.find((s) => s.member_id === m.id);
        return {
          id: m.id,
          name: m.name,
          carry: 0,
          settlement: found ? found.settlement : 0,
          advance: 0,
        };
      });
      setRows(merged);
    })();
  }, [ym, password]);

  /* -------- 入力ハンドラ -------- */
  const handleChange = (idx, key, val) =>
    setRows((rs) => {
      const cp = [...rs];
      cp[idx][key] = isNaN(Number(val)) ? 0 : Number(val);
      return cp;
    });

  /* -------- 収支計算 -------- */
  const computedRows = useMemo(
    () =>
      rows.map((r) => {
        const balance = r.carry + r.settlement - r.advance;
        return {
          ...r,
          invoice: balance < 0 ? 0 : balance,
          nextAdvance: balance < 0 ? -balance : 0,
        };
      }),
    [rows]
  );

  /* -------- CSV 出力 -------- */
  const downloadCSV = () => {
    const [y, m] = ym.split("-");
    const head = [
      "名前",
      "繰り越し",
      `${m}月清算分`,
      "前払い",
      `${m}月請求額`,
      "次回前払い",
    ];
    const body = computedRows
      .map((r) =>
        [
          r.name,
          r.carry,
          r.settlement,
          r.advance,
          r.invoice,
          r.nextAdvance,
        ].join(",")
      )
      .join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + head.join(",") + "\n" + body], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${y}_${m}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* -------- 印刷 / PDF 保存 -------- */
  const printInvoice = () => {
    const [y, m] = ym.split("-");
    const today = new Date();
    const todayStr = `${today.getFullYear()}/${
      today.getMonth() + 1
    }/${today.getDate()}`;

    /* --- 印刷用 HTML 文字列 --- */
    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8">
        <title>請求書 ${y}/${m}</title>
        <style>
          body { font-family: "Noto Sans JP", sans-serif; margin: 40px; }
          h1   { text-align: center; font-size: 24pt; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #999; padding: 6px 8px; text-align: right; }
          th:first-child, td:first-child { text-align: left; }
          th:nth-child(3), td:nth-child(3),
          th:nth-child(5), td:nth-child(5) { font-weight: bold; }
          td:nth-child(5) { background: #ffa50022; }
        </style>
      </head>
      <body>
        <h1>商店</h1>
        <p>本日付けで商店の精算を行いましたので、ご確認のほどよろしくお願いいたします。　${todayStr}</p>

        <table>
          <thead>
            <tr>
              <th>名前</th>
              <th>繰り越し</th>
              <th>${m}月清算分</th>
              <th>前払い</th>
              <th>${m}月請求額</th>
              <th>次回前払い</th>
            </tr>
          </thead>
          <tbody>
            ${computedRows
              .map(
                (r) => `
              <tr>
                <td>${r.name}</td>
                <td>${r.carry}</td>
                <td>${r.settlement}</td>
                <td>${r.advance}</td>
                <td>${r.invoice}</td>
                <td>${r.nextAdvance}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <p style="margin-top: 24px;">
          気になることがございましたら、商店係までよろしくお願いいたします。
        </p>
      </body>
      </html>
    `;

    /* --- 隠し iframe を使って印刷 --- */
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-10000px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.srcdoc = html;

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      /* 印刷後しばらくして iframe を除去 */
      setTimeout(() => iframe.remove(), 1000);
    };

    document.body.appendChild(iframe);
  };

  /* -------- JSX -------- */
  const [, m] = ym.split("-");
  return (
    <div className="flex flex-col gap-6">
      {/* 入力欄 + ボタン */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col">
          <span className="font-semibold mb-1">対象年月 ⏰</span>
          <input
            type="month"
            value={ym}
            onChange={(e) => setYm(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600"
          />
        </label>
        <button
          onClick={downloadCSV}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold"
        >
          📥 CSVダウンロード
        </button>
        <button
          onClick={printInvoice}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold"
        >
          🖨️ 印刷 / PDF保存
        </button>
      </div>

      {/* テーブル（画面表示用） */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 bg-gray-800">
            <tr>
              <th className="px-3 py-2 text-left">名前</th>
              <th className="px-3 py-2">繰り越し</th>
              <th className="px-3 py-2">{m}月清算分</th>
              <th className="px-3 py-2">前払い</th>
              <th className="px-3 py-2">{m}月請求額</th>
              <th className="px-3 py-2">次回前払い</th>
            </tr>
          </thead>
          <tbody>
            {computedRows.map((r, idx) => (
              <tr key={r.id} className={idx % 2 ? "bg-gray-800/50" : ""}>
                <td className="px-3 py-1 text-left">{r.name}</td>
                <td className="px-3 py-1">
                  <input
                    type="number"
                    value={r.carry}
                    onChange={(e) => handleChange(idx, "carry", e.target.value)}
                    className="w-20 bg-transparent border-b border-gray-600 text-right"
                  />
                </td>
                <td className="px-3 py-1 text-right font-bold">
                  {r.settlement}
                </td>
                <td className="px-3 py-1">
                  <input
                    type="number"
                    value={r.advance}
                    onChange={(e) =>
                      handleChange(idx, "advance", e.target.value)
                    }
                    className="w-20 bg-transparent border-b border-gray-600 text-right"
                  />
                </td>
                <td className="px-3 py-1 text-right font-bold bg-orange-700/30">
                  {r.invoice}
                </td>
                <td className="px-3 py-1 text-right">{r.nextAdvance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
