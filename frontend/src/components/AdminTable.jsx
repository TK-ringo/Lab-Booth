// frontend/src/components/AdminTable.jsx
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import ScrollContainer from "./ScrollContainer";

const BASE = "/api/admin";

/* ★ JST タイムスタンプを返すユーティリティ */
const jstNow = () => {
  const dt = new Date();
  const jst = new Date(dt.getTime() + 9 * 60 * 60 * 1000); // UTC→JST
  return jst.toISOString().slice(0, 19).replace("T", " "); // 'YYYY-MM-DD HH:mm:ss'
};

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
  const { columns: fetchedColumns } = await res.json();
  setColumns(fetchedColumns);
  }, [table, token]);

  /* データ取得 */
  const fetchRows = useCallback(
    async (ord = order) => {
      if (!table) return;
  const res = await fetch(`${BASE}/${table}?order=${ord}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  const { rows: fetchedRows } = await res.json();
  setRows(fetchedRows.map(editableCopy));
      setDirty({});
      setDeleted(new Set());
      setNewRows([]);
      /* 列が空なら schema から取得 */
  if (fetchedRows.length) setColumns(Object.keys(fetchedRows[0]));
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

  /* 🎯 新規行追加（timestamp は JST 自動入力） */
  const addRow = () => {
    const blank = {};
    columns.forEach((c) => {
      if (c !== "id") {
        blank[c] = c === "timestamp" ? jstNow() : "";
      }
    });
    setNewRows((r) => [...r, { __tempId: Date.now(), ...blank }]);
  };

  /* コミット */
  useImperativeHandle(ref, () => ({
    async commit() {
      /* 削除 */
      await Promise.all(
        Array.from(deleted).map((id) =>
          fetch(`${BASE}/${table}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      /* 更新 */
      await Promise.all(
        Object.values(dirty).map((row) =>
          fetch(`${BASE}/${table}/${row.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(row),
          })
        )
      );
      /* 追加 */
      await Promise.all(
        newRows.map(({ __tempId, ...body }) =>
          fetch(`${BASE}/${table}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          })
        )
      );
      alert("👌 反映しました！（自動リロードします）");
      window.location.reload();
    },
  }));

  /* ----------- ヘルパ: セル描画 ----------- */
  const renderCells = (row, idx, isNewRow = false) =>
    columns.map((col) => (
      <td key={col} className="px-3 py-1">
        {col === "id" ? (
          isNewRow ? "NEW" : row[col]
        ) : (
          <input
            value={row[col] ?? ""}
            onChange={(e) =>
              handleChange(idx, col, e.target.value, isNewRow)
            }
            className="w-full bg-transparent border-b border-gray-600 focus:outline-none"
          />
        )}
      </td>
    ));

  /* ----------- 描画 ----------- */
  if (!columns.length) return <p className="text-gray-400">列情報を取得中…</p>;

  return (
    <ScrollContainer
      header={
        <button
          onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
          className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600"
        >
          🔃 {order === "asc" ? "昇順" : "降順"}
        </button>
      }
      footer={
        <button
          onClick={addRow}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
        >
          ➕ 行を追加
        </button>
      }
    >
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
        {renderCells(row, idx, false)}
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
      {renderCells(row, idx, true)}
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollContainer>
  );
});

export default AdminTable;
