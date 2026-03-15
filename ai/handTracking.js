import { gestureEngine } from "./gestureEngine.js"

export async function initHandTracking(canvas, ctx, strokes){

const video = document.getElementById("video")
const status = document.getElementById("status")

// -------- CAMERA SETTINGS (better accuracy) --------

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

// -------- MEDIAPIPE HAND MODEL --------

const hands = new Hands({

locateFile:(file)=>
`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`

})

hands.setOptions({

maxNumHands:1,

// higher model complexity = better accuracy
modelComplexity:1,

// stronger detection threshold
minDetectionConfidence:0.8,

// stronger tracking stability
minTrackingConfidence:0.8

})


// -------- SMOOTHING VARIABLES --------

let lastX = null
let lastY = null

const smoothingFactor = 0.35


hands.onResults(results=>{

// smooth coordinates before sending to drawing engine

if(results.multiHandLandmarks && results.multiHandLandmarks.length > 0){

const hand = results.multiHandLandmarks[0]

const index = hand[8]

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

// override landmark position with smoothed values
hand[8].x = lastX / canvas.width
hand[8].y = lastY / canvas.height

}

gestureEngine(results, canvas, ctx, strokes)

})


// -------- MAIN DETECTION LOOP --------

async function detect(){

await hands.send({image:video})

requestAnimationFrame(detect)

}

detect()

status.innerText = "AI Ready"

}