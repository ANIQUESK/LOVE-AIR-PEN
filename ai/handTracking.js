import { gestureEngine } from "./gestureEngine.js"

export async function initHandTracking(canvas, ctx, strokes){

const video = document.getElementById("video")
const status = document.getElementById("status")

let running = true

// ==============================
// CAMERA INITIALIZATION
// ==============================

try{

const stream = await navigator.mediaDevices.getUserMedia({
video:{
width:{ideal:1280},
height:{ideal:720},
frameRate:{ideal:60},
facingMode:"user"
}
})

video.srcObject = stream
await video.play()

}catch(err){

console.error("Camera error:",err)
status.innerText = "Camera access denied"
return

}


// ==============================
// MEDIAPIPE MODEL
// ==============================

const hands = new Hands({
locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
})

hands.setOptions({
maxNumHands:1,
modelComplexity:1,
minDetectionConfidence:0.75,
minTrackingConfidence:0.75
})


// ==============================
// STABILIZATION VARIABLES
// ==============================

let filteredX = null
let filteredY = null

let velocityX = 0
let velocityY = 0

let lastTime = performance.now()

const jitterThreshold = 1.5
const baseSmoothing = 0.45
const velocitySmoothing = 0.18


// ==============================
// RESULT CALLBACK
// ==============================

hands.onResults(results=>{

if(!running) return

// No hand detected
if(!results.multiHandLandmarks ||
results.multiHandLandmarks.length === 0){

filteredX = null
filteredY = null

gestureEngine(results,canvas,ctx,strokes)
return
}

const hand = results.multiHandLandmarks[0]
const index = hand[8]


// Convert coordinates
let rawX = index.x * canvas.width
let rawY = index.y * canvas.height


const now = performance.now()
const dt = Math.max((now-lastTime)/16,1)
lastTime = now


// Initialize
if(filteredX === null){

filteredX = rawX
filteredY = rawY

}


// Velocity estimation
let dx = rawX-filteredX
let dy = rawY-filteredY

velocityX = velocityX*(1-velocitySmoothing) + dx*velocitySmoothing
velocityY = velocityY*(1-velocitySmoothing) + dy*velocitySmoothing


// Motion prediction
let predictedX = rawX + velocityX*0.6
let predictedY = rawY + velocityY*0.6


// Dynamic smoothing
let speed = Math.sqrt(dx*dx+dy*dy)

let smoothing = speed > 10 ? 0.35 : baseSmoothing


filteredX += (predictedX-filteredX)*smoothing
filteredY += (predictedY-filteredY)*smoothing


// Jitter suppression
if(Math.abs(filteredX-rawX) < jitterThreshold) filteredX = rawX
if(Math.abs(filteredY-rawY) < jitterThreshold) filteredY = rawY


// Update landmark
hand[8].x = filteredX / canvas.width
hand[8].y = filteredY / canvas.height


gestureEngine(results,canvas,ctx,strokes)

})


// ==============================
// DETECTION LOOP
// ==============================

async function detect(){

if(!running) return

try{

await hands.send({image:video})

}catch(err){

console.warn("Tracking error:",err)

}

requestAnimationFrame(detect)

}

detect()

status.innerText = "AI Hand Tracking Ready"

}