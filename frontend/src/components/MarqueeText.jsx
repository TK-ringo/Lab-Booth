// frontend/src/components/MarqueeText.jsx
import { useRef, useEffect, useState } from "react";

/**
 * はみ出したテキストだけを横スクロールさせるコンポーネント
 *
 * - speed   : px / 秒（スクロール速度）
 * - holdSec : 先頭と末尾で停止する秒数（デフォルト 1 秒）
 */
export default function MarqueeText({ children, speed = 50, holdSec = 1 }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const styleRef = useRef(null); // 動的 keyframes 用 <style> ノード
  const [needsScroll, setNeedsScroll] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0); // アニメーション全体の秒数
  const [animName, setAnimName] = useState("");

  /* 幅を測ってスクロール要否を判定 */
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !textRef.current) return;

      const diff =
        textRef.current.scrollWidth - containerRef.current.clientWidth;
      if (diff > 0) {
        const scrollTime = diff / speed; // 実際に動いている時間
        const totalTime = scrollTime + holdSec * 2; // 停止 2 回ぶん + スクロール
        setNeedsScroll(true);
        setDistance(diff);
        setDuration(Number(totalTime.toFixed(2)));

        /* ───── 動的 keyframes 生成 ───── */
        const holdPct = (holdSec / totalTime) * 100; // 先頭停止割合
        const scrollEnd = 100 - holdPct; // 末尾停止開始%
        const name = `marquee-${Math.random().toString(36).slice(2, 9)}`;
        const kf = `
          @keyframes ${name} {
            0%            { transform: translateX(0); }
            ${holdPct}%   { transform: translateX(0); }
            ${scrollEnd}% { transform: translateX(calc(-1 * var(--distance))); }
            100%          { transform: translateX(calc(-1 * var(--distance))); }
          }
        `;

        // 旧 <style> を除去して新しく注入
        if (styleRef.current) styleRef.current.remove();
        const styleEl = document.createElement("style");
        styleEl.innerHTML = kf;
        document.head.appendChild(styleEl);
        styleRef.current = styleEl;
        setAnimName(name);
      } else {
        setNeedsScroll(false);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      styleRef.current?.remove();
    };
  }, [children, speed, holdSec]);

  return (
    <div ref={containerRef} className="overflow-hidden whitespace-nowrap">
      <span
        ref={textRef}
        className="inline-block"
        style={
          needsScroll
            ? {
                "--distance": `${distance}px`,
                animation: `${animName} ${duration}s linear infinite`,
              }
            : {}
        }
      >
        {children}
      </span>
    </div>
  );
}
