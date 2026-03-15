let drawing = false
let currentStroke = []

let smoothX = null
let smoothY = null

let lastPinch = false

const pinchThreshold = 0.05

// stabilizer buffer
let buffer = []
const bufferSize = 6

// board animation
let pulse = 0

// background hearts
let bgHearts = []


// ---------- SPAWN HEART ----------

function spawnBGHeart(canvas){

bgHearts.push({

x: Math.random()*canvas.width,
y: canvas.height + 20,
size: 10 + Math.random()*10,
speed: 0.5 + Math.random()*1,
alpha: 0.4

})

}


// ---------- DRAW BACKGROUND HEARTS ----------

function drawBGHearts(ctx){

for(let i = bgHearts.length-1;i>=0;i--){

let h = bgHearts[i]

ctx.font = h.size + "px Arial"
ctx.fillStyle = "rgba(255,80,150,"+h.alpha+")"

ctx.fillText("❤",h.x,h.y)

h.y -= h.speed

if(h.y < -20){
bgHearts.splice(i,1)
}

}

}


// ---------- DRAW SMOOTH CURVE ----------

function drawStroke(ctx, stroke){

if(stroke.length < 2) return

ctx.beginPath()
ctx.moveTo(stroke[0].x, stroke[0].y)

for(let i=1;i<stroke.length-2;i++){

const xc = (stroke[i].x + stroke[i+1].x)/2
const yc = (stroke[i].y + stroke[i+1].y)/2

ctx.quadraticCurveTo(
stroke[i].x,
stroke[i].y,
xc,
yc
)

}

ctx.stroke()

}


// ---------- STABILIZER ----------

function stabilizePoint(x,y){

buffer.push({x,y})

if(buffer.length > bufferSize){
buffer.shift()
}

let avgX = 0
let avgY = 0

buffer.forEach(p=>{
avgX += p.x
avgY += p.y
})

avgX /= buffer.length
avgY /= buffer.length

return {x:avgX,y:avgY}

}


// ---------- MAIN ENGINE ----------

export function gestureEngine(results, canvas, ctx, strokes){

// animate board glow

pulse += 0.02

let base = 26
let glow = base + Math.sin(pulse)*4

ctx.fillStyle = "rgb("+glow+",0,"+glow+")"
ctx.fillRect(0,0,canvas.width,canvas.height)


// spawn background hearts slowly

if(Math.random() < 0.02){
spawnBGHeart(canvas)
}

drawBGHearts(ctx)


if(!results.multiHandLandmarks || results.multiHandLandmarks.length===0){

drawing=false
lastPinch=false
buffer=[]
return

}

const hand = results.multiHandLandmarks[0]

const index = hand[8]
const thumb = hand[4]

// convert coords

let x = index.x * canvas.width
let y = index.y * canvas.height


// stabilize movement

const stabilized = stabilizePoint(x,y)

smoothX = stabilized.x
smoothY = stabilized.y


// brush style

ctx.strokeStyle = "#ff2d8f"
ctx.lineWidth = window.brushSize || 6

ctx.lineCap = "round"
ctx.lineJoin = "round"

ctx.shadowColor = "#ff2d8f"
ctx.shadowBlur = 35


// cursor

ctx.beginPath()
ctx.arc(smoothX, smoothY, 5, 0, Math.PI*2)

ctx.fillStyle = "#ff2d8f"
ctx.shadowColor = "#ff2d8f"
ctx.shadowBlur = 40

ctx.fill()


// pinch detection

const pinch = Math.hypot(
index.x - thumb.x,
index.y - thumb.y
)

const isPinching = pinch < pinchThreshold


// draw strokes

if(isPinching){

if(!lastPinch){

drawing = true
currentStroke = []
strokes.push(currentStroke)

}

currentStroke.push({
x:smoothX,
y:smoothY
})

}else{

drawing=false

}

lastPinch = isPinching


// render strokes

strokes.forEach(stroke=>{
drawStroke(ctx,stroke)
})

}