// ===============================
// STATE
// ===============================

let drawing = false
let currentStroke = []

let smoothX = null
let smoothY = null

let lastPinch = false
const pinchThreshold = 0.05

// smoothing buffer
let buffer = []
const bufferSize = 6

// neon board pulse
let pulse = 0

// background hearts
let bgHearts = []

// sparkle particles
let particles = []

// replay protection
window.replayMode = false

// UI click protection
let lastUIClick = 0
const uiClickCooldown = 600 // ms



// ===============================
// HEART SPAWN
// ===============================

function spawnBGHeart(canvas){

bgHearts.push({
x: Math.random()*canvas.width,
y: canvas.height + 20,
size: 12 + Math.random()*12,
speed: 0.5 + Math.random()*1.2,
alpha: 0.4
})

}



// ===============================
// DRAW HEARTS
// ===============================

function drawBGHearts(ctx){

for(let i = bgHearts.length-1;i>=0;i--){

let h = bgHearts[i]

ctx.font = h.size + "px Arial"
ctx.fillStyle = "rgba(255,80,150,"+h.alpha+")"

ctx.fillText("❤",h.x,h.y)

h.y -= h.speed

if(h.y < -30){
bgHearts.splice(i,1)
}

}

}



// ===============================
// PARTICLE EFFECT
// ===============================

function spawnParticles(x,y){

for(let i=0;i<2;i++){

particles.push({
x:x,
y:y,
vx:(Math.random()-0.5)*2,
vy:(Math.random()-0.5)*2,
life:20
})

}

}


function drawParticles(ctx){

for(let i=particles.length-1;i>=0;i--){

const p = particles[i]

p.x += p.vx
p.y += p.vy
p.life--

ctx.beginPath()
ctx.arc(p.x,p.y,2,0,Math.PI*2)

ctx.fillStyle="rgba(255,120,180,"+(p.life/30)+")"
ctx.fill()

if(p.life<=0){
particles.splice(i,1)
}

}

}



// ===============================
// STROKE DRAWING
// ===============================

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

// glow layer
ctx.lineWidth = (window.brushSize || 6) + 3
ctx.globalAlpha = 0.25
ctx.stroke()

// main stroke
ctx.lineWidth = window.brushSize || 6
ctx.globalAlpha = 1
ctx.stroke()

}



// ===============================
// POINT STABILIZATION
// ===============================

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



// ===============================
// UI BUTTON INTERACTION
// ===============================

function checkUIButtonClick(x, y, isPinching){

const buttons = document.querySelectorAll(".panel button")
let hoveringAny = false

buttons.forEach(btn => {

const rect = btn.getBoundingClientRect()

const inside =
x >= rect.left &&
x <= rect.right &&
y >= rect.top &&
y <= rect.bottom

if(inside){

hoveringAny = true
btn.classList.add("active")

// click with pinch
if(isPinching && Date.now() - lastUIClick > uiClickCooldown){

btn.click()
lastUIClick = Date.now()

}

}else{

btn.classList.remove("active")

}

})

return hoveringAny

}



// ===============================
// MAIN ENGINE
// ===============================

export function gestureEngine(results, canvas, ctx, strokes){

if(window.replayMode) return


// animated board glow

pulse += 0.02

let base = 20
let glow = base + Math.sin(pulse)*3

ctx.fillStyle = "rgb("+glow+",0,"+glow+")"
ctx.fillRect(0,0,canvas.width,canvas.height)


// spawn hearts occasionally

if(Math.random() < 0.02){
spawnBGHeart(canvas)
}

drawBGHearts(ctx)


// no hand detected

if(!results.multiHandLandmarks || results.multiHandLandmarks.length===0){

drawing=false
lastPinch=false
buffer=[]

return

}


const hand = results.multiHandLandmarks[0]

const index = hand[8]
const thumb = hand[4]


// convert coordinates

let x = index.x * canvas.width
let y = index.y * canvas.height


// smoothing

const stabilized = stabilizePoint(x,y)

smoothX = stabilized.x
smoothY = stabilized.y


// brush style

ctx.strokeStyle = window.currentColor || "#ff2d8f"
ctx.lineWidth = window.brushSize || 6

ctx.lineCap = "round"
ctx.lineJoin = "round"

ctx.shadowColor = ctx.strokeStyle
ctx.shadowBlur = 12


// cursor glow

ctx.beginPath()
ctx.arc(smoothX, smoothY, 4, 0, Math.PI*2)

ctx.fillStyle = ctx.strokeStyle
ctx.shadowBlur = 10
ctx.fill()


// particles

spawnParticles(smoothX,smoothY)
drawParticles(ctx)


// pinch detection

const pinch = Math.hypot(
index.x - thumb.x,
index.y - thumb.y
)

const isPinching = pinch < pinchThreshold


// ===============================
// UI INTERACTION
// ===============================

const hoveringUI = checkUIButtonClick(smoothX, smoothY, isPinching)


// ===============================
// DRAWING LOGIC
// ===============================

if(!hoveringUI){

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

}

lastPinch = isPinching


// render strokes

strokes.forEach(stroke=>{
drawStroke(ctx,stroke)
})

}