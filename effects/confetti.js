// effects/confetti.js
export function confettiBurst(canvas, ctx){
  const pieces = []
  const COLORS = ["#ff2d8f","#ff9fc8","#ffcc30","#30b8ff","#c030ff","#30e86e","#fff","#ff6030"]
  const cx = window.innerWidth/2, cy = window.innerHeight*0.4

  for(let i=0;i<180;i++){
    const angle = (Math.random()*Math.PI*2)
    const speed = 4+Math.random()*10
    pieces.push({
      x:cx, y:cy,
      vx: Math.cos(angle)*speed*(0.4+Math.random()),
      vy: Math.sin(angle)*speed*(0.4+Math.random())-6,
      w: 6+Math.random()*10,
      h: 3+Math.random()*6,
      rot: Math.random()*Math.PI*2,
      rotV: (Math.random()-.5)*0.25,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      life: 100+Math.random()*80,
      max: 180,
      shape: Math.random()<0.3?"circle":"rect"
    })
  }

  const end=Date.now()+6000

  function draw(){
    if(Date.now()>end && pieces.length===0) return
    for(let i=pieces.length-1;i>=0;i--){
      const p=pieces[i]
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.25; p.vx*=0.99
      p.rot+=p.rotV; p.life--
      if(p.life<=0||p.y>window.innerHeight+30){pieces.splice(i,1);continue}

      const a=Math.min(1,(p.life/p.max)*1.8)
      ctx.save()
      ctx.translate(p.x,p.y); ctx.rotate(p.rot)
      ctx.fillStyle=p.color; ctx.globalAlpha=a

      if(p.shape==="circle"){
        ctx.beginPath(); ctx.ellipse(0,0,p.w/2,p.h/2,0,0,Math.PI*2); ctx.fill()
      } else {
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h)
      }
      ctx.restore()
    }
    requestAnimationFrame(draw)
  }
  draw()
}
