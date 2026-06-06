# Pronunciation Audio Assets

`wawa-lipsync` needs a real audio element to analyze. Put pronunciation clips here to enable audio-driven mouth movement:

```text
public/audio/us/patient.mp3
public/audio/uk/patient.mp3
public/audio/common/patient.mp3
```

Lookup order is accent folder first, then `common`. Supported extensions are `mp3`, `ogg`, `wav`, and `m4a`.

When no matching audio file exists, the app falls back to browser `speechSynthesis` and dictionary-timed mouth animation.
