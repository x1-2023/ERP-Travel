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
- US / UK accent selector using Web Speech API language settings
- Slow mode for playback and mouth animation
- IPA, sounds-like, syllables, stress highlight, and phoneme chips
- Vietnamese meanings from local dictionary data
- SVG viseme-based mouth animation
- localStorage learning history with scores
- `/practice` A1/A2 listening quiz with four options
- Microphone pronunciation comparison using browser speech recognition when available
- Mini lessons for SH/CH/J, P/B/M, TH, R, F/V, and T/D/N/L
- Fallback response for unknown words

## Browser Compatibility

- Speech playback uses `window.speechSynthesis`.
- Microphone comparison uses `SpeechRecognition` or `webkitSpeechRecognition`.
- Chrome desktop currently has the best support for speech recognition.
- Unsupported browsers show a graceful fallback message.

## Limitations

- Web Speech API does not provide exact phoneme timestamps.
- SVG mouth animation is approximate and driven by dictionary phonemes, not real audio timing.
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
