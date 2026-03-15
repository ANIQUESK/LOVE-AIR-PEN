// effects/replaySystem.js
export async function replayDrawing(canvas, ctx, strokes, bgTheme){
  if(!strokes||strokes.length===0) return
  window.APP.replayMode=true

  const BG=(window.APP?.BG_THEMES||{})[bgTheme||"dark"]||{r:8,g:0,b:12}
  ctx.fillStyle=`rgb(${BG.r},${BG.g},${BG.b})`
  ctx.fillRect(0,0,canvas.width,canvas.height)

  for(const stroke of strokes){
    if(!stroke||stroke.length<2) continue
    await animateStroke(ctx,stroke)
  }
  window.APP.replayMode=false
}

function animateStroke(ctx,stroke){
  return new Promise(resolve=>{
    const color=stroke._color||"#ff2d8f"
    const size=stroke._size||6
    ctx.lineCap="round"; ctx.lineJoin="round"
    ctx.strokeStyle=color; ctx.lineWidth=size
    ctx.shadowColor=color; ctx.shadowBlur=10
    let i=0
    function step(){
      if(i>=stroke.length-1){resolve();return}
      ctx.globalAlpha=0.2; ctx.lineWidth=size+3
      ctx.beginPath(); ctx.moveTo(stroke[i].x,stroke[i].y)
      ctx.lineTo(stroke[i+1].x,stroke[i+1].y); ctx.stroke()
      ctx.globalAlpha=1; ctx.lineWidth=size
      ctx.beginPath(); ctx.moveTo(stroke[i].x,stroke[i].y)
      ctx.lineTo(stroke[i+1].x,stroke[i+1].y); ctx.stroke()
      i++; requestAnimationFrame(step)
    }
    step()
  })
}
