import { gestureEngine } from "./gestureEngine.js"

export async function initHandTracking(canvas, ctx, strokes){

const video = document.getElementById("video")
const status = document.getElementById("status")

try{

// ==============================
// CAMERA INITIALIZATION
// ==============================

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

// higher = more accurate
modelComplexity:1,

// stronger detection threshold
minDetectionConfidence:0.8,

// stronger tracking stability
minTrackingConfidence:0.8

})


// ==============================
// SMOOTHING VARIABLES
// ==============================

let lastX = null
let lastY = null

// exponential smoothing factor
const smoothingFactor = 0.35


// ==============================
// RESULT CALLBACK
// ==============================

hands.onResults(results=>{

if(results.multiHandLandmarks && results.multiHandLandmarks.length>0){

const hand = results.multiHandLandmarks[0]

const index = hand[8]

// convert normalized coordinates
let x = index.x * canvas.width
let y = index.y * canvas.height

if(lastX === null){

lastX = x
lastY = y

}else{

// exponential smoothing
lastX = lastX + (x - lastX) * smoothingFactor
lastY = lastY + (y - lastY) * smoothingFactor

}

// override landmark with smoothed position
hand[8].x = lastX / canvas.width
hand[8].y = lastY / canvas.height

}

gestureEngine(results, canvas, ctx, strokes)

})


// ==============================
// DETECTION LOOP
// ==============================

async function detect(){

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