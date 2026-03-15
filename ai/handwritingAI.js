// ai/handwritingAI.js

let worker = null

// ---------- INITIALIZE OCR WORKER ----------

async function getWorker(){

if(worker) return worker

worker = await Tesseract.createWorker({

logger: m => {

const status = document.getElementById("status")

if(m.status === "recognizing text"){
status.innerText =
"Recognizing handwriting " +
Math.round(m.progress*100) + "%"
}

}

})

await worker.loadLanguage("eng")
await worker.initialize("eng")

return worker

}


// ---------- MAIN FUNCTION ----------

export async function recognizeText(canvas){

const status = document.getElementById("status")

try{

status.innerText="Preparing image..."

const processedCanvas = preprocessCanvas(canvas)

const worker = await getWorker()

status.innerText="Analyzing handwriting..."

const { data } = await worker.recognize(processedCanvas)

const text = data.text.trim()

if(text.length>0){

status.innerText="Detected: "+text

}else{

status.innerText="No text detected"

}

return text

}catch(err){

console.error("OCR Error:",err)

status.innerText="Recognition failed"

return ""

}

}



// ---------- IMAGE PREPROCESSING ----------

function preprocessCanvas(original){

const canvas=document.createElement("canvas")
const ctx=canvas.getContext("2d")

canvas.width=original.width
canvas.height=original.height

ctx.drawImage(original,0,0)

const img=ctx.getImageData(0,0,canvas.width,canvas.height)

const d=img.data

// grayscale + threshold

for(let i=0;i<d.length;i+=4){

const gray=(d[i]+d[i+1]+d[i+2])/3

const value=gray>150?255:0

d[i]=value
d[i+1]=value
d[i+2]=value

}

ctx.putImageData(img,0,0)

return canvas

}