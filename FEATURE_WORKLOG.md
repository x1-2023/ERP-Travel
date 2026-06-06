# Pronunciation Coach Feature Worklog

## Checklist

- [x] 1. Next.js project setup
- [x] 2. TypeScript types
- [x] 3. Local pronunciation dictionary
- [x] 4. `/api/pronounce` route
- [x] 5. Search input
- [x] 6. Pronunciation card
- [x] 7. Vietnamese meaning display
- [x] 8. IPA + sounds-like display
- [x] 9. Syllable display
- [x] 10. Web Speech API playback
- [x] 11. Slow mode
- [x] 12. Phoneme-to-viseme mapping
- [x] 13. SVG mouth animation
- [x] 14. localStorage learning history
- [x] 15. A1/A2 practice mode
- [x] 16. Microphone comparison
- [x] 17. Mini lessons
- [x] 18. Responsive UI polish
- [x] 19. README
- [x] 20. Final validation
- [x] 21. Audio-driven `wawa-lipsync` integration

## Notes

- 2026-06-02: Created empty Next.js + TypeScript + Tailwind project skeleton in `E:\.cli\Project English`.
- 2026-06-02: Visual direction locked from generated concept: dark graphite app surface, teal/amber accents, primary search/card workflow, compact history and practice panels.
- 2026-06-02: Added strict domain types, 40-word local pronunciation dictionary, fallback syllable/sounds-like logic, viseme mapping, mini-lesson detection, speech/mic/history/scoring helpers, and `/api/pronounce`.
- 2026-06-02: Added reusable UI components, main search page, history panel, SVG mouth animator, mic comparison, mini lessons, `/practice` quiz, and README.
- 2026-06-02: Updated Next to 16.2.7 after install reported a vulnerable 15.3.3 release; replaced `next lint` with ESLint flat config for Next 16.
- 2026-06-02: Pinned/overrode PostCSS 8.5.15 to clear audit findings. Final validation passed: `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --omit=dev`.
- 2026-06-02: Production server verified at `http://localhost:3001`; API fallback checked with `/api/pronounce?word=unknownword&accent=uk`. Production desktop/mobile screenshots were captured and inspected, then temporary QA artifacts were cleaned.
- 2026-06-02: Reworked `MouthAnimator` after visual QA feedback: replaced placeholder face with concept-aligned mouth-position diagram, phoneme instruction rows, and phoneme timeline rail.
- 2026-06-02: Adjusted main/card breakpoints so the mouth panel no longer crushes IPA/sounds-like content. Re-ran `npm run lint`, `npm run typecheck`, and `npm run build` successfully.
- 2026-06-02: Softened mouth/tongue rendering with filled SVG tongue shapes, red gradient, highlight, glow, and CSS keyframe easing instead of the previous hard stroke tongue. Re-ran `npm run lint`, `npm run typecheck`, and `npm run build` successfully.
- 2026-06-02: Replaced the anatomy-style mouth with a Google-like minimal parametric mouth rig: light blue tile, soft blue line art, interpolated mouth geometry, subtle co-articulation toward the next viseme, and tongue only when the viseme needs it. Re-ran `npm run lint`, `npm run typecheck`, and `npm run build` successfully.
- 2026-06-03: Preparing repository for GitHub remote `https://github.com/x1-2023/ERP-Travel.git`; next steps are git init, commit, branch rename to `main`, and push.
- 2026-06-03: Pre-push validation passed: `npm run lint`, `npm run build`, and sequential `npm run typecheck`.
- 2026-06-03: Git repository initialized, remote `origin` added, branch renamed to `main`, and initial commit `c50557c` pushed to `origin/main`.
- 2026-06-03: Follow-up worklog commit `5aa67bf` pushed to `origin/main`. VPS pull/test is pending because this machine has no SSH config or known deploy path for this project; known_hosts contains prior hosts but no username/path mapping.
- 2026-06-06: Installed `wawa-lipsync` and replaced fixed-timer-only mouth movement with audio-driven viseme analysis when local clips exist. Added local audio asset convention under `public/audio/{us|uk|common}` with Web Speech fallback when clips are missing. Validation passed: `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --omit=dev`.
- 2026-06-06: Tightened fallback audio/mouth sync after playback QA: Web Speech animation now starts from `SpeechSynthesisUtterance.onstart` and stops from `onend` instead of starting immediately on button click. Wawa mode now marks playback active only after `audio.play()` succeeds. Validation passed: `npm run lint`, `npm run typecheck`, and `npm run build`.
