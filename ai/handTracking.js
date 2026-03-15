// ai/handTracking.js

import { gestureEngine } from "./gestureEngine.js"

export async function initHandTracking(canvas, ctx, strokes, setStatus){
  const video = document.getElementById("video")

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width:{ideal:1280}, height:{ideal:720}, frameRate:{ideal:60}, facingMode:"user" }
    })
    video.srcObject = stream
    await video.play()
  } catch(err) {
    const msg = err.name === "NotAllowedError"
      ? "Camera permission denied — please allow camera access and refresh"
      : err.name === "NotFoundError"
      ? "No camera found on this device"
      : "Camera error: " + (err.message || err.name)
    setStatus(msg, "error")
    return
  }

  let hands
  try {
    hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` })
  } catch(e) {
    setStatus("MediaPipe failed to load. Check internet connection.", "error"); return
  }

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.72,
    minTrackingConfidence:  0.72
  })

  // ── Kalman-like smoothing ──
  let fx = null, fy = null, vx = 0, vy = 0
  const SMOOTH = 0.42, VSMOOTH = 0.20, JITTER = 1.2

  hands.onResults(results => {
    const cssW = parseInt(canvas.style.width)  || window.innerWidth
    const cssH = parseInt(canvas.style.height) || window.innerHeight

    if(!results.multiHandLandmarks || !results.multiHandLandmarks.length){
      fx = null; fy = null
      gestureEngine(results, canvas, ctx, strokes)
      return
    }

    const hand  = results.multiHandLandmarks[0]
    const idx   = hand[8]
    let rx = idx.x * cssW, ry = idx.y * cssH

    if(fx === null){ fx = rx; fy = ry }

    const dx = rx - fx, dy = ry - fy
    vx = vx*(1-VSMOOTH) + dx*VSMOOTH
    vy = vy*(1-VSMOOTH) + dy*VSMOOTH

    const spd = Math.sqrt(dx*dx + dy*dy)
    const sm  = spd > 12 ? 0.32 : SMOOTH

    fx += ((rx + vx*0.55) - fx) * sm
    fy += ((ry + vy*0.55) - fy) * sm
    if(Math.abs(fx-rx) < JITTER) fx = rx
    if(Math.abs(fy-ry) < JITTER) fy = ry

    hand[8].x = fx / cssW
    hand[8].y = fy / cssH

    gestureEngine(results, canvas, ctx, strokes)
  })

  let errs = 0
  async function loop(){
    try { await hands.send({image:video}); errs=0 }
    catch(e){ if(++errs>8){ setStatus("Tracking error — retrying…","warn"); errs=0 } }
    requestAnimationFrame(loop)
  }
  loop()
  setStatus("AI Hand Tracking Ready ✓", "ready")
}
