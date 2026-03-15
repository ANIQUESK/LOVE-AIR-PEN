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
// MEDIAPIPE HAND MODEL
// ==============================

const hands = new Hands({

locateFile:(file)=>
`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`

})

hands.setOptions({

maxNumHands:1,

modelComplexity:1,

minDetectionConfidence:0.75,
minTrackingConfidence:0.75

})


// ==============================
// POSITION SMOOTHING
// ==============================

let lastX = null
let lastY = null

let velocityX = 0
let velocityY = 0

const smoothing = 0.45
const velocitySmoothing = 0.2


// ==============================
// RESULT CALLBACK
// ==============================

hands.onResults(results=>{

if(!running) return


// no hand detected
if(!results.multiHandLandmarks ||
results.multiHandLandmarks.length === 0){

lastX = null
lastY = null

gestureEngine(results,canvas,ctx,strokes)

return

}


const hand = results.multiHandLandmarks[0]

const index = hand[8]


// convert normalized coords

let x = index.x * canvas.width
let y = index.y * canvas.height


// initialize
if(lastX === null){

lastX = x
lastY = y

}


// velocity smoothing

velocityX = velocityX*(1-velocitySmoothing) +
(x-lastX)*velocitySmoothing

velocityY = velocityY*(1-velocitySmoothing) +
(y-lastY)*velocitySmoothing


// position smoothing

lastX = lastX + velocityX*smoothing
lastY = lastY + velocityY*smoothing


// overwrite landmark with smoothed value

hand[8].x = lastX / canvas.width
hand[8].y = lastY / canvas.height


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

console.warn("Tracking frame error:",err)

}

requestAnimationFrame(detect)

}

detect()

status.innerText = "AI Hand Tracking Ready"

}