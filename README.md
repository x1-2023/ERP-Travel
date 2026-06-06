# Pronunciation Coach

Pronunciation Coach is a Next.js MVP for English pronunciation practice. It provides a Google-card-style search experience with US/UK playback, IPA, sounds-like guides, Vietnamese meanings, syllables, SVG mouth animation, learning history, A1/A2 listening practice, microphone comparison, and mini phoneme lessons.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Features

- Word search with local pronunciation dictionary
- US / UK accent selector with local audio assets first, then Web Speech API fallback
- Slow mode for playback and mouth animation
- IPA, sounds-like, syllables, stress highlight, and phoneme chips
- Vietnamese meanings from local dictionary data
- SVG mouth animation driven by `wawa-lipsync` when local audio is available
- localStorage learning history with scores
- `/practice` A1/A2 listening quiz with four options
- Microphone pronunciation comparison using browser speech recognition when available
- Mini lessons for SH/CH/J, P/B/M, TH, R, F/V, and T/D/N/L
- Fallback response for unknown words

## Audio-Driven Lipsync

Add pronunciation clips under `public/audio/{us|uk|common}/{word}.mp3` to enable realtime `wawa-lipsync` analysis. Example:

```text
public/audio/us/patient.mp3
public/audio/uk/patient.mp3
public/audio/common/patient.mp3
```

The app checks `mp3`, `ogg`, `wav`, and `m4a` in the selected accent folder first, then `common`.

## Browser Compatibility

- Audio-driven lipsync uses `wawa-lipsync` and the Web Audio API.
- Fallback speech playback uses `window.speechSynthesis`.
- Microphone comparison uses `SpeechRecognition` or `webkitSpeechRecognition`.
- Chrome desktop currently has the best support for speech recognition.
- Unsupported browsers show a graceful fallback message.

## Limitations

- Web Speech API does not provide exact phoneme timestamps and cannot be analyzed by `wawa-lipsync` directly.
- Without local audio assets, SVG mouth animation falls back to approximate dictionary phoneme timing.
- Microphone score is based on speech recognition text similarity, not professional phonetic scoring.
- IPA coverage depends on the local dictionary.
- Vietnamese translation coverage depends on the local dictionary.
- UK/US differences are limited by browser voices and dictionary data.

## Future Improvements

- Move history from localStorage to SQLite or PostgreSQL.
- Add a self-hosted dictionary or Wiktionary integration through `lib/translation.ts`.
- Add phoneme-level scoring with a dedicated speech model.
- Expand dictionary coverage and add CEFR tagging beyond A1/A2.
- Add mobile app packaging after the web MVP is stable.
