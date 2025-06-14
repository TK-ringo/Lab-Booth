import { useState } from "react";
import { members } from "../data/sampleData";
export default function NameSelector({ currentName, setCurrentName }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex flex-col items-center">
      <button
        className="px-6 py-4 min-w-[12rem] rounded-2xl bg-gray-800/60 backdrop-blur-md shadow-glass border border-gray-700 hover:bg-gray-700/60 transition text-2xl font-bold"
        onClick={() => setOpen((o) => !o)}
      >
        {`名前：${currentName || "選択"}`}
      </button>
      {open && (
        <ul className="absolute top-full mt-3 w-56 max-h-72 overflow-y-auto rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-glass border border-gray-700 z-40">
          {members.map((n) => (
            <li
              key={n}
              className="px-4 py-2 hover:bg-gray-700/60 cursor-pointer"
              onClick={() => {
                setCurrentName(n);
                setOpen(false);
              }}
            >
              {n}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
