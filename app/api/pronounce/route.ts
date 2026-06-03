import { getPronunciation } from "@/lib/pronounce";
import type { Accent } from "@/types/pronunciation";
import { NextResponse } from "next/server";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word") ?? "";
  const accentParam = searchParams.get("accent");
  const accent: Accent = accentParam === "uk" ? "uk" : "us";

  return NextResponse.json(getPronunciation(word, accent));
}
