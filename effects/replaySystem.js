export async function replayDrawing(canvas, ctx, strokes){

if(!strokes || strokes.length === 0){

alert("Nothing to replay")
return

}

// stop current drawing engine temporarily
window.replayMode = true

ctx.clearRect(0,0,canvas.width,canvas.height)

ctx.lineCap = "round"
ctx.lineJoin = "round"

ctx.strokeStyle = window.currentColor || "#ff2d8f"
ctx.lineWidth = window.brushSize || 6

for(const stroke of strokes){

await animateStroke(ctx,stroke)

}

// enable drawing again
window.replayMode = false

}


function animateStroke(ctx,stroke){

return new Promise(resolve=>{

let i = 0

function step(){

if(i >= stroke.length-1){

resolve()
return

}

ctx.beginPath()

ctx.moveTo(
stroke[i].x,
stroke[i].y
)

ctx.lineTo(
stroke[i+1].x,
stroke[i+1].y
)

ctx.stroke()

i++

requestAnimationFrame(step)

}

step()

})

}