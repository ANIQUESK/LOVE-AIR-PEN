// export/svgExport.js
export function exportSVG(strokes, bgTheme){
  const BG=(window.APP?.BG_THEMES||{})[bgTheme||"dark"]||{r:8,g:0,b:12}
  const W=window.innerWidth, H=window.innerHeight
  const bgColor=`rgb(${BG.r},${BG.g},${BG.b})`

  let svg=`<?xml version="1.0" encoding="UTF-8"?>\n`
  svg+=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n`
  svg+=`<rect width="100%" height="100%" fill="${bgColor}"/>\n`

  strokes.forEach((s,idx)=>{
    if(!s||s.length<2) return
    const color=s._color||"#ff2d8f"
    const size=s._size||6
    const alpha=s._alpha??1
    const style=s._style||"smooth"

    let d=`M ${s[0].x.toFixed(1)} ${s[0].y.toFixed(1)}`
    for(let i=1;i<s.length-2;i++){
      const xc=((s[i].x+s[i+1].x)/2).toFixed(1)
      const yc=((s[i].y+s[i+1].y)/2).toFixed(1)
      d+=` Q ${s[i].x.toFixed(1)} ${s[i].y.toFixed(1)} ${xc} ${yc}`
    }
    d+=` L ${s[s.length-1].x.toFixed(1)} ${s[s.length-1].y.toFixed(1)}`

    const glow=style==="neon"?` filter="url(#neon${idx})"`:""
    if(style==="neon"){
      svg+=`<defs><filter id="neon${idx}"><feGaussianBlur stdDeviation="4" result="b"/>`
      svg+=`<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>\n`
    }
    svg+=`<path d="${d}" stroke="${color}" stroke-width="${size}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${alpha*(style==="chalk"?0.7:style==="watercolor"?0.5:1)}"${glow}/>\n`
  })

  svg+=`</svg>`
  const blob=new Blob([svg],{type:"image/svg+xml"})
  const url=URL.createObjectURL(blob)
  const a=document.createElement("a"); a.href=url; a.download="love-air-pen.svg"
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
