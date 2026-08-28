import { useEffect, useRef, useState } from "react";
import pandaSplash from "@/assets/splash-panda.png";

const WORD_ONE = "TALKING";
const WORD_TWO = "PANDA";
const LETTER_STEP = 90; // ms between letters
const TOTAL = 3600; // ms before intro closes

/** Cute cartoon-style startup jingle built with the Web Audio API. */
function playJingle(letterCount: number) {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
  const t0 = ctx.currentTime + 0.05;

  const blip = (time: number, freq: number, dur = 0.12) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.6, time + dur);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.9, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  };

  // one playful blip per letter, rising pentatonic run
  const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  for (let i = 0; i < letterCount; i++) {
    blip(t0 + (i * LETTER_STEP) / 1000, scale[i % scale.length]!);
  }

  // happy chord sparkle at the end
  const end = t0 + (letterCount * LETTER_STEP) / 1000 + 0.15;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, end + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.5, end + i * 0.05 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, end + 0.9);
    osc.connect(gain);
    gain.connect(master);
    osc.start(end + i * 0.05);
    osc.stop(end + 1);
  });

  void ctx.resume();
  window.setTimeout(() => void ctx.close(), (TOTAL + 500));
}

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    const start = () => {
      if (played.current) return;
      played.current = true;
      playJingle(WORD_ONE.length + WORD_TWO.length);
    };
    start();
    window.addEventListener("pointerdown", start, { once: true });

    const t1 = window.setTimeout(() => setLeaving(true), TOTAL - 500);
    const t2 = window.setTimeout(onDone, TOTAL);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  const renderWord = (word: string, offset: number) =>
    word.split("").map((ch, i) => (
      <span
        key={`${word}-${i}`}
        className="splash-letter"
        style={{ animationDelay: `${(offset + i) * LETTER_STEP}ms` }}
      >
        {ch}
      </span>
    ));

  return (
    <div className={`splash-root${leaving ? " splash-leaving" : ""}`}>
      <div className="splash-glow" aria-hidden="true" />
      <h1 className="splash-title">
        <span className="splash-word">{renderWord(WORD_ONE, 0)}</span>
        <span className="splash-word splash-word-2">
          {renderWord(WORD_TWO, WORD_ONE.length)}
        </span>
      </h1>
      <img
        src={pandaSplash}
        alt="Cute cartoon panda mascot waving"
        width={816}
        height={816}
        className="splash-panda"
      />
    </div>
  );
}

export default SplashScreen;
