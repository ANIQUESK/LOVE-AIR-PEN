// ════════════════════════════════════════════════════════════
// LOVE AIR PEN v3 — Peak Level App Controller
// ════════════════════════════════════════════════════════════

import { initHandTracking } from "./ai/handTracking.js"
import { recognizeText }    from "./ai/handwritingAI.js"
import { exportSVG }        from "./export/svgExport.js"
import { exportPDF }        from "./export/pdfExport.js"
import { heartsRain }       from "./effects/heartsRain.js"
import { fireworks }        from "./effects/fireworks.js"
import { confettiBurst }    from "./effects/confetti.js"
import { replayDrawing }    from "./effects/replaySystem.js"

// ════════════════════════════════════════════════════════════
// DOM
// ════════════════════════════════════════════════════════════

const canvas  = document.getElementById("canvas")
const ctx     = canvas.getContext("2d")

// ════════════════════════════════════════════════════════════
// GLOBAL STATE
// ════════════════════════════════════════════════════════════

window.APP = {
  strokes:      [],
  redoStack:    [],
  currentColor: "#ff2d8f",
  brushSize:    6,
  opacity:      1.0,
  brushStyle:   "smooth",
  bgTheme:      "dark",
  replayMode:   false,
  handActive:   false,
  userName:     "",
}

// Background themes
const BG_THEMES = {
  dark:     { r:8,  g:0,  b:12 },
  rose:     { r:18, g:0,  b:12 },
  midnight: { r:4,  g:6,  b:20 },
  forest:   { r:4,  g:12, b:5  },
}

// ════════════════════════════════════════════════════════════
// CANVAS
// ════════════════════════════════════════════════════════════

function resizeCanvas(){
  const dpr = window.devicePixelRatio || 1
  canvas.width  = window.innerWidth  * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width  = window.innerWidth  + "px"
  canvas.style.height = window.innerHeight + "px"
  ctx.setTransform(1,0,0,1,0,0)
  ctx.scale(dpr, dpr)
}

resizeCanvas()
window.addEventListener("resize", resizeCanvas)

// ════════════════════════════════════════════════════════════
// STATUS
// ════════════════════════════════════════════════════════════

const statusDot  = document.getElementById("status-dot")
const statusText = document.getElementById("status-txt")

export function setStatus(msg, type = "info"){
  statusText.textContent = msg
  statusDot.className    = "sdot " + type
}

// ════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════

export function toast(msg, ms = 2400){
  document.querySelectorAll(".toast").forEach(t => t.remove())
  const el = document.createElement("div")
  el.className   = "toast"
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => {
    el.classList.add("out")
    setTimeout(() => el.remove(), 350)
  }, ms)
}

// ════════════════════════════════════════════════════════════
// LOVE NOTES — Romantic quotes
// ════════════════════════════════════════════════════════════

const LOVE_NOTES = [
  {
    title: "A letter for you",
    body: `In a world full of noise,\nyou are my favorite sound.\n\nEvery heartbeat I have\nis yours — all of them. ❤`
  },
  {
    title: "What I feel",
    body: `You are not just someone I love.\nYou are someone I choose,\nagain and again,\nin every quiet moment. 💕`
  },
  {
    title: "Just so you know",
    body: `The day I met you,\nthe universe rearranged itself\ninto something more beautiful\nthan it had ever been before. 🌸`
  },
  {
    title: "For you, always",
    body: `Distance means nothing\nwhen someone means everything.\n\nYou mean everything to me. ✨`
  },
  {
    title: "My truth",
    body: `If I had to choose between\nbreathing and loving you —\nI would use my last breath\nto say your name. 💗`
  },
  {
    title: "From Anique",
    body: `This entire app —\nevery line of code,\nevery heart, every star —\nwas built just for you. 💌\n\nYou inspire things like this.`
  }
]

let noteIndex = 0

// ════════════════════════════════════════════════════════════
// SCREEN TRANSITIONS
// ════════════════════════════════════════════════════════════

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active")
    s.classList.add("exit")
    setTimeout(() => s.classList.remove("exit"), 600)
  })
  const target = document.getElementById(id)
  if(target){
    target.classList.remove("exit")
    requestAnimationFrame(() => {
      requestAnimationFrame(() => target.classList.add("active"))
    })
  }
}

// ════════════════════════════════════════════════════════════
// SCREEN 1 — OPENING
// ════════════════════════════════════════════════════════════

document.getElementById("btn-open-start").onclick = () => showScreen("screen-name")

// ════════════════════════════════════════════════════════════
// SCREEN 2 — NAME INPUT
// ════════════════════════════════════════════════════════════

const inpName = document.getElementById("inp-name")
inpName.addEventListener("keydown", e => { if(e.key === "Enter") proceed() })

document.getElementById("btn-name-continue").onclick = proceed

function proceed(){
  const name = inpName.value.trim()
  if(!name){
    inpName.style.borderColor = "#ff4b4b"
    inpName.style.boxShadow   = "0 0 0 3px rgba(255,75,75,0.2)"
    inpName.placeholder       = "Please enter your name ❤"
    inpName.focus()
    setTimeout(() => {
      inpName.style.borderColor = ""
      inpName.style.boxShadow   = ""
    }, 1200)
    return
  }

  window.APP.userName = name
  showScreen("screen-message")
  renderMessage(name)
}

function renderMessage(name){
  const el = document.getElementById("msg-text")
  el.innerHTML = `Hey <b>${esc(name)}</b> ❤️<br><br>` +
    `This experience was made just for you<br>` +
    `by <em>Anique Shaikh</em>.<br><br>` +
    `Raise your hand, bring your index finger<br>` +
    `and thumb together to draw.<br><br>` +
    `Let your heart speak freely. ✨`

  // Mini hearts inside message card
  spawnCardHearts()

  setTimeout(() => {
    showScreen(null) // hide all overlays
    document.querySelectorAll(".screen").forEach(s => {
      s.style.display = "none"
    })
    setStatus("Starting AI hand tracking…", "info")
    initHandTracking(canvas, ctx, window.APP.strokes, setStatus)
    setTimeout(() => {
      document.getElementById("gesture-guide").classList.add("hide")
    }, 14000)
  }, 4000)
}

function spawnCardHearts(){
  const container = document.getElementById("msg-hearts-fx")
  for(let i = 0; i < 14; i++){
    setTimeout(() => {
      const h = document.createElement("div")
      h.style.cssText =
        `position:absolute;bottom:0;left:${Math.random()*100}%;` +
        `font-size:${12+Math.random()*14}px;opacity:0.4;` +
        `animation:petalFloat ${6+Math.random()*6}s linear forwards`
      h.textContent = ["❤","💕","✨","💗"][Math.floor(Math.random()*4)]
      container.appendChild(h)
      setTimeout(() => h.remove(), 10000)
    }, i * 200)
  }
}

function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") }

// ════════════════════════════════════════════════════════════
// PANEL TOGGLE
// ════════════════════════════════════════════════════════════

const panel    = document.getElementById("panel")
const panelBtn = document.getElementById("btn-panel-toggle")

panelBtn.onclick = () => {
  panel.classList.toggle("collapsed")
  panelBtn.style.transform = panel.classList.contains("collapsed") ? "rotate(180deg)" : ""
}

// Draggable panel (desktop)
;(function dragPanel(){
  const handle = document.getElementById("panel-drag")
  let dragging = false, ox = 0, oy = 0

  function startDrag(cx, cy){
    dragging = true
    const rect = panel.getBoundingClientRect()
    ox = cx - rect.left; oy = cy - rect.top
    panel.style.transition = "none"
  }
  function moveDrag(cx, cy){
    if(!dragging) return
    panel.style.left = Math.max(0, Math.min(window.innerWidth  - panel.offsetWidth,  cx - ox)) + "px"
    panel.style.top  = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, cy - oy)) + "px"
  }
  function endDrag(){ dragging = false; panel.style.transition = "" }

  // Mouse
  handle.addEventListener("mousedown",  e => startDrag(e.clientX, e.clientY))
  window.addEventListener("mousemove",  e => moveDrag(e.clientX, e.clientY))
  window.addEventListener("mouseup",    endDrag)

  // Touch
  handle.addEventListener("touchstart", e => { e.preventDefault(); const t=e.touches[0]; startDrag(t.clientX, t.clientY) }, {passive:false})
  window.addEventListener("touchmove",  e => { if(!dragging) return; e.preventDefault(); const t=e.touches[0]; moveDrag(t.clientX, t.clientY) }, {passive:false})
  window.addEventListener("touchend",   endDrag)
})()

// ════════════════════════════════════════════════════════════
// COLORS
// ════════════════════════════════════════════════════════════

document.querySelectorAll(".swatch[data-color]").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".swatch").forEach(b => b.classList.remove("active"))
    btn.classList.add("active")
    window.APP.currentColor = btn.dataset.color
    toast("🎨 " + btn.title || btn.dataset.color)
  }
})

const customColorInput = document.getElementById("inp-custom-color")
document.getElementById("btn-custom-color").onclick = () => customColorInput.click()
customColorInput.oninput = () => {
  window.APP.currentColor = customColorInput.value
  document.querySelectorAll(".swatch").forEach(b => b.classList.remove("active"))
}

// ════════════════════════════════════════════════════════════
// BRUSH SIZE + OPACITY
// ════════════════════════════════════════════════════════════

const sldBrush   = document.getElementById("sld-brush")
const lblSize    = document.getElementById("lbl-size")
const sldOpacity = document.getElementById("sld-opacity")
const lblOpacity = document.getElementById("lbl-opacity")

sldBrush.oninput = () => {
  window.APP.brushSize = parseInt(sldBrush.value)
  lblSize.textContent  = window.APP.brushSize + "px"
}

sldOpacity.oninput = () => {
  window.APP.opacity   = parseInt(sldOpacity.value) / 100
  lblOpacity.textContent = sldOpacity.value + "%"
}

// ════════════════════════════════════════════════════════════
// BRUSH STYLE
// ════════════════════════════════════════════════════════════

document.querySelectorAll(".style-pill").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".style-pill").forEach(b => b.classList.remove("active"))
    btn.classList.add("active")
    window.APP.brushStyle = btn.dataset.style
    toast("Style: " + btn.textContent.trim())
  }
})

// ════════════════════════════════════════════════════════════
// CANVAS BACKGROUND THEME
// ════════════════════════════════════════════════════════════

document.querySelectorAll(".bg-pill").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".bg-pill").forEach(b => b.classList.remove("active"))
    btn.classList.add("active")
    window.APP.bgTheme = btn.dataset.bg
    toast("Canvas: " + btn.textContent.trim())
  }
})

// ════════════════════════════════════════════════════════════
// UNDO / REDO
// ════════════════════════════════════════════════════════════

document.getElementById("btn-undo").onclick = doUndo
document.getElementById("btn-redo").onclick = doRedo

function doUndo(){
  if(window.APP.strokes.length === 0){ toast("Nothing to undo"); return }
  const s = window.APP.strokes.pop()
  window.APP.redoStack.push(s)
  toast("↩ Undo")
}

function doRedo(){
  if(window.APP.redoStack.length === 0){ toast("Nothing to redo"); return }
  const s = window.APP.redoStack.pop()
  window.APP.strokes.push(s)
  toast("↪ Redo")
}

// ════════════════════════════════════════════════════════════
// CLEAR
// ════════════════════════════════════════════════════════════

document.getElementById("btn-clear").onclick = () => {
  if(window.APP.strokes.length === 0){ toast("Canvas is empty"); return }
  // Save to redo as a batch
  window.APP.redoStack.push(...window.APP.strokes.splice(0))
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  setStatus("Canvas cleared", "info")
  toast("🗑 Cleared")
}

// ════════════════════════════════════════════════════════════
// REPLAY
// ════════════════════════════════════════════════════════════

document.getElementById("btn-replay").onclick = () => {
  if(window.APP.strokes.length === 0){ toast("Draw something first!"); return }
  setStatus("Replaying…", "info")
  replayDrawing(canvas, ctx, window.APP.strokes, window.APP.bgTheme)
  toast("▶ Replaying your masterpiece")
}

// ════════════════════════════════════════════════════════════
// SPECIAL FX
// ════════════════════════════════════════════════════════════

document.getElementById("btn-hearts-rain").onclick = () => {
  heartsRain(canvas, ctx)
  setStatus("Love is falling ❤", "info")
  toast("💕 Love is raining!")
}

document.getElementById("btn-fireworks").onclick = () => {
  fireworks(canvas, ctx)
  toast("🎆 Fireworks for you!")
}

document.getElementById("btn-confetti").onclick = () => {
  confettiBurst(canvas, ctx)
  toast("🎊 Confetti!")
}

document.getElementById("btn-love-note").onclick = () => {
  const note = LOVE_NOTES[noteIndex % LOVE_NOTES.length]
  noteIndex++
  document.getElementById("love-note-title").textContent = note.title
  document.getElementById("love-note-body").textContent  = note.body
  document.getElementById("modal-love").style.display = "flex"
}

document.getElementById("btn-close-love").onclick = () => {
  document.getElementById("modal-love").style.display = "none"
}

// ════════════════════════════════════════════════════════════
// EXPORT
// ════════════════════════════════════════════════════════════

document.getElementById("btn-png").onclick = () => {
  const ec  = document.createElement("canvas")
  ec.width  = canvas.width
  ec.height = canvas.height
  const ectx = ec.getContext("2d")
  const bg   = BG_THEMES[window.APP.bgTheme] || BG_THEMES.dark
  ectx.fillStyle = `rgb(${bg.r},${bg.g},${bg.b})`
  ectx.fillRect(0, 0, ec.width, ec.height)
  ectx.drawImage(canvas, 0, 0)
  const link = document.createElement("a")
  link.download = "love-air-pen.png"
  link.href = ec.toDataURL("image/png")
  link.click()
  setStatus("PNG saved ✓", "ready")
  toast("📥 Saved as PNG!")
}

document.getElementById("btn-svg").onclick = () => {
  if(window.APP.strokes.length === 0){ toast("Draw something first!"); return }
  exportSVG(window.APP.strokes, window.APP.bgTheme)
  toast("📥 SVG exported!")
}

document.getElementById("btn-pdf").onclick = () => {
  exportPDF(canvas, window.APP.bgTheme)
  toast("📥 PDF exported!")
}

// ════════════════════════════════════════════════════════════
// OCR
// ════════════════════════════════════════════════════════════

document.getElementById("btn-ocr").onclick = async () => {
  setStatus("Analyzing your handwriting…", "info")
  const text = await recognizeText(canvas, setStatus)
  document.getElementById("ocr-result").textContent =
    text || "No text detected. Try writing with more contrast."
  document.getElementById("modal-ocr").style.display = "flex"
}

document.getElementById("btn-close-ocr").onclick = () => {
  document.getElementById("modal-ocr").style.display = "none"
}

document.querySelectorAll(".modal-veil").forEach(m => {
  m.onclick = e => { if(e.target === m) m.style.display = "none" }
})

// ════════════════════════════════════════════════════════════
// VOICE COMMANDS
// ════════════════════════════════════════════════════════════

;(function initVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if(!SR) return

  const r = new SR()
  r.continuous     = true
  r.interimResults = false
  r.lang           = "en-US"

  const colors = {
    "red"   : "#ff4b4b", "orange" : "#ff6b35",
    "yellow": "#ffb830", "green"  : "#30e86e",
    "blue"  : "#30b8ff", "purple" : "#c030ff",
    "pink"  : "#ff2d8f", "white"  : "#ffffff",
    "gold"  : "#ffd700", "cyan"   : "#00e5ff",
  }

  r.onresult = e => {
    const cmd = e.results[e.results.length - 1][0].transcript.toLowerCase().trim()
    console.log("[Voice]", cmd)

    if(cmd.includes("rain") || (cmd.includes("heart") && cmd.includes("rain"))) {
      document.getElementById("btn-hearts-rain").click()
    } else if(cmd.includes("firework")) {
      document.getElementById("btn-fireworks").click()
    } else if(cmd.includes("confetti")) {
      document.getElementById("btn-confetti").click()
    } else if(cmd.includes("love note") || cmd.includes("message")) {
      document.getElementById("btn-love-note").click()
    } else if(cmd.includes("clear") || cmd.includes("erase")) {
      document.getElementById("btn-clear").click()
    } else if(cmd.includes("undo")) {
      doUndo()
    } else if(cmd.includes("redo")) {
      doRedo()
    } else if(cmd.includes("save") || cmd.includes("download")) {
      document.getElementById("btn-png").click()
    } else if(cmd.includes("replay") || cmd.includes("play back")) {
      document.getElementById("btn-replay").click()
    } else if(cmd.includes("recognize") || cmd.includes("read")) {
      document.getElementById("btn-ocr").click()

    // Brush styles via voice
    } else if(cmd.includes("neon")) {
      setVoiceStyle("neon")
    } else if(cmd.includes("chalk")) {
      setVoiceStyle("chalk")
    } else if(cmd.includes("watercolor") || cmd.includes("water")) {
      setVoiceStyle("watercolor")
    } else if(cmd.includes("smooth")) {
      setVoiceStyle("smooth")
    } else if(cmd.includes("hearts style") || cmd.includes("heart style")) {
      setVoiceStyle("hearts")
    } else if(cmd.includes("stars style") || cmd.includes("star style")) {
      setVoiceStyle("stars")

    // Colors
    } else {
      for(const [word, hex] of Object.entries(colors)){
        if(cmd.includes(word)){
          window.APP.currentColor = hex
          document.querySelectorAll(".swatch").forEach(b => b.classList.remove("active"))
          toast("🎨 " + word.charAt(0).toUpperCase() + word.slice(1))
          setStatus("Color: " + word, "info")
          break
        }
      }

      // Brush size
      if(cmd.includes("bigger") || cmd.includes("thicker") || cmd.includes("larger")){
        window.APP.brushSize = Math.min(32, window.APP.brushSize + 3)
        sldBrush.value = window.APP.brushSize
        lblSize.textContent = window.APP.brushSize + "px"
        toast("Brush: " + window.APP.brushSize + "px")
      } else if(cmd.includes("smaller") || cmd.includes("thinner")){
        window.APP.brushSize = Math.max(1, window.APP.brushSize - 3)
        sldBrush.value = window.APP.brushSize
        lblSize.textContent = window.APP.brushSize + "px"
        toast("Brush: " + window.APP.brushSize + "px")
      }
    }
  }

  function setVoiceStyle(style){
    window.APP.brushStyle = style
    document.querySelectorAll(".style-pill").forEach(b => {
      b.classList.toggle("active", b.dataset.style === style)
    })
    toast("Style: " + style)
  }

  r.onerror = e => { if(e.error !== "no-speech" && e.error !== "aborted") console.warn("[Voice]", e.error) }
  r.onend   = () => { try { r.start() } catch(e){} }
  try { r.start() } catch(e){}
})()

// ════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ════════════════════════════════════════════════════════════

document.addEventListener("keydown", e => {
  if(document.activeElement.tagName === "INPUT") return
  const ctrl = e.ctrlKey || e.metaKey

  if(ctrl && e.key === "z"){ e.preventDefault(); doUndo() }
  else if(ctrl && (e.key === "y" || (e.shiftKey && e.key === "z"))){ e.preventDefault(); doRedo() }
  else if(ctrl && e.key === "s"){ e.preventDefault(); document.getElementById("btn-png").click() }
  else if(e.key === "Escape"){
    document.querySelectorAll(".modal-veil").forEach(m => m.style.display = "none")
    panel.classList.toggle("collapsed")
  }
  else if(e.key === " "){ e.preventDefault(); document.getElementById("btn-love-note").click() }
})

// ════════════════════════════════════════════════════════════
// EXPORT APP REFERENCE
// ════════════════════════════════════════════════════════════

window.APP.BG_THEMES = BG_THEMES
