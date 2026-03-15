export function exportSVG(strokes){

let svg='<svg xmlns="http://www.w3.org/2000/svg">'

strokes.forEach(s=>{

svg+=`<polyline points="${s.map(p=>`${p.x},${p.y}`).join(" ")}" stroke="gold" fill="none"/>`

})

svg+='</svg>'

const blob=new Blob([svg],{type:"image/svg+xml"})

const link=document.createElement("a")

link.href=URL.createObjectURL(blob)
link.download="drawing.svg"
link.click()

}