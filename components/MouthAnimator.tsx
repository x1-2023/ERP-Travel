"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  phonemes: string[];
  visemes: string[];
  isPlaying: boolean;
  slowMode: boolean;
  activeViseme?: string | null;
  source?: "dictionary" | "wawa";
};

type MouthShape = {
  width: number;
  open: number;
  round: number;
  smile: number;
  jaw: number;
  tongue: number;
  teeth: number;
  label: string;
  tip: string;
};

const restShape: MouthShape = {
  width: 72,
  open: 9,
  round: 0.1,
  smile: 0.1,
  jaw: 0,
  tongue: 0,
  teeth: 0,
  label: "rest",
  tip: "relaxed mouth",
};

const shapeMap: Record<string, MouthShape> = {
  closed_lips: {
    width: 66,
    open: 1,
    round: 0,
    smile: 0.05,
    jaw: -2,
    tongue: 0,
    teeth: 0,
    label: "closed lips",
    tip: "lips together, then pop",
  },
  teeth_lip: {
    width: 70,
    open: 8,
    round: 0,
    smile: 0.15,
    jaw: 1,
    tongue: 0,
    teeth: 1,
    label: "teeth-lip",
    tip: "upper teeth touch lower lip",
  },
  tongue_teeth: {
    width: 68,
    open: 11,
    round: 0.05,
    smile: 0,
    jaw: 2,
    tongue: 1,
    teeth: 0.35,
    label: "tongue teeth",
    tip: "tongue lightly between teeth",
  },
  tongue_up: {
    width: 70,
    open: 8,
    round: 0,
    smile: 0.08,
    jaw: 1,
    tongue: 0.65,
    teeth: 0,
    label: "tongue up",
    tip: "tongue behind upper teeth",
  },
  teeth_close: {
    width: 74,
    open: 5,
    round: 0,
    smile: 0.18,
    jaw: 0,
    tongue: 0,
    teeth: 0.7,
    label: "teeth close",
    tip: "narrow air through teeth",
  },
  round_lips: {
    width: 46,
    open: 17,
    round: 1,
    smile: -0.1,
    jaw: 4,
    tongue: 0,
    teeth: 0,
    label: "rounded lips",
    tip: "lips rounded, tongue up",
  },
  round_tense: {
    width: 50,
    open: 12,
    round: 0.8,
    smile: -0.05,
    jaw: 2,
    tongue: 0,
    teeth: 0,
    label: "round tense",
    tip: "round lips, tongue pulled back",
  },
  small_round: {
    width: 38,
    open: 13,
    round: 1,
    smile: -0.15,
    jaw: 3,
    tongue: 0,
    teeth: 0,
    label: "small round",
    tip: "small tight lip opening",
  },
  wide_smile: {
    width: 86,
    open: 8,
    round: 0,
    smile: 0.55,
    jaw: 0,
    tongue: 0,
    teeth: 0,
    label: "wide smile",
    tip: "wide mouth, tongue forward",
  },
  open_mouth: {
    width: 75,
    open: 24,
    round: 0.15,
    smile: 0,
    jaw: 7,
    tongue: 0.18,
    teeth: 0,
    label: "open mouth",
    tip: "open mouth, tongue low",
  },
  mid_open: {
    width: 72,
    open: 16,
    round: 0.1,
    smile: 0.05,
    jaw: 4,
    tongue: 0.1,
    teeth: 0,
    label: "mid open",
    tip: "relaxed mid-open mouth",
  },
  back_tongue: {
    width: 68,
    open: 14,
    round: 0.05,
    smile: 0,
    jaw: 3,
    tongue: 0.35,
    teeth: 0,
    label: "back tongue",
    tip: "back of tongue lifts",
  },
  neutral: restShape,
};

const wawaVisemeMap: Record<string, string> = {
  viseme_sil: "neutral",
  viseme_PP: "closed_lips",
  viseme_FF: "teeth_lip",
  viseme_TH: "tongue_teeth",
  viseme_DD: "tongue_up",
  viseme_kk: "back_tongue",
  viseme_CH: "teeth_close",
  viseme_SS: "teeth_close",
  viseme_nn: "tongue_up",
  viseme_RR: "round_tense",
  viseme_aa: "open_mouth",
  viseme_E: "wide_smile",
  viseme_I: "wide_smile",
  viseme_O: "round_lips",
  viseme_U: "small_round",
};

const phonemeLabels: Record<string, string> = {
  EY: "/eɪ/",
  SH: "/ʃ/",
  AH: "/ə/",
  ER: "/ɚ/",
  IY: "/iː/",
  IH: "/ɪ/",
  UW: "/uː/",
  AA: "/ɑ/",
  AE: "/æ/",
  AO: "/ɔ/",
  CH: "/tʃ/",
  JH: "/dʒ/",
  NG: "/ŋ/",
  TH: "/θ/",
  DH: "/ð/",
};

function phonemeLabel(phoneme: string): string {
  return phonemeLabels[phoneme] ?? `/${phoneme.toLowerCase()}/`;
}

function normalizeViseme(viseme: string | null | undefined): string {
  if (!viseme) return "neutral";
  if (shapeMap[viseme]) return viseme;
  return wawaVisemeMap[viseme] ?? "neutral";
}

function isActive(itemIndex: number, activeIndex: number, isPlaying: boolean): boolean {
  return isPlaying ? itemIndex === activeIndex : itemIndex === 0;
}

function mixShape(current: MouthShape, next: MouthShape, amount: number): MouthShape {
  return {
    width: current.width * (1 - amount) + next.width * amount,
    open: current.open * (1 - amount) + next.open * amount,
    round: current.round * (1 - amount) + next.round * amount,
    smile: current.smile * (1 - amount) + next.smile * amount,
    jaw: current.jaw * (1 - amount) + next.jaw * amount,
    tongue: current.tongue * (1 - amount) + next.tongue * amount,
    teeth: current.teeth * (1 - amount) + next.teeth * amount,
    label: current.label,
    tip: current.tip,
  };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function mouthGeometry(shape: MouthShape) {
  const cx = 136;
  const cy = 132 + shape.jaw;
  const width = shape.width * (1 - shape.round * 0.28);
  const half = width / 2;
  const upperLift = 7 + shape.smile * 10 - shape.round * 3;
  const lowerDrop = shape.open + 4 + shape.jaw;
  const cornerDrop = shape.round * 10 - shape.smile * 5;
  const leftX = cx - half;
  const rightX = cx + half;
  const leftY = cy + cornerDrop;
  const rightY = cy + cornerDrop;
  const topY = cy - upperLift;
  const bottomY = cy + lowerDrop;
  const upper = `M ${leftX.toFixed(1)} ${leftY.toFixed(1)} C ${(cx - half * 0.45).toFixed(1)} ${(topY - 5).toFixed(1)}, ${(cx + half * 0.45).toFixed(1)} ${(topY - 5).toFixed(1)}, ${rightX.toFixed(1)} ${rightY.toFixed(1)}`;
  const lower = `M ${leftX.toFixed(1)} ${leftY.toFixed(1)} C ${(cx - half * 0.42).toFixed(1)} ${(bottomY + 8).toFixed(1)}, ${(cx + half * 0.42).toFixed(1)} ${(bottomY + 8).toFixed(1)}, ${rightX.toFixed(1)} ${rightY.toFixed(1)}`;
  const inner = `${upper} C ${(cx + half * 0.42).toFixed(1)} ${(bottomY + 8).toFixed(1)}, ${(cx - half * 0.42).toFixed(1)} ${(bottomY + 8).toFixed(1)}, ${leftX.toFixed(1)} ${leftY.toFixed(1)} Z`;
  const tongueY = bottomY - 8 + shape.tongue * 3;
  const tongueHalf = Math.max(14, half * 0.45);
  const tongue = `M ${(cx - tongueHalf).toFixed(1)} ${tongueY.toFixed(1)} C ${(cx - tongueHalf * 0.45).toFixed(1)} ${(tongueY - 7 - shape.tongue * 4).toFixed(1)}, ${(cx + tongueHalf * 0.45).toFixed(1)} ${(tongueY - 7 - shape.tongue * 4).toFixed(1)}, ${(cx + tongueHalf).toFixed(1)} ${tongueY.toFixed(1)} C ${(cx + tongueHalf * 0.5).toFixed(1)} ${(tongueY + 7).toFixed(1)}, ${(cx - tongueHalf * 0.5).toFixed(1)} ${(tongueY + 7).toFixed(1)}, ${(cx - tongueHalf).toFixed(1)} ${tongueY.toFixed(1)} Z`;
  const teethY = cy + 1;
  const teeth = `M ${(cx - half * 0.62).toFixed(1)} ${teethY.toFixed(1)} C ${(cx - half * 0.22).toFixed(1)} ${(teethY + 3).toFixed(1)}, ${(cx + half * 0.22).toFixed(1)} ${(teethY + 3).toFixed(1)}, ${(cx + half * 0.62).toFixed(1)} ${teethY.toFixed(1)}`;
  return { upper, lower, inner, tongue, teeth };
}

function useAnimatedShape(target: MouthShape, slowMode: boolean): MouthShape {
  const [shape, setShape] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const from = currentRef.current;
    const duration = slowMode ? 430 : 280;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(progress);
      const next = mixShape(from, target, eased);
      currentRef.current = next;
      setShape(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, slowMode]);

  return shape;
}

export function MouthAnimator({ phonemes, visemes, isPlaying, slowMode, activeViseme, source = "dictionary" }: Props) {
  const [index, setIndex] = useState(0);
  const sequence = useMemo(() => (visemes.length > 0 ? visemes : ["neutral"]), [visemes]);
  const normalizedActiveViseme = normalizeViseme(activeViseme);
  const hasRealtimeViseme = source === "wawa" && Boolean(activeViseme);

  useEffect(() => {
    if (!isPlaying || hasRealtimeViseme) return;
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % sequence.length);
    }, slowMode ? 620 : 360);
    return () => window.clearInterval(interval);
  }, [hasRealtimeViseme, isPlaying, sequence.length, slowMode]);

  const realtimeIndex = sequence.findIndex((viseme) => normalizeViseme(viseme) === normalizedActiveViseme);
  const displayIndex = hasRealtimeViseme ? Math.max(0, realtimeIndex) : isPlaying ? index : 0;
  const currentViseme = hasRealtimeViseme ? normalizedActiveViseme : sequence[displayIndex] ?? "neutral";
  const nextViseme = sequence[Math.min(displayIndex + 1, sequence.length - 1)] ?? currentViseme;
  const targetShape = useMemo(() => {
    const baseShape = shapeMap[currentViseme] ?? restShape;
    const nextShape = hasRealtimeViseme ? baseShape : shapeMap[nextViseme] ?? restShape;
    return isPlaying ? mixShape(baseShape, nextShape, hasRealtimeViseme ? 0 : 0.18) : baseShape;
  }, [currentViseme, hasRealtimeViseme, isPlaying, nextViseme]);
  const smoothShape = useAnimatedShape(targetShape, slowMode);
  const geometry = mouthGeometry(smoothShape);
  const timeline = phonemes.length > 0 ? phonemes : ["--"];

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d141b] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-200">Mouth position</h2>
          <span className="grid h-4 w-4 place-items-center rounded-full border border-white/20 text-[10px] text-slate-400">i</span>
          {source === "wawa" ? <span className="rounded-md bg-coach-teal/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-coach-teal">audio</span> : null}
        </div>
        <button type="button" className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">
          View tips
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_190px]">
        <div className="rounded-lg bg-[#dce8f8] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]">
          <svg viewBox="0 0 272 250" className="mx-auto h-72 w-full max-w-[430px]" role="img" aria-label="Mouth position diagram">
            <defs>
              <linearGradient id="softTongue" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ff6e80" />
                <stop offset="100%" stopColor="#e83f5f" />
              </linearGradient>
              <filter id="mouthShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#2d6df6" floodOpacity="0.22" />
              </filter>
            </defs>
            <path d="M43 72 C44 125 68 180 106 204 C126 217 151 217 172 204 C210 180 234 125 235 72" fill="none" stroke="#4b82ff" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
            <path d="M100 72 C95 85 101 98 113 100" fill="none" stroke="#2a5ecf" strokeWidth="2.1" strokeLinecap="round" opacity="0.7" />
            <path d="M172 72 C177 85 171 98 159 100" fill="none" stroke="#2a5ecf" strokeWidth="2.1" strokeLinecap="round" opacity="0.7" />
            <path d="M119 92 C123 106 132 111 136 99" fill="none" stroke="#2a5ecf" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
            <path d="M144 99 C148 111 157 106 161 92" fill="none" stroke="#2a5ecf" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
            <path d="M121 188 C132 181 148 181 159 188" fill="none" stroke="#99b9ec" strokeWidth="4" strokeLinecap="round" opacity="0.55" />

            <g filter="url(#mouthShadow)">
              <path d={geometry.inner} fill="#111827" opacity={Math.min(0.95, 0.34 + smoothShape.open / 28)} />
              {smoothShape.tongue > 0.12 ? (
                <>
                  <path d={geometry.tongue} fill="url(#softTongue)" opacity={Math.min(0.9, smoothShape.tongue)} />
                  <path d={geometry.tongue} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" opacity={Math.min(0.8, smoothShape.tongue)} />
                </>
              ) : null}
              {smoothShape.teeth > 0.1 ? <path d={geometry.teeth} fill="none" stroke="#f8fbff" strokeWidth={(2.5 + smoothShape.teeth * 2).toFixed(1)} strokeLinecap="round" opacity={smoothShape.teeth} /> : null}
              <path d={geometry.upper} fill="none" stroke="#2d6df6" strokeWidth="3.2" strokeLinecap="round" />
              <path d={geometry.lower} fill="none" stroke="#2d6df6" strokeWidth="3.2" strokeLinecap="round" />
            </g>
          </svg>
          <div className="mt-1 flex items-center justify-center gap-2 text-xs text-[#2a5ecf]">
            <span className="h-2 w-2 rounded-full bg-[#2d6df6]" />
            <span>{targetShape.label}</span>
          </div>
        </div>

        <div className="space-y-2">
          {timeline.slice(0, 7).map((phoneme, itemIndex) => {
            const active = isActive(itemIndex, displayIndex, isPlaying);
            const visemeKey = sequence[itemIndex] ?? "neutral";
            const itemShape = shapeMap[visemeKey] ?? restShape;
            return (
              <div
                key={`${phoneme}-${itemIndex}`}
                className={`grid grid-cols-[30px_42px_1fr] items-center gap-2 rounded-lg px-2 py-2 transition ${
                  active ? "bg-coach-teal/10 text-white" : "text-slate-400"
                }`}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-full border ${active ? "border-coach-teal text-coach-teal" : "border-white/15"}`}>
                  <span className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-current" />
                </span>
                <span className="text-sm font-bold">{phoneme}</span>
                <span className="text-xs italic leading-4">{itemShape.tip}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
        {timeline.map((phoneme, itemIndex) => {
          const active = isActive(itemIndex, displayIndex, isPlaying);
          return (
            <div key={`${phoneme}-rail-${itemIndex}`} className="flex min-w-0 items-center gap-2">
              <span
                className={`grid h-9 min-w-9 place-items-center rounded-full border px-2 text-sm font-bold transition ${
                  active ? "border-coach-teal bg-coach-teal/15 text-coach-teal" : "border-white/15 bg-white/[0.04] text-slate-300"
                }`}
              >
                {phoneme.toLowerCase()}
              </span>
              <span className="text-xs text-slate-500">{phonemeLabel(phoneme)}</span>
              {itemIndex < timeline.length - 1 ? <span className="h-px w-8 bg-white/15" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
