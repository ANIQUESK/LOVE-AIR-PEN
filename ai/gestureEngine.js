// ai/gestureEngine.js — 6 Brush Styles + Full Gesture Engine

let drawing = false, currentStroke = [], lastPinch = false
let smoothX = null, smoothY = null
let buf = [], lastX = null, lastY = null, vel = 0
const BUF = 7, PT = 0.048, PR = 0.058
let pulse = 0, bgHearts = [], particles = [], sparkles = []
let lastUIClick = 0

// ── Background drifting hearts ──
function spawnBGHeart(cW, cH){
  bgHearts.push({
    x: Math.random()*cW, y: cH+20,
    size: 9+Math.random()*13,
    speed: 0.3+Math.random()*0.9,
    drift: (Math.random()-0.5)*0.5,
    alpha: 0.15+Math.random()*0.2
  })
}

function drawBGHearts(ctx, cW, cH){
  bgHearts = bgHearts.filter(h => {
    h.y -= h.speed; h.x += h.drift
    if(h.y < -40) return false
    ctx.save()
    ctx.globalAlpha = h.alpha
    ctx.font = h.size+"px serif"
    ctx.fillText("❤", h.x, h.y)
    ctx.restore()
    return true
  })
}

// ── Particles ──
function spawnParticles(x, y, color, style){
  const count = style === "stars" ? 1 : style === "hearts" ? 0 : 3
  for(let i=0;i<count;i++){
    const a = Math.random()*Math.PI*2, s = 0.6+Math.random()*1.8
    particles.push({ x,y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:20+Math.random()*10, max:30, color })
  }
  if(style === "stars"){
    sparkles.push({ x, y, life:24, max:24, color, size:3+Math.random()*4 })
  }
}

function drawParticles(ctx){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i]
    p.x+=p.vx; p.y+=p.vy; p.vx*=0.93; p.vy*=0.93; p.life--
    if(p.life<=0){particles.splice(i,1);continue}
    ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2)
    ctx.globalAlpha=(p.life/p.max)*0.65
    ctx.fillStyle=p.color; ctx.fill(); ctx.globalAlpha=1
  }
  for(let i=sparkles.length-1;i>=0;i--){
    const s=sparkles[i]; s.life--
    if(s.life<=0){sparkles.splice(i,1);continue}
    const a=(s.life/s.max)*0.9
    drawStar(ctx, s.x, s.y, s.size, a, s.color)
  }
}

function drawStar(ctx, x, y, r, alpha, color){
  ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=color
  ctx.shadowColor=color; ctx.shadowBlur=8
  ctx.beginPath()
  for(let i=0;i<5;i++){
    const a=Math.PI*2/5*i - Math.PI/2
    const b=a+Math.PI/5
    if(i===0) ctx.moveTo(x+Math.cos(a)*r, y+Math.sin(a)*r)
    else ctx.lineTo(x+Math.cos(a)*r, y+Math.sin(a)*r)
    ctx.lineTo(x+Math.cos(b)*r*0.4, y+Math.sin(b)*r*0.4)
  }
  ctx.closePath(); ctx.fill(); ctx.restore()
}

// ── Heart stamp ──
function drawHeartStamp(ctx, x, y, size, color, alpha=0.85){
  ctx.save(); ctx.translate(x,y); ctx.globalAlpha=alpha
  ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=8
  const s=size/2
  ctx.beginPath()
  ctx.moveTo(0,-s*0.5)
  ctx.bezierCurveTo(s*0.8,-s*1.2, s*1.5,-s*0.1, 0,s*1.2)
  ctx.bezierCurveTo(-s*1.5,-s*0.1, -s*0.8,-s*1.2, 0,-s*0.5)
  ctx.fill(); ctx.restore()
}

// ── Watercolor blobs ──
function drawWatercolorDab(ctx, x, y, size, color, alpha){
  ctx.save()
  for(let i=0;i<5;i++){
    const ox=(Math.random()-0.5)*size*0.8
    const oy=(Math.random()-0.5)*size*0.8
    const r=size*0.4+Math.random()*size*0.3
    ctx.beginPath(); ctx.arc(x+ox,y+oy,r,0,Math.PI*2)
    ctx.fillStyle=color
    ctx.globalAlpha=alpha*0.15*(1-i*0.15)
    ctx.fill()
  }
  ctx.restore()
}

// ── Stroke drawing ──
function drawStroke(ctx, stroke){
  if(!stroke||stroke.length<2) return
  const color = stroke._color || window.APP?.currentColor || "#ff2d8f"
  const size  = stroke._size  || window.APP?.brushSize    || 6
  const style = stroke._style || window.APP?.brushStyle   || "smooth"
  const alpha = stroke._alpha ?? window.APP?.opacity ?? 1

  ctx.save()
  ctx.lineCap="round"; ctx.lineJoin="round"

  if(style==="neon"){
    // Multi-layer glow
    ctx.strokeStyle=color; ctx.globalAlpha=alpha*0.15; ctx.lineWidth=size*3.5
    ctx.shadowColor=color; ctx.shadowBlur=30
    _path(ctx,stroke); ctx.stroke()

    ctx.globalAlpha=alpha*0.4; ctx.lineWidth=size*1.8; ctx.shadowBlur=16
    _path(ctx,stroke); ctx.stroke()

    ctx.globalAlpha=alpha; ctx.lineWidth=size*0.7; ctx.strokeStyle="#fff"; ctx.shadowBlur=4
    _path(ctx,stroke); ctx.stroke()

  } else if(style==="chalk"){
    ctx.strokeStyle=color; ctx.shadowBlur=0
    for(let p=0;p<3;p++){
      ctx.globalAlpha=alpha*(0.25+p*0.18)
      ctx.lineWidth=size+(2-p)*1.5
      _pathRough(ctx,stroke,2.5-p); ctx.stroke()
    }

  } else if(style==="watercolor"){
    // Soft translucent layers
    for(let l=0;l<4;l++){
      ctx.strokeStyle=color
      ctx.globalAlpha=alpha*0.12
      ctx.lineWidth=size*(2.5-l*0.4)
      ctx.shadowBlur=0
      _pathRough(ctx,stroke,3); ctx.stroke()
    }
    ctx.globalAlpha=alpha*0.5; ctx.lineWidth=size*0.6
    _path(ctx,stroke); ctx.stroke()

  } else if(style==="hearts"){
    // Hearts along the path
    const step=Math.max(10,size*2.5)
    let dist=0
    for(let i=1;i<stroke.length;i++){
      const dx=stroke[i].x-stroke[i-1].x, dy=stroke[i].y-stroke[i-1].y
      dist+=Math.sqrt(dx*dx+dy*dy)
      if(dist>=step){
        dist=0
        drawHeartStamp(ctx,stroke[i].x,stroke[i].y,size*1.8,color,alpha*0.88)
      }
    }

  } else if(style==="stars"){
    const step=Math.max(12,size*3)
    let dist=0
    for(let i=1;i<stroke.length;i++){
      const dx=stroke[i].x-stroke[i-1].x, dy=stroke[i].y-stroke[i-1].y
      dist+=Math.sqrt(dx*dx+dy*dy)
      if(dist>=step){
        dist=0
        drawStar(ctx,stroke[i].x,stroke[i].y,size*1.4,alpha*0.9,color)
      }
    }

  } else {
    // Smooth default
    ctx.strokeStyle=color; ctx.shadowColor=color; ctx.shadowBlur=10
    ctx.globalAlpha=alpha*0.18; ctx.lineWidth=size+3
    _path(ctx,stroke); ctx.stroke()
    ctx.globalAlpha=alpha; ctx.lineWidth=size; ctx.shadowBlur=8
    _path(ctx,stroke); ctx.stroke()
  }

  ctx.restore()
}

function _path(ctx,stroke){
  ctx.beginPath(); ctx.moveTo(stroke[0].x,stroke[0].y)
  for(let i=1;i<stroke.length-2;i++){
    const xc=(stroke[i].x+stroke[i+1].x)/2, yc=(stroke[i].y+stroke[i+1].y)/2
    ctx.quadraticCurveTo(stroke[i].x,stroke[i].y,xc,yc)
  }
  ctx.lineTo(stroke[stroke.length-1].x,stroke[stroke.length-1].y)
}

function _pathRough(ctx,stroke,j){
  ctx.beginPath(); ctx.moveTo(stroke[0].x+(Math.random()-.5)*j,stroke[0].y+(Math.random()-.5)*j)
  stroke.slice(1).forEach(p=>ctx.lineTo(p.x+(Math.random()-.5)*j,p.y+(Math.random()-.5)*j))
}

// ── Point stabilizer ──
function stabilize(x,y){
  if(lastX!==null) vel=Math.hypot(x-lastX,y-lastY)
  lastX=x; lastY=y
  const sm=vel>12?0.38:0.65
  if(smoothX===null){smoothX=x;smoothY=y}
  else{smoothX+=(x-smoothX)*sm; smoothY+=(y-smoothY)*sm}
  buf.push({x:smoothX,y:smoothY})
  if(buf.length>BUF) buf.shift()
  let ax=0,ay=0
  buf.forEach(p=>{ax+=p.x;ay+=p.y})
  return {x:ax/buf.length, y:ay/buf.length}
}

// ── UI button hit test ──
function checkUI(x,y,pinch){
  const btns=document.querySelectorAll(".panel button, .panel .swatch, .panel input[type=range]")
  let hit=false
  btns.forEach(b=>{
    const r=b.getBoundingClientRect()
    const mx=window.innerWidth-x // mirror
    if(mx>=r.left&&mx<=r.right&&y>=r.top&&y<=r.bottom){
      hit=true
      b.classList.add("hov-hand")
      if(pinch&&Date.now()-lastUIClick>500){ b.click(); lastUIClick=Date.now() }
    } else {
      b.classList.remove("hov-hand")
    }
  })
  return hit
}

// ── Update custom cursor ──
function updateCursor(x,y,pinch){
  const el=document.getElementById("cursor"); if(!el) return
  el.style.left=(window.innerWidth-x)+"px"
  el.style.top=y+"px"
  el.classList.add("visible")
  el.classList.toggle("pinching",pinch)
}

// ══════════════════════════════════════════════════════════
// MAIN ENGINE
// ══════════════════════════════════════════════════════════

let heartTrail=0

export function gestureEngine(results, canvas, ctx, strokes){
  if(window.APP?.replayMode) return

  const app  = window.APP || {}
  const cssW = window.innerWidth
  const cssH = window.innerHeight
  const bg   = (window.APP?.BG_THEMES || {})[app.bgTheme||"dark"] || {r:8,g:0,b:12}

  // Animated background
  pulse+=0.016
  const g=bg.g+Math.sin(pulse)*2
  ctx.fillStyle=`rgb(${bg.r},${g},${bg.b})`
  ctx.fillRect(0,0,canvas.width,canvas.height)

  if(Math.random()<0.022) spawnBGHeart(cssW,cssH)
  drawBGHearts(ctx,cssW,cssH)

  if(!results.multiHandLandmarks||!results.multiHandLandmarks.length){
    drawing=false; lastPinch=false; buf=[]
    const c=document.getElementById("cursor"); if(c) c.classList.remove("visible","pinching")
    strokes.forEach(s=>drawStroke(ctx,s))
    drawParticles(ctx)
    return
  }

  const hand=results.multiHandLandmarks[0]
  const idx=hand[8], thm=hand[4]

  const {x,y}=stabilize(idx.x*cssW, idx.y*cssH)
  smoothX=x; smoothY=y

  // Pinch with hysteresis
  const pd=Math.hypot(idx.x-thm.x,idx.y-thm.y)
  const pinch=lastPinch ? pd<PR : pd<PT

  updateCursor(x,y,pinch)
  const onUI=checkUI(x,y,pinch)

  // Draw logic
  if(!onUI){
    if(pinch){
      if(!lastPinch){
        drawing=true
        currentStroke=Object.assign([],{
          _color: app.currentColor||"#ff2d8f",
          _size:  app.brushSize||6,
          _style: app.brushStyle||"smooth",
          _alpha: app.opacity??1
        })
        strokes.push(currentStroke)
        if(app.redoStack) app.redoStack.length=0
        heartTrail=0
      }
      currentStroke.push({x,y})
      spawnParticles(x,y,app.currentColor||"#ff2d8f",app.brushStyle)
    } else {
      drawing=false
    }
  }

  lastPinch=pinch

  // Render
  strokes.forEach(s=>drawStroke(ctx,s))

  // Cursor glow on canvas
  ctx.beginPath(); ctx.arc(x,y,pinch?7:4,0,Math.PI*2)
  ctx.fillStyle=app.currentColor||"#ff2d8f"
  ctx.shadowColor=app.currentColor||"#ff2d8f"
  ctx.shadowBlur=pinch?20:10
  ctx.fill(); ctx.shadowBlur=0

  drawParticles(ctx)
}
