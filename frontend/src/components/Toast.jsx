// src/components/Toast.jsx
import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 2200);
    return () => clearTimeout(id);
  }, [onClose]);

  const palette = {
    info: "from-indigo-500 to-purple-500",
    success: "from-emerald-500 to-teal-500",
    error: "from-red-600 to-pink-600",
  };

  return (
    <div
      className={`fixed bottom-28 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl
                  shadow-glass bg-gradient-to-r ${palette[type]} animate-fade-in z-50`}
    >
      {message}
    </div>
  );
}
