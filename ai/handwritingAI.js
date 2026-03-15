// ai/handwritingAI.js

let worker = null

// ===============================
// INITIALIZE OCR WORKER
// ===============================

async function getWorker(){

if(worker) return worker

const status = document.getElementById("status")

status.innerText = "Loading AI recognition engine..."

worker = await Tesseract.createWorker({

logger: m => {

if(m.status === "recognizing text"){

status.innerText =
"Recognizing handwriting " +
Math.round(m.progress * 100) + "%"

}

}

})

await worker.loadLanguage("eng")
await worker.initialize("eng")

status.innerText = "OCR Engine Ready"

return worker

}



// ===============================
// MAIN RECOGNITION FUNCTION
// ===============================

export async function recognizeText(canvas){

const status = document.getElementById("status")

try{

status.innerText = "Preparing image for recognition..."

const processedCanvas = preprocessCanvas(canvas)

const workerInstance = await getWorker()

status.innerText = "Analyzing handwriting..."

const { data } = await workerInstance.recognize(processedCanvas)

const text = data.text.trim()

if(text.length > 0){

status.innerText = "Detected: " + text

}else{

status.innerText = "No text detected"

}

return text

}catch(err){

console.error("OCR Error:",err)

status.innerText = "Recognition failed"

return ""

}

}



// ===============================
// IMAGE PREPROCESSING
// ===============================

function preprocessCanvas(original){

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")

canvas.width = original.width
canvas.height = original.height

ctx.drawImage(original,0,0)

const img = ctx.getImageData(0,0,canvas.width,canvas.height)

const d = img.data


// convert to grayscale
for(let i=0;i<d.length;i+=4){

const gray = (d[i] + d[i+1] + d[i+2]) / 3

// contrast boost
const contrast = (gray - 128) * 1.5 + 128

// threshold
const value = contrast > 150 ? 255 : 0

d[i] = value
d[i+1] = value
d[i+2] = value

}

ctx.putImageData(img,0,0)

return canvas

}