import { replayDrawing } from "./effects/replaySystem.js"
import { initHandTracking } from "./ai/handTracking.js"
import { recognizeText } from "./ai/handwritingAI.js"
import { exportSVG } from "./export/svgExport.js"
import { exportPDF } from "./export/pdfExport.js"

// ===============================
// DOM ELEMENTS
// ===============================
const replayBtn = document.getElementById("replayBtn")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const warningScreen = document.getElementById("warningScreen")
const startBtn = document.getElementById("startBtn")

const clearBtn = document.getElementById("clearBtn")
const savePNGBtn = document.getElementById("savePNGBtn")
const saveSVGBtn = document.getElementById("saveSVGBtn")
const savePDFBtn = document.getElementById("savePDFBtn")
const recognizeBtn = document.getElementById("recognizeBtn")

const status = document.getElementById("status")


// ===============================
// CANVAS SETUP
// ===============================

function resizeCanvas(){

canvas.width = window.innerWidth
canvas.height = window.innerHeight

}

resizeCanvas()

window.addEventListener("resize", resizeCanvas)


// ===============================
// GLOBAL DRAWING VARIABLES
// ===============================

window.strokes = []
window.currentColor = "#ff2d8f"
window.brushSize = 6


// ===============================
// START EXPERIENCE
// ===============================

startBtn.onclick = () => {

warningScreen.style.display = "none"

status.innerText = "Starting AI hand tracking..."

initHandTracking(canvas,ctx,window.strokes)

}


// ===============================
// BUTTON ACTIONS
// ===============================

clearBtn.onclick = () => {

window.strokes.length = 0
ctx.clearRect(0,0,canvas.width,canvas.height)

status.innerText = "Canvas cleared"

}


savePNGBtn.onclick = () => {

const link = document.createElement("a")
link.download = "love-air-pen.png"
link.href = canvas.toDataURL("image/png")
link.click()

status.innerText = "PNG saved"

}


saveSVGBtn.onclick = () => {

exportSVG(window.strokes)

status.innerText = "SVG exported"

}


savePDFBtn.onclick = () => {

exportPDF(canvas)

status.innerText = "PDF exported"

}

replayBtn.onclick = ()=>{

replayDrawing(canvas,ctx,window.strokes)

}
// ===============================
// OCR RECOGNITION
// ===============================

recognizeBtn.onclick = async () => {

status.innerText = "Recognizing handwriting..."

const text = await recognizeText(canvas)

if(text){

alert("Detected Text:\n\n" + text)

}else{

alert("No text detected.")

}

}


/// =============================
// ADVANCED VOICE RECOGNITION
// =============================

const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition

if(!SpeechRecognition){

status.innerText = "Voice commands not supported"

}else{

const recognition = new SpeechRecognition()

recognition.continuous = true
recognition.interimResults = false
recognition.lang = "en-US"


recognition.onstart = () => {

status.innerText = "Voice assistant listening..."

}


recognition.onresult = (event) => {

const command =
event.results[event.results.length - 1][0].transcript
.toLowerCase()
.trim()

console.log("Voice:",command)

handleVoiceCommand(command)

}


// =============================
// COMMAND PROCESSOR
// =============================

function handleVoiceCommand(cmd){

console.log("Voice command:",cmd)


// ======================
// CLEAR CANVAS
// ======================

if(cmd.includes("clear") || cmd.includes("erase")){

clearBtn.click()
status.innerText = "Canvas cleared"
return

}


// ======================
// SAVE DRAWING
// ======================

if(cmd.includes("save")){

savePNGBtn.click()
status.innerText = "Drawing saved"
return

}


// ======================
// REPLAY DRAWING
// ======================

if(
cmd.includes("replay") ||
cmd.includes("replay drawing") ||
cmd.includes("play drawing")
){

if(replayBtn){
replayBtn.click()
status.innerText = "Replaying drawing"
}

return

}


// ======================
// OCR TEXT RECOGNITION
// ======================

if(
cmd.includes("recognize") ||
cmd.includes("recognize text") ||
cmd.includes("detect text") ||
cmd.includes("read text")
){

recognizeBtn.click()
status.innerText = "Analyzing handwriting"

return

}


// ======================
// RESET COLOR TO DEFAULT
// ======================

if(
cmd.includes("default color") ||
cmd.includes("reset color") ||
cmd.includes("color default") ||
cmd.includes("change color to default")
){

window.currentColor = "#ff2d8f"

status.innerText = "Color reset to default"

return

}


// ======================
// COLOR COMMANDS
// ======================

if(cmd.includes("red")){

window.currentColor = "#ff4b4b"
status.innerText = "Color changed to red"
return

}

if(cmd.includes("blue")){

window.currentColor = "#4b8bff"
status.innerText = "Color changed to blue"
return

}

if(cmd.includes("green")){

window.currentColor = "#4bff7a"
status.innerText = "Color changed to green"
return

}

if(cmd.includes("yellow")){

window.currentColor = "#f4c542"
status.innerText = "Color changed to yellow"
return

}
if(cmd.includes("pink")){

window.currentColor = "#ff2d8f"
status.innerText = "Color changed to red"
return

}


// ======================
// BRUSH SIZE
// ======================

if(
cmd.includes("bigger") ||
cmd.includes("increase brush") ||
cmd.includes("larger brush")
){

window.brushSize += 2

status.innerText = "Brush size increased"

return

}

if(
cmd.includes("smaller") ||
cmd.includes("decrease brush") ||
cmd.includes("reduce brush")
){

window.brushSize = Math.max(2,window.brushSize-2)

status.innerText = "Brush size decreased"

return

}

}
// ERROR HANDLING

recognition.onerror = (event)=>{

console.warn("Voice error:",event.error)

}


// AUTO RESTART

recognition.onend = ()=>{

recognition.start()

}


// START LISTENING

recognition.start()

}