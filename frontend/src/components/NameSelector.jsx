// src/components/NameSelector.jsx
import { useState, useRef, useEffect } from "react";

export default function NameSelector({
  members,
  currentMember,
  setCurrentMember,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative flex flex-col items-center">
      <button
        className="px-6 py-4 min-w-[12rem] rounded-2xl bg-gray-800/60
                   backdrop-blur-md shadow-glass border border-gray-700
                   hover:bg-gray-700/60 transition text-2xl font-bold"
        onClick={() => setOpen((o) => !o)}
      >
        {`名前：${currentMember?.name || "選択"}`}
      </button>
      {open && (
        <ul
          className="absolute top-full mt-3 
                     w-[90vw] sm:w-[36rem] 
                     rounded-2xl bg-gray-800/70 backdrop-blur-md
                     shadow-glass border border-gray-700 z-40
                     grid grid-cols-2 sm:grid-cols-4 gap-2 p-3"
        >
          {/* クリア（未選択に戻す） */}
          <li
            className="col-span-full px-6 py-2 cursor-pointer text-base
                       text-red-300 hover:text-red-200 hover:bg-gray-700/60"
            onClick={() => {
              setCurrentMember(null);
              setOpen(false);
            }}
          >
            ⨯ 未選択に戻す
          </li>

          {members.map((m) => (
            <li
              key={m.id}
              className="px-6 py-2 hover:bg-gray-700/60 cursor-pointer text-base"
              onClick={() => {
                setCurrentMember(m);
                setOpen(false);
              }}
            >
              {m.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
