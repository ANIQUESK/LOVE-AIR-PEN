import { initHandTracking } from "./ai/handTracking.js"
import { exportSVG } from "./export/svgExport.js"
import { exportPDF } from "./export/pdfExport.js"
const warningScreen = document.getElementById("warningScreen")
const startBtn = document.getElementById("startBtn")

startBtn.onclick = () => {

warningScreen.style.display = "none"

}
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// GLOBAL DRAWING VARIABLES
window.strokes = []
window.currentColor = "#f4c542"
window.brushSize = 6

// BUTTONS
const clearBtn = document.getElementById("clearBtn")
const savePNGBtn = document.getElementById("savePNGBtn")
const saveSVGBtn = document.getElementById("saveSVGBtn")
const savePDFBtn = document.getElementById("savePDFBtn")
const status = document.getElementById("status")

// -------------------
// BUTTON FUNCTIONS
// -------------------

clearBtn.onclick = () => {

window.strokes.length = 0
ctx.clearRect(0,0,canvas.width,canvas.height)

}

savePNGBtn.onclick = () => {

const link = document.createElement("a")
link.download = "drawing.png"
link.href = canvas.toDataURL()
link.click()

}

saveSVGBtn.onclick = () => {

exportSVG(window.strokes)

}

savePDFBtn.onclick = () => {

exportPDF(canvas)

}

// START HAND TRACKING
initHandTracking(canvas,ctx,window.strokes)


// =============================
// VOICE RECOGNITION SYSTEM
// =============================

// Browser compatibility
const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition

if(!SpeechRecognition){

status.innerText = "Voice not supported in this browser"

}else{

const recognition = new SpeechRecognition()

recognition.continuous = true
recognition.interimResults = false
recognition.lang = "en-US"

// voice started
recognition.onstart = () => {

status.innerText = "Voice listening..."

}

// voice result
recognition.onresult = (event) => {

const command =
event.results[event.results.length - 1][0].transcript
.toLowerCase()
.trim()

console.log("Voice command:",command)

// COMMANDS

if(command.includes("clear")){

clearBtn.click()

}

if(command.includes("save")){

savePNGBtn.click()

}

if(command.includes("red")){

window.currentColor = "#ff4b4b"

}

if(command.includes("blue")){

window.currentColor = "#4b8bff"

}

if(command.includes("green")){

window.currentColor = "#4bff7a"

}

if(command.includes("yellow")){

window.currentColor = "#f4c542"

}

if(command.includes("bigger")){

window.brushSize += 2

}

if(command.includes("smaller")){

window.brushSize = Math.max(2,window.brushSize-2)

}

}

// handle errors
recognition.onerror = (event) => {

console.warn("Voice error:",event.error)

}

// auto restart if stopped
recognition.onend = () => {

recognition.start()

}

// start voice recognition
recognition.start()

}