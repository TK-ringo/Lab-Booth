// frontend/src/components/RestockForm.jsx
import { forwardRef, useImperativeHandle, useState } from "react";

const BASE = "/api/admin";

const RestockForm = forwardRef(({ token }, ref) => {
  const [text, setText] = useState("");

  /* 親（Admin.jsx）の確定ボタンから呼ばれる */
  useImperativeHandle(ref, () => ({
    async commit() {
      if (!text.trim()) {
        alert("メール本文を貼り付けてください");
        return;
      }
      const res = await fetch(`${BASE}/restock/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        alert(`失敗: ${error}`);
        return;
      }
      const { imported } = await res.json();
      alert(`🎉 ${imported} 件を登録しました。自動リロードします`);
      window.location.reload();
    },
  }));

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <p className="text-gray-300">
        🔽 イオンの注文確認メール全文をコピーして貼り付け、上部の
        <span className="font-bold">✅ 確定</span> を押してください。
      </p>
      <textarea
        className="w-full h-96 p-4 bg-gray-800/60 rounded-xl
                   border border-gray-700 focus:outline-none
                   focus:ring-2 focus:ring-indigo-600"
        placeholder="ここにペースト."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
});

export default RestockForm;
