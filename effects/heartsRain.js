export function heartsRain(canvas){

const ctx = canvas.getContext("2d")

const hearts = []

const heartCount = 160
const duration = 7000   // 7 seconds

const startTime = Date.now()


for(let i=0;i<heartCount;i++){

hearts.push({

x: Math.random()*canvas.width,
y: -Math.random()*canvas.height,
size: 8 + Math.random()*14,
speed: 0.8 + Math.random()*1.6,
drift: (Math.random()-0.5)*0.7,
opacity: 0.25 + Math.random()*0.35

})

}



function drawHeart(x,y,size,opacity){

ctx.save()

ctx.translate(x,y)

ctx.globalAlpha = opacity

ctx.fillStyle = "#ff2d8f"

ctx.shadowBlur = 8
ctx.shadowColor = "#ff6fa8"

ctx.beginPath()

ctx.moveTo(0,-size/2)

ctx.bezierCurveTo(size/2,-size,size,-size/4,0,size)

ctx.bezierCurveTo(-size,-size/4,-size/2,-size,0,-size/2)

ctx.fill()

ctx.restore()

}



function animate(){

const elapsed = Date.now() - startTime

hearts.forEach(h=>{

h.y += h.speed
h.x += h.drift

// reset heart when it goes off screen
if(h.y > canvas.height + 40){

h.y = -20
h.x = Math.random()*canvas.width

}

drawHeart(h.x,h.y,h.size,h.opacity)

})


if(elapsed < duration){

requestAnimationFrame(animate)

}

}

animate()

}