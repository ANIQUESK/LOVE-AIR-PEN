// effects/fireworks.js
export function fireworks(canvas, ctx){
  const particles = []
  const COLORS = ["#ff2d8f","#ff9fc8","#ffcc30","#30b8ff","#c030ff","#30e86e","#fff"]

  function burst(x, y){
    const color = COLORS[Math.floor(Math.random()*COLORS.length)]
    for(let i=0;i<60;i++){
      const angle = (i/60)*Math.PI*2
      const speed = 2+Math.random()*5
      particles.push({
        x,y,
        vx: Math.cos(angle)*speed*(0.5+Math.random()),
        vy: Math.sin(angle)*speed*(0.5+Math.random()),
        life: 60+Math.random()*40,
        max:  100,
        color,
        size: 1.5+Math.random()*2.5,
        tail: []
      })
    }
    // Heart burst
    const hColor=["#ff2d8f","#ff7ac0"][Math.floor(Math.random()*2)]
    for(let i=0;i<12;i++){
      const a=(i/12)*Math.PI*2
      particles.push({
        x,y, vx:Math.cos(a)*3, vy:Math.sin(a)*3,
        life:80, max:80, color:hColor, size:5, heart:true, tail:[]
      })
    }
  }

  // Launch 5 fireworks at staggered positions
  const launches = [
    [window.innerWidth*0.2, window.innerHeight*0.35],
    [window.innerWidth*0.5, window.innerHeight*0.25],
    [window.innerWidth*0.8, window.innerHeight*0.35],
    [window.innerWidth*0.35,window.innerHeight*0.45],
    [window.innerWidth*0.65,window.innerHeight*0.30],
  ]
  launches.forEach((pos,i)=>setTimeout(()=>burst(pos[0],pos[1]),i*250))

  const end=Date.now()+5000

  function draw(){
    if(Date.now()>end && particles.length===0) return

    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i]
      p.tail.unshift({x:p.x,y:p.y})
      if(p.tail.length>6) p.tail.pop()
      p.x+=p.vx; p.y+=p.vy
      p.vx*=0.97; p.vy*=0.97; p.vy+=0.08
      p.life--
      if(p.life<=0){particles.splice(i,1);continue}

      const a=p.life/p.max
      if(p.heart){
        ctx.save(); ctx.translate(p.x,p.y)
        ctx.fillStyle=p.color; ctx.globalAlpha=a*0.9
        ctx.shadowColor=p.color; ctx.shadowBlur=10
        const s=p.size/2
        ctx.beginPath()
        ctx.moveTo(0,-s*0.5)
        ctx.bezierCurveTo(s*0.8,-s*1.2,s*1.5,-s*0.1,0,s*1.2)
        ctx.bezierCurveTo(-s*1.5,-s*0.1,-s*0.8,-s*1.2,0,-s*0.5)
        ctx.fill(); ctx.restore()
      } else {
        p.tail.forEach((pt,ti)=>{
          const ta=a*(1-ti/p.tail.length)*0.7
          ctx.beginPath(); ctx.arc(pt.x,pt.y,p.size*(1-ti*0.15),0,Math.PI*2)
          ctx.fillStyle=p.color; ctx.globalAlpha=ta
          ctx.shadowColor=p.color; ctx.shadowBlur=6
          ctx.fill()
        })
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
        ctx.fillStyle=p.color; ctx.globalAlpha=a
        ctx.shadowColor=p.color; ctx.shadowBlur=12
        ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=1
      }
    }
    requestAnimationFrame(draw)
  }
  draw()
}
