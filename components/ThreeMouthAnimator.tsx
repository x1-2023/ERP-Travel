"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  phonemes: string[];
  visemes: string[];
  isPlaying: boolean;
  slowMode: boolean;
  activeViseme?: string | null;
  source?: "dictionary" | "wawa";
};

type Shape = {
  width: number;
  open: number;
  round: number;
  smile: number;
  jaw: number;
  tongue: number;
};

const shapeMap: Record<string, Shape> = {
  neutral: { width: 1.25, open: 0.1, round: 0.1, smile: 0.05, jaw: 0, tongue: 0 },
  closed_lips: { width: 1.08, open: 0.02, round: 0.02, smile: 0.02, jaw: -0.03, tongue: 0 },
  teeth_lip: { width: 1.12, open: 0.18, round: 0.03, smile: 0.08, jaw: 0.05, tongue: 0 },
  tongue_teeth: { width: 1.1, open: 0.22, round: 0.04, smile: 0, jaw: 0.06, tongue: 0.85 },
  tongue_up: { width: 1.12, open: 0.17, round: 0.03, smile: 0.04, jaw: 0.03, tongue: 0.55 },
  teeth_close: { width: 1.2, open: 0.1, round: 0.02, smile: 0.12, jaw: 0.02, tongue: 0 },
  round_lips: { width: 0.78, open: 0.34, round: 0.9, smile: -0.08, jaw: 0.16, tongue: 0 },
  round_tense: { width: 0.86, open: 0.23, round: 0.75, smile: -0.04, jaw: 0.1, tongue: 0 },
  small_round: { width: 0.62, open: 0.25, round: 1, smile: -0.1, jaw: 0.12, tongue: 0 },
  wide_smile: { width: 1.5, open: 0.16, round: 0, smile: 0.38, jaw: 0.03, tongue: 0 },
  open_mouth: { width: 1.22, open: 0.48, round: 0.12, smile: 0, jaw: 0.24, tongue: 0.18 },
  mid_open: { width: 1.18, open: 0.3, round: 0.08, smile: 0.03, jaw: 0.14, tongue: 0.08 },
  back_tongue: { width: 1.1, open: 0.27, round: 0.05, smile: 0, jaw: 0.1, tongue: 0.28 },
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

function normalizeViseme(viseme: string | null | undefined): string {
  if (!viseme) return "neutral";
  if (shapeMap[viseme]) return viseme;
  return wawaVisemeMap[viseme] ?? "neutral";
}

function damp(current: number, target: number, amount: number): number {
  return current + (target - current) * amount;
}

function makeLipCurve(points: THREE.Vector3[], color: number): THREE.Line {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, linewidth: 4 });
  return new THREE.Line(geometry, material);
}

export function ThreeMouthAnimator({ phonemes, visemes, isPlaying, slowMode, activeViseme, source = "dictionary" }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const currentVisemeRef = useRef("neutral");
  const isPlayingRef = useRef(false);
  const sequence = useMemo(() => (visemes.length > 0 ? visemes : ["neutral"]), [visemes]);
  const timeline = phonemes.length > 0 ? phonemes : ["--"];
  const normalizedActiveViseme = normalizeViseme(activeViseme);
  const hasRealtimeViseme = source === "wawa" && Boolean(activeViseme);
  const realtimeIndex = sequence.findIndex((viseme) => normalizeViseme(viseme) === normalizedActiveViseme);
  const displayIndex = hasRealtimeViseme ? Math.max(0, realtimeIndex) : isPlaying ? index : 0;
  const currentViseme = hasRealtimeViseme ? normalizedActiveViseme : sequence[displayIndex] ?? "neutral";

  useEffect(() => {
    currentVisemeRef.current = currentViseme;
    isPlayingRef.current = isPlaying;
  }, [currentViseme, isPlaying]);

  useEffect(() => {
    if (!isPlaying || hasRealtimeViseme) return;
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % sequence.length);
    }, slowMode ? 620 : 360);
    return () => window.clearInterval(interval);
  }, [hasRealtimeViseme, isPlaying, sequence.length, slowMode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const container = mount;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1218);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.02, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(0xe9f7ff, 2.4);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    scene.add(new THREE.AmbientLight(0x6e8fa5, 1.4));

    const face = new THREE.Mesh(
      new THREE.SphereGeometry(1.82, 64, 48),
      new THREE.MeshStandardMaterial({ color: 0xd8e6f3, roughness: 0.72, metalness: 0.02 }),
    );
    face.scale.set(0.62, 0.84, 0.3);
    face.position.set(0, 0.08, 0);
    scene.add(face);

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.62, 1.4, 32),
      new THREE.MeshStandardMaterial({ color: 0xcfddea, roughness: 0.82 }),
    );
    neck.position.set(0, -1.9, -0.08);
    scene.add(neck);

    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 16), eyeMaterial);
    const rightEye = leftEye.clone();
    leftEye.position.set(-0.31, 0.48, 0.7);
    rightEye.position.set(0.31, 0.48, 0.7);
    leftEye.scale.set(1, 0.52, 0.24);
    rightEye.scale.copy(leftEye.scale);
    scene.add(leftEye, rightEye);

    const lipColor = 0x31d5cb;
    const upperLip = makeLipCurve([], lipColor);
    const lowerLip = makeLipCurve([], lipColor);
    scene.add(upperLip, lowerLip);

    const mouthFill = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 0x111827, transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
    );
    mouthFill.position.z = 0.67;
    scene.add(mouthFill);

    const tongue = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 32, 16),
      new THREE.MeshStandardMaterial({ color: 0xff5f78, roughness: 0.58 }),
    );
    tongue.scale.set(1.35, 0.22, 0.18);
    tongue.position.z = 0.72;
    scene.add(tongue);

    const jawLine = makeLipCurve([], 0x6b92b0);
    scene.add(jawLine);

    const state: Shape = { ...shapeMap.neutral };
    let frame = 0;

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    }

    function updateCurve(line: THREE.Line, points: THREE.Vector3[]) {
      line.geometry.dispose();
      line.geometry = new THREE.BufferGeometry().setFromPoints(points);
    }

    function drawMouth(shape: Shape) {
      const width = shape.width * (1 - shape.round * 0.2);
      const open = shape.open;
      const smile = shape.smile;
      const y = -0.28 - shape.jaw * 0.2;
      const z = 0.8;
      const upper: THREE.Vector3[] = [];
      const lower: THREE.Vector3[] = [];

      for (let i = 0; i <= 28; i += 1) {
        const t = i / 28;
        const x = (t - 0.5) * width;
        const arch = Math.sin(Math.PI * t);
        const corner = Math.abs(t - 0.5) * 2;
        upper.push(new THREE.Vector3(x, y + smile * 0.22 + arch * (0.08 + smile * 0.08) - corner * shape.round * 0.08, z));
        lower.push(new THREE.Vector3(x, y - open * (0.24 + arch * 0.95) - smile * 0.05 + corner * shape.round * 0.04, z));
      }

      updateCurve(upperLip, upper);
      updateCurve(lowerLip, lower);
      mouthFill.scale.set(Math.max(0.12, width), Math.max(0.025, open * 0.95), 1);
      mouthFill.position.set(0, y - open * 0.36, 0.77);
      tongue.visible = shape.tongue > 0.1;
      tongue.scale.set(width * 0.45, Math.max(0.08, open * 0.38), 0.16);
      tongue.position.set(0, y - open * 0.42, 0.82);

      const jaw: THREE.Vector3[] = [];
      for (let i = 0; i <= 24; i += 1) {
        const t = i / 24;
        const x = (t - 0.5) * 1.1;
        const arch = Math.sin(Math.PI * t);
        jaw.push(new THREE.Vector3(x, -0.98 - shape.jaw * 0.28 - arch * 0.08, 0.66));
      }
      updateCurve(jawLine, jaw);
    }

    function animate() {
      const target = shapeMap[currentVisemeRef.current] ?? shapeMap.neutral;
      state.width = damp(state.width, target.width, 0.16);
      state.open = damp(state.open, isPlayingRef.current ? target.open : 0.1, 0.18);
      state.round = damp(state.round, target.round, 0.15);
      state.smile = damp(state.smile, target.smile, 0.15);
      state.jaw = damp(state.jaw, isPlayingRef.current ? target.jaw : 0, 0.17);
      state.tongue = damp(state.tongue, target.tongue, 0.16);

      face.rotation.y = Math.sin(performance.now() * 0.0005) * 0.035;
      face.rotation.x = Math.sin(performance.now() * 0.0007) * 0.02;
      drawMouth(state);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }

    resize();
    animate();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      renderer.dispose();
      upperLip.geometry.dispose();
      lowerLip.geometry.dispose();
      jawLine.geometry.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="rounded-lg border border-white/10 bg-[#0d141b] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-200">3D mouth rig</h2>
          {source === "wawa" ? <span className="rounded-md bg-coach-teal/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-coach-teal">audio</span> : null}
        </div>
        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">prototype</span>
      </div>

      <div ref={mountRef} className="h-[360px] overflow-hidden rounded-lg border border-white/10 bg-[#0b1218]" />

      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
        {timeline.map((phoneme, itemIndex) => {
          const active = isPlaying ? itemIndex === displayIndex : itemIndex === 0;
          return (
            <div key={`${phoneme}-3d-${itemIndex}`} className="flex min-w-0 items-center gap-2">
              <span
                className={`grid h-9 min-w-9 place-items-center rounded-full border px-2 text-sm font-bold transition ${
                  active ? "border-coach-teal bg-coach-teal/15 text-coach-teal" : "border-white/15 bg-white/[0.04] text-slate-300"
                }`}
              >
                {phoneme.toLowerCase()}
              </span>
              {itemIndex < timeline.length - 1 ? <span className="h-px w-8 bg-white/15" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
