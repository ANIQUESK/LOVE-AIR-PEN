// export/pdfExport.js
export function exportPDF(canvas, bgTheme){
  const W=parseInt(canvas.style.width)||window.innerWidth
  const H=parseInt(canvas.style.height)||window.innerHeight
  const BG=(window.APP?.BG_THEMES||{})[bgTheme||"dark"]||{r:8,g:0,b:12}

  const ec=document.createElement("canvas"); ec.width=W; ec.height=H
  const ec2=ec.getContext("2d")
  ec2.fillStyle=`rgb(${BG.r},${BG.g},${BG.b})`
  ec2.fillRect(0,0,W,H)
  ec2.drawImage(canvas,0,0,W,H)
  const img=ec.toDataURL("image/png")

  function make(){
    try {
      const {jsPDF}=window.jspdf
      const pdf=new jsPDF({ orientation:W>H?"landscape":"portrait", unit:"px", format:[W,H], hotfixes:["px_scaling"] })
      pdf.addImage(img,"PNG",0,0,W,H)
      pdf.save("love-air-pen.pdf")
    } catch(e){
      const a=document.createElement("a"); a.href=img; a.download="love-air-pen.png"
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    }
  }

  if(typeof window.jspdf!=="undefined") make()
  else {
    const s=document.createElement("script")
    s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    s.onload=make; s.onerror=()=>{ const a=document.createElement("a"); a.href=img; a.download="love-air-pen.png"; a.click() }
    document.body.appendChild(s)
  }
}
