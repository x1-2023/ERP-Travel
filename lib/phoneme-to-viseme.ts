export type Viseme =
  | "closed_lips"
  | "teeth_lip"
  | "tongue_teeth"
  | "tongue_up"
  | "teeth_close"
  | "round_lips"
  | "round_tense"
  | "small_round"
  | "wide_smile"
  | "open_mouth"
  | "mid_open"
  | "back_tongue"
  | "neutral";

const visemeMap: Record<string, Viseme> = {
  P: "closed_lips",
  B: "closed_lips",
  M: "closed_lips",
  F: "teeth_lip",
  V: "teeth_lip",
  TH: "tongue_teeth",
  DH: "tongue_teeth",
  T: "tongue_up",
  D: "tongue_up",
  N: "tongue_up",
  L: "tongue_up",
  S: "teeth_close",
  Z: "teeth_close",
  SH: "round_lips",
  CH: "round_lips",
  JH: "round_lips",
  ZH: "round_lips",
  R: "round_tense",
  W: "small_round",
  UW: "small_round",
  IY: "wide_smile",
  IH: "wide_smile",
  EY: "wide_smile",
  AE: "open_mouth",
  AA: "open_mouth",
  AH: "open_mouth",
  AO: "open_mouth",
  EH: "mid_open",
  ER: "mid_open",
  K: "back_tongue",
  G: "back_tongue",
  NG: "back_tongue",
};

export function phonemeToViseme(phoneme: string): Viseme {
  return visemeMap[phoneme.toUpperCase()] ?? "neutral";
}

export function phonemesToVisemes(phonemes: string[]): Viseme[] {
  return phonemes.length > 0 ? phonemes.map(phonemeToViseme) : ["neutral"];
}
