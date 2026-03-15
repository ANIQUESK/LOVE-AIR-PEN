# ❤️ Love Air Pen — Upgraded v2

> Write in the air. Draw with your soul.

A romantic AI-powered air drawing app using MediaPipe hand tracking. Made with love by Anique Shaikh.

## ✨ Features (v2 Upgrades)

### 🐛 Bug Fixes
- **DPR coordinate fix** — Drawing was misaligned on Retina/high-DPI screens. Fixed by using CSS pixel space consistently.
- **Duplicate event handlers** — `startBtn`/`continueBtn` had handlers in both `index.html` and `app.js`. Removed duplicates.
- **PDF export DPR bug** — PDF was exporting at 2× physical resolution. Now correctly exports at CSS pixel size.
- **Stroke color not saved** — Strokes now store their color, size, and style so replay and SVG export are accurate.
- **Camera error handling** — Distinct messages for "permission denied" vs "no camera found".
- **Voice recognition restart loop** — Added try/catch on `recognition.start()` to prevent uncaught errors.
- **OCR threshold too aggressive** — Improved grayscale preprocessing with luminance weighting.
- **Pinch hysteresis** — Added separate release threshold to prevent jitter on pinch detection.

### 🆕 New Features
- **4 Brush Styles**: Smooth, Neon Glow, Chalk, Hearts trail
- **Color Palette** with 7 presets + custom color picker
- **Brush Size Slider** (2–30px) with live preview
- **Undo** (last stroke) + keyboard shortcut Ctrl+Z
- **Toast notifications** for all actions
- **Custom animated cursor dot** that follows your finger
- **Collapsible side panel** (click ‹ to minimize)
- **OCR result modal** instead of `alert()`
- **Keyboard shortcuts**: Ctrl+Z undo, Escape toggle panel
- **Extended voice commands**: undo, orange, purple, bigger/smaller/thicker/thinner
- **Mobile responsive layout** — panel moves to bottom on small screens
- **Gesture hint panel** (auto-hides after 12s)

## 🎙 Voice Commands

| Say | Action |
|-----|--------|
| "clear" / "erase" | Clear canvas |
| "undo" | Undo last stroke |
| "replay" | Replay drawing |
| "rain" / "hearts" | Hearts rain effect |
| "save" / "png" | Save as PNG |
| "recognize" / "read" | OCR text detection |
| "red", "blue", "green", "yellow", "pink", "orange", "purple", "white" | Change color |
| "bigger" / "thicker" | Increase brush size |
| "smaller" / "thinner" | Decrease brush size |

## 🤏 Hand Gestures

- **Pinch** (index + thumb close) → Draw
- **Open hand** → Pause drawing
- **Pinch over panel button** → Click that button

## 📁 File Structure

```
├── index.html           # Main HTML + intro flow
├── style.css            # Full UI styling
├── app.js               # App controller, all button logic
├── ai/
│   ├── handTracking.js  # Camera + MediaPipe loop
│   ├── gestureEngine.js # Drawing engine + brush styles
│   └── handwritingAI.js # Tesseract OCR
├── effects/
│   ├── heartsRain.js    # Hearts rain effect
│   └── replaySystem.js  # Drawing replay
└── export/
    ├── svgExport.js     # SVG export (per-stroke colors)
    └── pdfExport.js     # PDF export (DPR-corrected)
```

## 🚀 Deploy

Push to GitHub and GitHub Pages will auto-deploy via the included workflow.
