// frontend/src/components/AdminTable.jsx
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

const BASE = "/api/admin";

/* 行オブジェクトを編集用に整形 */
function editableCopy(row) {
  const copy = {};
  Object.entries(row).forEach(([k, v]) => (copy[k] = v ?? ""));
  return copy;
}

const AdminTable = forwardRef(({ table, token }, ref) => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState("asc");
  const [dirty, setDirty] = useState({});
  const [deleted, setDeleted] = useState(new Set());
  const [newRows, setNewRows] = useState([]);

  /* 列情報取得 */
  const fetchColumns = useCallback(async () => {
    if (!table) return;
    const res = await fetch(`${BASE}/${table}/columns`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { columns } = await res.json();
    setColumns(columns);
  }, [table, token]);

  /* データ取得 */
  const fetchRows = useCallback(
    async (ord = order) => {
      if (!table) return;
      const res = await fetch(`${BASE}/${table}?order=${ord}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { rows } = await res.json();
      setRows(rows.map(editableCopy));
      setDirty({});
      setDeleted(new Set());
      setNewRows([]);
      /* 列が空なら schema から取得 */
      if (rows.length) setColumns(Object.keys(rows[0]));
      else await fetchColumns();
    },
    [table, order, token, fetchColumns]
  );

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  /* セル編集 */
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

  /* 行削除トグル */
  const toggleDelete = (id) =>
    setDeleted((set) => {
      const cp = new Set(set);
      cp.has(id) ? cp.delete(id) : cp.add(id);
      return cp;
    });

  /* 🎯 新規行追加（timestamp 自動入力対応） */
  const addRow = () => {
    const blank = {};
    columns.forEach((c) => {
      if (c !== "id") {
        blank[c] = c === "timestamp" ? new Date().toISOString() : "";
      }
    });
    setNewRows((r) => [...r, { __tempId: Date.now(), ...blank }]);
  };

  /* コミット */
  useImperativeHandle(ref, () => ({
    async commit() {
      /* 削除 */
      for (const id of deleted) {
        await fetch(`${BASE}/${table}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      /* 更新 */
      for (const row of Object.values(dirty)) {
        await fetch(`${BASE}/${table}/${row.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(row),
        });
      }
      /* 追加 */
      for (const row of newRows) {
        const { __tempId, ...body } = row;
        await fetch(`${BASE}/${table}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }
      alert("👌 反映しました！（自動リロードします）");
      window.location.reload();
    },
  }));

  /* ----------- 描画 ----------- */
  if (!columns.length) return <p className="text-gray-400">列情報を取得中…</p>;

  return (
    <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
      <button
        onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
        className="mb-2 px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600"
      >
        🔃 {order === "asc" ? "昇順" : "降順"}
      </button>

      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 bg-gray-800 z-10">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-semibold">
                {c}
              </th>
            ))}
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {/* 既存行 */}
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

          {/* 新規行 */}
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
