// frontend/src/components/InvoiceGenerator.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchMembers } from "../api";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ADMIN_BASE = "/api/admin";

export default function InvoiceGenerator({ password }) {
  /* === 入力年月 === */
  const now = new Date();
  const [ym, setYm] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  /* === メンバー & 清算額 === */
  const [rows, setRows] = useState([]);

  /* ---------- 初期ロード / 年月変更時 ---------- */
  useEffect(() => {
    (async () => {
      const [year, month] = ym.split("-").map(Number);
      /* 1. メンバー一覧 */
      const members = await fetchMembers();
      /* 2. 当月清算額 */
      const res = await fetch(
        `${ADMIN_BASE}/invoice-summary?year=${year}&month=${month}`,
        { headers: { "x-admin-pass": password } }
      );
      const { rows: settlements } = await res.json();
      /* 3. 行オブジェクト生成 */
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

  /* ---------- 入力ハンドラ ---------- */
  const handleChange = (idx, key, val) =>
    setRows((rs) => {
      const cp = [...rs];
      cp[idx][key] = isNaN(Number(val)) ? 0 : Number(val);
      return cp;
    });

  /* ---------- 計算ロジック ---------- */
  const calc = (r) => {
    const balance = r.carry + r.settlement - r.advance;
    return balance < 0
      ? { invoice: 0, nextAdvance: -balance }
      : { invoice: balance, nextAdvance: 0 };
  };

  const computedRows = useMemo(
    () =>
      rows.map((r) => {
        const { invoice, nextAdvance } = calc(r);
        return { ...r, invoice, nextAdvance };
      }),
    [rows]
  );

  /* ---------- CSV ダウンロード ---------- */
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
    const bom = "\uFEFF"; // 文字化け防止
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

  /* ---------- PDF ダウンロード ---------- */
  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const today = new Date();
    const todayStr = `${today.getFullYear()}/${
      today.getMonth() + 1
    }/${today.getDate()}`;
    const [y, m] = ym.split("-");

    /* タイトル */
    doc.setFontSize(22);
    doc.text("商店", 105, 20, { align: "center" });

    /* あいさつ文 */
    doc.setFontSize(12);
    doc.text(
      `本日付けで商店の精算を行いましたので、ご確認のほどよろしくお願いいたします。　${todayStr}`,
      14,
      30
    );

    /* 表 */
    const head = [
      [
        "名前",
        "繰り越し",
        `${m}月清算分`,
        "前払い",
        `${m}月請求額`,
        "次回前払い",
      ],
    ];
    const body = computedRows.map((r) => [
      r.name,
      r.carry,
      r.settlement,
      r.advance,
      r.invoice,
      r.nextAdvance,
    ]);
    doc.autoTable({
      head,
      body,
      startY: 38,
      styles: { halign: "right" },
      headStyles: { halign: "center" },
      columnStyles: {
        2: { fontStyle: "bold" }, // 清算分
        4: { fontStyle: "bold", fillColor: [255, 165, 0] }, // 請求額
      },
    });

    /* フッタ */
    const lastY = doc.autoTable.previous.finalY;
    doc.text(
      "気になることがございましたら、商店係までよろしくお願いいたします。",
      14,
      lastY + 12
    );

    doc.save(`invoice_${y}_${m}.pdf`);
  };

  /* ---------- JSX ---------- */
  const [y, m] = ym.split("-");
  return (
    <div className="flex flex-col gap-6">
      {/* 入力欄 ＋ DL ボタン */}
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
          onClick={downloadPDF}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold"
        >
          📄 PDFダウンロード
        </button>
      </div>

      {/* テーブル */}
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
