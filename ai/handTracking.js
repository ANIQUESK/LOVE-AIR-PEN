// ai/handTracking.js — Mobile-optimised

import { gestureEngine } from "./gestureEngine.js"

export async function initHandTracking(canvas, ctx, strokes, setStatus){
  const video    = document.getElementById("video")
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  // iOS Safari: these MUST be set before play()
  video.setAttribute("playsinline", "")
  video.setAttribute("muted",       "")
  video.setAttribute("autoplay",    "")
  video.muted = true

  const constraints = isMobile
    ? { video: { facingMode:"user", width:{ideal:640}, height:{ideal:480} } }
    : { video: { facingMode:"user", width:{ideal:1280}, height:{ideal:720}, frameRate:{ideal:60} } }

  try {
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints)
    } catch(e) {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:"user" } })
    }
    video.srcObject = stream
    await video.play()
  } catch(err) {
    let msg = "Camera error"
    if(err.name === "NotAllowedError")    msg = "📷 Camera denied — tap Allow and refresh"
    else if(err.name === "NotFoundError") msg = "📷 No camera found on this device"
    else if(err.name === "NotReadableError") msg = "📷 Camera busy — close other apps"
    else                                  msg = "📷 " + (err.message || err.name)
    setStatus(msg, "error"); console.error("[Camera]", err); return
  }

  let hands
  try {
    hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` })
  } catch(e) { setStatus("MediaPipe failed to load — check internet","error"); return }

  const isLow = isMobile || window.innerWidth < 768
  hands.setOptions({
    maxNumHands:1,
    modelComplexity:         isLow ? 0 : 1,
    minDetectionConfidence:  isLow ? 0.65 : 0.72,
    minTrackingConfidence:   isLow ? 0.65 : 0.72,
  })

  setStatus("Loading AI model…","info")

  let fx=null, fy=null, vx=0, vy=0
  const SM=0.42, VS=0.20, JT=1.2

  hands.onResults(results => {
    const cW=parseInt(canvas.style.width)||window.innerWidth
    const cH=parseInt(canvas.style.height)||window.innerHeight

    if(!results.multiHandLandmarks||!results.multiHandLandmarks.length){
      fx=null; fy=null; gestureEngine(results,canvas,ctx,strokes); return
    }

    const hand=results.multiHandLandmarks[0], idx=hand[8]
    let rx=idx.x*cW, ry=idx.y*cH
    if(fx===null){fx=rx;fy=ry}
    const dx=rx-fx, dy=ry-fy
    vx=vx*(1-VS)+dx*VS; vy=vy*(1-VS)+dy*VS
    const sm=Math.sqrt(dx*dx+dy*dy)>12?0.32:SM
    fx+=((rx+vx*0.55)-fx)*sm; fy+=((ry+vy*0.55)-fy)*sm
    if(Math.abs(fx-rx)<JT)fx=rx; if(Math.abs(fy-ry)<JT)fy=ry
    hand[8].x=fx/cW; hand[8].y=fy/cH
    gestureEngine(results,canvas,ctx,strokes)
  })

  let errs=0, frame=0
  const SKIP=isLow?1:0
  async function loop(){
    if(frame++%(SKIP+1)!==0){requestAnimationFrame(loop);return}
    try{await hands.send({image:video});errs=0}
    catch(e){if(++errs>8){setStatus("Hand not visible — try better lighting","warn");errs=0}}
    requestAnimationFrame(loop)
  }
  loop()
  setStatus("AI Hand Tracking Ready ✓","ready")
}
