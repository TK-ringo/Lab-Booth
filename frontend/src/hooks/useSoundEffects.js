// frontend/src/hooks/useSoundEffects.js
import { useMemo } from "react";

/** ここを書き換えれば簡単にファイル名を差し替えられます（すべて .mp3） */
export const SOUND_FILES = {
  scanSuccess: "/sounds/scan_success.mp3",
  scanError:   "/sounds/scan_error.mp3",
  addProduct:  "/sounds/add_product.mp3",
  confirm:     "/sounds/confirm.mp3",
};

/**
 * 効果音再生フック
 *   const { play } = useSoundEffects();
 *   play("scanSuccess"); // など
 */
export default function useSoundEffects(override = {}) {
  /** Audio オブジェクトを一度だけ生成してキャッシュ */
  const audios = useMemo(() => {
    const map = { ...SOUND_FILES, ...override };
    const store = {};
    for (const [key, src] of Object.entries(map)) {
      const audio = new Audio(src);
      audio.preload = "auto";
      store[key] = audio;
    }
    return store;
  }, [override]);

  /** 再生ユーティリティ */
  const play = (key) => {
    const a = audios[key];
    if (!a) return;
    try {
      a.currentTime = 0;
      a.play();
    } catch {
      /* 自動再生ブロックなどで失敗する場合は黙って無視 */
    }
  };

  return { play };
}
