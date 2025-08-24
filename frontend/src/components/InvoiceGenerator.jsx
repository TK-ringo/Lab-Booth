// frontend/src/components/InvoiceGenerator.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchMembers } from "../api";

const ADMIN_BASE = "/api/admin";

export default function InvoiceGenerator({ token }) {
  /* === 対象年月 === */
  const now = new Date();
  const [ym, setYm] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  /* === メンバー・清算額取得 === */
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const isValidYm = /^\d{4}-(0[1-9]|1[0-2])$/.test(ym);
    if (!isValidYm) return;

    (async () => {
      const [year, month] = ym.split("-").map(Number);
      const members = await fetchMembers();
      const res = await fetch(
        `${ADMIN_BASE}/invoice-summary?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { rows: settlements } = await res.json();

      setRows(
        members.map((m) => {
          const s = settlements.find((x) => x.member_id === m.id);
          return {
            id: m.id,
            name: m.name,
            carry: "",
            settlement: s ? s.settlement : 0,
            advance: "",
          };
        })
      );
    })();
  }, [ym, token]);

  /* === 入力変更 === */
  const handleChange = (idx, key, val) =>
    setRows((rs) => {
      const cp = [...rs];
      cp[idx][key] = val;
      return cp;
    });

  /* === 計算 === */
  const toNum = (v) => (isNaN(Number(v)) ? 0 : Number(v));
  const computedRows = useMemo(
    () =>
      rows.map((r) => {
        const bal = toNum(r.carry) + r.settlement - toNum(r.advance);
        return {
          ...r,
          invoice: bal < 0 ? 0 : bal,
          nextAdvance: bal < 0 ? -bal : 0,
        };
      }),
    [rows]
  );

  /* === CSV ダウンロード === */
  const downloadCSV = () => {
    const [y, mStr] = ym.split("-");
    const m = parseInt(mStr, 10);  // remove leading zero
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
          r.carry || 0,
          r.settlement,
          r.advance || 0,
          r.invoice,
          r.nextAdvance,
        ].join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + head.join(",") + "\n" + body], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), {
      href: url,
      download: `invoice_${y}_${m}.csv`,
    }).click();
    URL.revokeObjectURL(url);
  };

  /* === PDF / 印刷 === */
  const printInvoice = () => {
  const [y, mStr] = ym.split("-");
  const m = parseInt(mStr, 10);  // strip leading zero
  const today = new Date();
    const todayStr = `${today.getFullYear()}/${
      today.getMonth() + 1
    }/${today.getDate()}`;

    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <title>請求書 ${y}/${m}</title>
        <style>
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }

          :root {
            --accent: #FFF4DF;   /* ★ さらに淡いオレンジ */
            --border: #BDBDBD;   /* ★ やや濃い罫線色 */
            --stripe: #FAFAFA;
          }
          body {
            margin: 0;
            padding: 48px 40px 56px;
            font-family: "Noto Sans JP", sans-serif;
            color: #212121;
            line-height: 1.65;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 32px;
            font-weight: 700;
            text-align: center;
            color: #333;
          }

          /* ---- テーブル ---- */
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            margin-top: 24px;
          }
          th, td {
            padding: 6px 8px;              /* 行の高さを抑えるために余白を縮小 */
            font-size: 14px;             /* 文字サイズをわずかに縮小 */
            text-align: right;
            border-right: 1px solid var(--border);
            border-bottom: 1px solid var(--border);   /* ★ 横罫線を追加 */
          }
          thead th { font-size: 14px; }
          th:last-child, td:last-child { border-right: none; }
          th:first-child, td:first-child { text-align: left; border-left: none; }
          thead { background: #F3F4F6; font-weight: 600; }
          tbody tr:nth-child(odd)  { background: var(--stripe); }
          tbody tr:nth-child(even) { background: #FFF; }

          th.invoice, td.invoice {
            background: var(--accent) !important;
            font-weight: 700;
            color: #000;
          }
          th.settlement, td.settlement { font-weight: 600; }

          footer { margin-top: 28px; font-size: 14px; }
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
              <th class="settlement">${m}月清算分</th>
              <th>前払い</th>
              <th class="invoice">${m}月請求額</th>
              <th>次回前払い</th>
            </tr>
          </thead>
          <tbody>
            ${computedRows
              .map(
                (r) => `
              <tr>
                <td>${r.name}</td>
                <td>${r.carry || 0}</td>
                <td class="settlement">${r.settlement}</td>
                <td>${r.advance || 0}</td>
                <td class="invoice">${r.invoice}</td>
                <td>${r.nextAdvance}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <footer>
          <p>気になることがございましたら、商店係までよろしくお願いいたします。</p>
        </footer>
      </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
      position: "fixed",
      top: "-9999px",
      width: "0",
      height: "0",
      visibility: "hidden",
    });
    iframe.srcdoc = html;
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => iframe.remove(), 1500);
    };
    document.body.appendChild(iframe);
  };

  /* === 画面側テーブル (略) === */
  const [, mStr] = ym.split("-");
  const m = parseInt(mStr, 10);  // strip leading zero for display
  return (
    <div className="flex flex-col gap-6">
      {/* 入力欄 & ボタン */}
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

      {/* 画面プレビュー用テーブル */}
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
                    type="text"
                    value={r.carry}
                    onChange={(e) => handleChange(idx, "carry", e.target.value)}
                    className="w-full min-w-[4rem] bg-transparent border-b border-gray-600 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-1 text-right font-bold">
                  {r.settlement}
                </td>
                <td className="px-3 py-1">
                  <input
                    type="text"
                    value={r.advance}
                    onChange={(e) =>
                      handleChange(idx, "advance", e.target.value)
                    }
                    className="w-full min-w-[4rem] bg-transparent border-b border-gray-600 text-right"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-1 text-right font-bold bg-orange-600/20">
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
