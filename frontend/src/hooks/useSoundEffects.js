// frontend/src/hooks/useSoundEffects.js
import { useEffect, useMemo, useRef } from "react";

/* 🎵 効果音ファイル定義（.mp3 は同階層の public/sounds 内） */
export const SOUND_FILES = {
  scanSuccess: "/sounds/scan_success.mp3",
  scanError: "/sounds/scan_error.mp3",
  addProduct: "/sounds/add_product.mp3",
  confirm: "/sounds/confirm.mp3",
};

/* ===========================================================
 *  🔊 効果音再生フック
 *     const { play } = useSoundEffects();
 *     play("addProduct");
 * =========================================================== */
export default function useSoundEffects(override = {}) {
  const contextRef = useRef(null);
  const buffersRef = useRef(new Map());

  /* 上書き用ソース（メモ化して再レンダと無縁に） */
  const sources = useMemo(() => ({ ...SOUND_FILES, ...override }), [override]);

  // 初期化 & プリロード
  useEffect(() => {
    contextRef.current = new (window.AudioContext || window.webkitAudioContext)();

    const ctx = contextRef.current;
    const loadAll = async () => {
      const entries = Object.entries(sources);
      for (const [key, url] of entries) {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        buffersRef.current.set(key, audioBuffer);
      }
    };

    loadAll();
  }, [sources]);

  // 初回ユーザー操作で AudioContext を resume
  useEffect(() => {
    const unlock = () => {
      contextRef.current?.resume().catch(() => {});
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
  }, []);


  const play = (key) => {
    const ctx = contextRef.current;
    const buffer = buffersRef.current.get(key);
    if (!ctx || !buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  };

  return { play };
}
