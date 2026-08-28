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
  // bright chord at the very start, together with the first letter
  [523.25, 659.25, 783.99].forEach((f) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.4, t0 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + 0.8);
  });
  for (let i = 0; i < letterCount; i++) {
    blip(t0 + (i * LETTER_STEP) / 1000, scale[i % scale.length]!);
  }

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

  const title = `${WORD_ONE} ${WORD_TWO}`;
  const chars = title.split("");
  const spread = 108; // total arc sweep in degrees
  const step = spread / (chars.length - 1);

  return (
    <div className={`splash-root${leaving ? " splash-leaving" : ""}`}>
      <div className="splash-glow" aria-hidden="true" />
      <div className="splash-stage">
        <h1 className="splash-arc" aria-label={title}>
          {chars.map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              className="splash-arc-slot"
              style={{ transform: `rotate(${-spread / 2 + i * step}deg)` }}
              aria-hidden="true"
            >
              <span
                className={`splash-letter${i >= WORD_ONE.length + 1 ? " splash-letter-2" : ""}`}
                style={{ animationDelay: `${i * LETTER_STEP}ms` }}
              >
                {ch === " " ? "\u00a0" : ch}
              </span>
            </span>
          ))}
        </h1>
        <img
          src={pandaSplash}
          alt="Cute cartoon panda mascot waving"
          width={600}
          height={738}
          className="splash-panda"
        />
      </div>
    </div>
  );
}

export default SplashScreen;
