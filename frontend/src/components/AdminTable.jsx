// frontend/src/components/AdminTable.jsx
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

const BASE = "/api/admin";

function editableCopy(row) {
  // プライマリキー id 以外は文字列化しておく
  const copy = {};
  Object.entries(row).forEach(([k, v]) => (copy[k] = v ?? ""));
  return copy;
}

const AdminTable = forwardRef(({ table, password }, ref) => {
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState("asc");
  const [dirty, setDirty] = useState({}); // id -> edited row
  const [deleted, setDeleted] = useState(new Set());
  const [newRows, setNewRows] = useState([]);

  /* ───────── データ取得 ───────── */
  async function fetchRows(ord = order) {
    const res = await fetch(`${BASE}/${table}?order=${ord}`, {
      headers: { "x-admin-pass": password },
    });
    const { rows } = await res.json();
    setRows(rows.map(editableCopy));
    setDirty({});
    setDeleted(new Set());
    setNewRows([]);
  }

  useEffect(() => {
    if (table) fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, order, password]);

  /* ───────── セル編集 ───────── */
  const handleChange = (idx, key, value, isNew = false) => {
    if (isNew) {
      setNewRows((r) => {
        const cp = [...r];
        cp[idx][key] = value;
        return cp;
      });
    } else {
      const row = rows[idx];
      const edited = { ...row, [key]: value };
      setRows((rs) => {
        const cp = [...rs];
        cp[idx] = edited;
        return cp;
      });
      setDirty((d) => ({ ...d, [row.id]: edited }));
    }
  };

  /* ───────── 行削除トグル ───────── */
  const toggleDelete = (id) => {
    setDeleted((set) => {
      const cp = new Set(set);
      cp.has(id) ? cp.delete(id) : cp.add(id);
      return cp;
    });
  };

  /* ───────── 新規行追加 ───────── */
  const addRow = () => {
    setNewRows((r) => [
      ...r,
      { __tempId: Date.now() /* 必要なら初期値を入れる */ },
    ]);
  };

  /* ───────── コミット処理 ───────── */
  useImperativeHandle(ref, () => ({
    async commit() {
      // 削除
      for (const id of deleted) {
        await fetch(`${BASE}/${table}/${id}`, {
          method: "DELETE",
          headers: { "x-admin-pass": password },
        });
      }
      // 更新
      for (const row of Object.values(dirty)) {
        await fetch(`${BASE}/${table}/${row.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-pass": password,
          },
          body: JSON.stringify(row),
        });
      }
      // 追加
      for (const row of newRows) {
        const { __tempId, ...body } = row;
        await fetch(`${BASE}/${table}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-pass": password,
          },
          body: JSON.stringify(body),
        });
      }
      alert("👌 反映しました！（自動リロードします）");
      window.location.reload(); // ★ ここでページをリロード
    },
  }));

  /* ───────── 描画 ───────── */
  const columns = rows.length
    ? Object.keys(rows[0])
    : newRows.length
    ? Object.keys(newRows[0])
    : [];

  return (
    <div className="overflow-auto">
      {/* ソート切替 */}
      <button
        onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
        className="mb-2 px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600"
      >
        🔃 {order === "asc" ? "昇順" : "降順"}
      </button>

      {/* データテーブル */}
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-800">
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-semibold">
                {c}
              </th>
            ))}
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isDeleted = deleted.has(row.id);
            return (
              <tr
                key={row.id}
                className={
                  isDeleted
                    ? "bg-red-900/40 line-through"
                    : idx % 2
                    ? "bg-gray-800/50"
                    : ""
                }
              >
                {columns.map((col) => (
                  <td key={col} className="px-3 py-1">
                    {col === "id" ? (
                      row[col]
                    ) : (
                      <input
                        value={row[col]}
                        onChange={(e) => handleChange(idx, col, e.target.value)}
                        className="w-full bg-transparent border-b border-gray-600 focus:outline-none"
                      />
                    )}
                  </td>
                ))}
                <td className="px-3 py-1 text-center">
                  <button
                    onClick={() => toggleDelete(row.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    {isDeleted ? "↩️" : "🗑️"}
                  </button>
                </td>
              </tr>
            );
          })}

          {/* 新規行描画 */}
          {newRows.map((row, idx) => (
            <tr key={row.__tempId} className="bg-emerald-900/30">
              {columns.map((col) => (
                <td key={col} className="px-3 py-1">
                  {col === "id" ? (
                    "NEW"
                  ) : (
                    <input
                      value={row[col] ?? ""}
                      onChange={(e) =>
                        handleChange(idx, col, e.target.value, true)
                      }
                      className="w-full bg-transparent border-b border-gray-600 focus:outline-none"
                    />
                  )}
                </td>
              ))}
              <td />
            </tr>
          ))}
        </tbody>
      </table>

      {/* 新規行追加ボタン */}
      <button
        onClick={addRow}
        className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
      >
        ➕ 行を追加
      </button>
    </div>
  );
});

export default AdminTable;
