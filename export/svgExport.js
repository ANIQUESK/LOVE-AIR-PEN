export function exportSVG(strokes){

if(!strokes || strokes.length === 0){

alert("Nothing to export")
return

}

const width = window.innerWidth
const height = window.innerHeight

let svgContent = `<?xml version="1.0" encoding="UTF-8"?>`
svgContent += `<svg xmlns="http://www.w3.org/2000/svg" `
svgContent += `width="${width}" height="${height}" `
svgContent += `viewBox="0 0 ${width} ${height}">`

// background
svgContent += `<rect width="100%" height="100%" fill="black"/>`


// draw strokes

strokes.forEach(stroke=>{

if(stroke.length < 2) return

let path = `M ${stroke[0].x} ${stroke[0].y}`

for(let i=1;i<stroke.length;i++){

path += ` L ${stroke[i].x} ${stroke[i].y}`

}

svgContent += `
<path
d="${path}"
stroke="${window.currentColor || "#ff2d8f"}"
stroke-width="${window.brushSize || 6}"
stroke-linecap="round"
stroke-linejoin="round"
fill="none"
/>
`

})

svgContent += `</svg>`


// create download

const blob = new Blob([svgContent], {type:"image/svg+xml"})

const url = URL.createObjectURL(blob)

const link = document.createElement("a")

link.href = url
link.download = "love-air-pen.svg"

document.body.appendChild(link)

link.click()

document.body.removeChild(link)

URL.revokeObjectURL(url)

}