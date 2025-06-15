import { useEffect } from "react";

export default function useBarcodeScanner(onScan) {
  useEffect(() => {
    let buf = "";
    let timer = null;
    const handler = (e) => {
      // input / textarea にフォーカス中は処理をスキップ
      const tag = document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Enter") {
        if (buf) onScan(buf);
        buf = "";
        clearTimeout(timer);
        return;
      }
      if (/^[\da-zA-Z]$/.test(e.key)) {
        buf += e.key;
        clearTimeout(timer);
        timer = setTimeout(() => (buf = ""), 50);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onScan]);
}
