"use client";

import type { Accent } from "@/types/pronunciation";

const AUDIO_EXTENSIONS = ["mp3", "ogg", "wav", "m4a"] as const;

export type LipsyncPlayback = {
  mode: "wawa";
  audioUrl: string;
  stop: () => void;
};

export type LipsyncUnavailable = {
  mode: "unavailable";
  reason: string;
};

type PlayOptions = {
  word: string;
  accent: Accent;
  slowMode: boolean;
  onViseme: (viseme: string) => void;
  onEnded: () => void;
  onError: (error: Error) => void;
};

function audioSlug(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function assetExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function resolvePronunciationAudioUrl(word: string, accent: Accent): Promise<string | null> {
  const slug = audioSlug(word);
  if (!slug) return null;

  const folders = [`/audio/${accent}`, "/audio/common"];
  for (const folder of folders) {
    for (const extension of AUDIO_EXTENSIONS) {
      const url = `${folder}/${encodeURIComponent(slug)}.${extension}`;
      if (await assetExists(url)) return url;
    }
  }

  return null;
}

export async function playWithWawaLipsync(options: PlayOptions): Promise<LipsyncPlayback | LipsyncUnavailable> {
  const audioUrl = await resolvePronunciationAudioUrl(options.word, options.accent);
  if (!audioUrl) {
    return {
      mode: "unavailable",
      reason: "No local pronunciation audio asset was found for this word.",
    };
  }

  const { Lipsync } = await import("wawa-lipsync");
  const lipsync = new Lipsync({ fftSize: 2048, historySize: 10 });
  const audio = new Audio();
  let animationFrame = 0;
  let stopped = false;

  function finish(notify = true) {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(animationFrame);
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    options.onViseme("viseme_sil");
    if (notify) options.onEnded();
  }

  function fail(error: Error) {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(animationFrame);
    audio.pause();
    options.onViseme("viseme_sil");
    options.onError(error);
  }

  function analyze() {
    if (stopped) return;
    try {
      lipsync.processAudio();
      options.onViseme(lipsync.viseme);
      animationFrame = requestAnimationFrame(analyze);
    } catch (error) {
      fail(error instanceof Error ? error : new Error("Wawa lipsync analysis failed."));
    }
  }

  audio.preload = "auto";
  audio.src = audioUrl;
  audio.playbackRate = options.slowMode ? 0.68 : 1;
  audio.addEventListener("ended", () => finish(), { once: true });
  audio.addEventListener("error", () => fail(new Error(`Failed to load pronunciation audio: ${audioUrl}`)), { once: true });

  try {
    lipsync.connectAudio(audio);
    await audio.play();
    analyze();
  } catch (error) {
    stopped = true;
    cancelAnimationFrame(animationFrame);
    audio.pause();
    options.onViseme("viseme_sil");
    return {
      mode: "unavailable",
      reason: "The browser blocked or failed the audio-driven lipsync playback.",
    };
  }

  return {
    mode: "wawa",
    audioUrl,
    stop: () => finish(false),
  };
}
