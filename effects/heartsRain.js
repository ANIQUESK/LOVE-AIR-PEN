// effects/heartsRain.js
export function heartsRain(canvas, ctx){
  const hearts=[]
  const COLORS=["#ff2d8f","#ff7ac0","#ff4b4b","#c030ff","#ff9fc8"]
  for(let i=0;i<140;i++) hearts.push({
    x:Math.random()*window.innerWidth,
    y:-Math.random()*window.innerHeight,
    size:6+Math.random()*18,
    speed:0.6+Math.random()*2,
    drift:(Math.random()-.5)*0.9,
    alpha:0.3+Math.random()*0.5,
    color:COLORS[Math.floor(Math.random()*COLORS.length)],
    rot:Math.random()*Math.PI*2,
    rotSpeed:(Math.random()-.5)*0.05
  })
  const end=Date.now()+7000
  function draw(){
    if(Date.now()>end) return
    hearts.forEach(h=>{
      h.y+=h.speed; h.x+=h.drift; h.rot+=h.rotSpeed
      if(h.y>window.innerHeight+40){h.y=-20;h.x=Math.random()*window.innerWidth}
      ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(h.rot)
      ctx.globalAlpha=h.alpha; ctx.fillStyle=h.color
      ctx.shadowColor=h.color; ctx.shadowBlur=8
      const s=h.size/2
      ctx.beginPath()
      ctx.moveTo(0,-s*0.5)
      ctx.bezierCurveTo(s*0.8,-s*1.2,s*1.5,-s*0.1,0,s*1.2)
      ctx.bezierCurveTo(-s*1.5,-s*0.1,-s*0.8,-s*1.2,0,-s*0.5)
      ctx.fill(); ctx.restore()
    })
    requestAnimationFrame(draw)
  }
  draw()
}
