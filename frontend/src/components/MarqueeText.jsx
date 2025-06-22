// frontend/src/components/MarqueeText.jsx
import { useRef, useEffect, useState } from "react";

/**
 * はみ出したテキストだけをゆっくり横スクロールさせるコンポーネント
 *
 * @param {number} speed - px/秒（デフォルト 50）
 */
export default function MarqueeText({ children, speed = 50 }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  /* 幅を測定してアニメーションの要否・距離・時間を決定 */
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current || !textRef.current) return;
      const diff =
        textRef.current.scrollWidth - containerRef.current.clientWidth;
      if (diff > 0) {
        setNeedsScroll(true);
        setDistance(diff);
        setDuration((diff / speed).toFixed(2)); // 秒
      } else {
        setNeedsScroll(false);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [children, speed]);

  return (
    <div ref={containerRef} className="overflow-hidden whitespace-nowrap">
      <span
        ref={textRef}
        className="inline-block"
        style={
          needsScroll
            ? {
                "--distance": `${distance}px`,
                animation: `marquee ${duration}s linear infinite`,
              }
            : {}
        }
      >
        {children}
      </span>
    </div>
  );
}
