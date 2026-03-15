// ai/handwritingAI.js
let worker = null

async function getWorker(setStatus){
  if(worker) return worker
  if(setStatus) setStatus("Loading OCR engine…","info")
  try {
    worker = await Tesseract.createWorker({
      logger: m => {
        if(m.status==="recognizing text"&&setStatus)
          setStatus("Recognizing… "+Math.round(m.progress*100)+"%","info")
      }
    })
    await worker.loadLanguage("eng")
    await worker.initialize("eng")
    await worker.setParameters({ tessedit_pageseg_mode:"6" })
    if(setStatus) setStatus("OCR Ready ✓","ready")
  } catch(e){ console.error(e); worker=null; throw e }
  return worker
}

export async function recognizeText(canvas, setStatus){
  try {
    if(setStatus) setStatus("Preprocessing image…","info")
    const proc = preprocessCanvas(canvas)
    const w    = await getWorker(setStatus)
    if(setStatus) setStatus("Analyzing…","info")
    const {data} = await w.recognize(proc)
    const text   = (data.text||"").trim()
    if(setStatus) setStatus(text ? `Detected: "${text.slice(0,36)}…"` : "No text detected","ready")
    return text
  } catch(e){
    console.error(e)
    if(setStatus) setStatus("OCR failed","error")
    return ""
  }
}

function preprocessCanvas(original){
  const tmp=document.createElement("canvas")
  tmp.width=original.width; tmp.height=original.height
  const c=tmp.getContext("2d")
  c.fillStyle="white"; c.fillRect(0,0,tmp.width,tmp.height)
  c.drawImage(original,0,0)
  const img=c.getImageData(0,0,tmp.width,tmp.height)
  const d=img.data
  for(let i=0;i<d.length;i+=4){
    const g=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]
    const v=Math.min(255,Math.max(0,(g-100)*2.2+100))>145?255:0
    d[i]=d[i+1]=d[i+2]=v
  }
  c.putImageData(img,0,0); return tmp
}
