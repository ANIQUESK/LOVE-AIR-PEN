import { replayDrawing } from "./effects/replaySystem.js"
import { initHandTracking } from "./ai/handTracking.js"
import { recognizeText } from "./ai/handwritingAI.js"
import { exportSVG } from "./export/svgExport.js"
import { exportPDF } from "./export/pdfExport.js"
import { heartsRain } from "./effects/heartsRain.js"


// ===============================
// DOM ELEMENTS
// ===============================

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const warningScreen = document.getElementById("warningScreen")
const nameScreen = document.getElementById("nameScreen")
const messageScreen = document.getElementById("messageScreen")

const startBtn = document.getElementById("startBtn")
const continueBtn = document.getElementById("continueBtn")

const userNameInput = document.getElementById("userName")
const personalMessage = document.getElementById("personalMessage")

const clearBtn = document.getElementById("clearBtn")
const savePNGBtn = document.getElementById("savePNGBtn")
const saveSVGBtn = document.getElementById("saveSVGBtn")
const savePDFBtn = document.getElementById("savePDFBtn")
const recognizeBtn = document.getElementById("recognizeBtn")
const replayBtn = document.getElementById("replayBtn")

const status = document.getElementById("status")


// ===============================
// CANVAS SETUP
// ===============================

function resizeCanvas(){

const dpr = window.devicePixelRatio || 1

canvas.width = window.innerWidth * dpr
canvas.height = window.innerHeight * dpr

canvas.style.width = window.innerWidth + "px"
canvas.style.height = window.innerHeight + "px"

ctx.setTransform(1,0,0,1,0,0)
ctx.scale(dpr,dpr)

}

resizeCanvas()

window.addEventListener("resize",resizeCanvas)


// ===============================
// GLOBAL DRAW VARIABLES
// ===============================

window.strokes = []
window.currentColor = "#ff2d8f"
window.brushSize = 6


// ===============================
// EXPERIENCE FLOW
// ===============================

// WARNING → NAME
startBtn.onclick = () => {

warningScreen.style.display = "none"
nameScreen.style.display = "flex"

}

// NAME → MESSAGE
continueBtn.onclick = () => {

const name = userNameInput.value.trim()

if(!name){
alert("Please enter your name")
return
}

nameScreen.style.display = "none"
messageScreen.style.display = "flex"

personalMessage.innerHTML = `
Hey <b>${name}</b> ❤️<br><br>
I hope you like this.<br>
This is specially made for you by Anique Shaikh.<br><br>
Let's start.
`

setTimeout(()=>{

messageScreen.style.display="none"

status.innerText="Starting AI hand tracking..."

initHandTracking(canvas,ctx,window.strokes)

},3500)

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


replayBtn.onclick = () => {

replayDrawing(canvas,ctx,window.strokes)

status.innerText = "Replaying drawing"

}


// ===============================
// OCR TEXT RECOGNITION
// ===============================

recognizeBtn.onclick = async () => {

status.innerText = "Recognizing handwriting..."

const text = await recognizeText(canvas)

if(text){

alert("Detected Text:\n\n"+text)

}else{

alert("No text detected.")

}

}


// =============================
// VOICE COMMAND SYSTEM
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

handleVoiceCommand(command)

}


// =============================
// COMMAND PROCESSOR
// =============================

function handleVoiceCommand(cmd){

console.log("Voice command:",cmd)


// HEART RAIN
if(
cmd.includes("rain of hearts") ||
cmd.includes("heart rain") ||
cmd.includes("love rain")
){

status.innerText = "Love is raining..."

heartsRain(canvas)

return

}


// CLEAR
if(cmd.includes("clear") || cmd.includes("erase")){
clearBtn.click()
return
}


// SAVE
if(cmd.includes("save")){
savePNGBtn.click()
return
}


// REPLAY
if(cmd.includes("replay")){
replayBtn.click()
return
}


// OCR
if(
cmd.includes("recognize") ||
cmd.includes("detect text") ||
cmd.includes("read text")
){
recognizeBtn.click()
return
}


// DEFAULT COLOR
if(cmd.includes("default color") || cmd.includes("reset color")){
window.currentColor = "#ff2d8f"
status.innerText = "Color reset to default"
return
}


// COLORS
if(cmd.includes("red")){
window.currentColor = "#ff4b4b"
status.innerText = "Color red"
return
}

if(cmd.includes("blue")){
window.currentColor = "#4b8bff"
status.innerText = "Color blue"
return
}

if(cmd.includes("green")){
window.currentColor = "#4bff7a"
status.innerText = "Color green"
return
}

if(cmd.includes("yellow")){
window.currentColor = "#f4c542"
status.innerText = "Color yellow"
return
}

if(cmd.includes("pink")){
window.currentColor = "#ff2d8f"
status.innerText = "Color pink"
return
}


// BRUSH SIZE
if(cmd.includes("bigger") || cmd.includes("increase brush")){
window.brushSize += 2
status.innerText = "Brush bigger"
return
}

if(cmd.includes("smaller") || cmd.includes("reduce brush")){
window.brushSize = Math.max(2,window.brushSize-2)
status.innerText = "Brush smaller"
return
}

}


// =============================
// ERROR HANDLING
// =============================

recognition.onerror = (event)=>{
console.warn("Voice error:",event.error)
}


// =============================
// AUTO RESTART LISTENING
// =============================

recognition.onend = ()=>{
recognition.start()
}


// START VOICE SYSTEM
recognition.start()

}