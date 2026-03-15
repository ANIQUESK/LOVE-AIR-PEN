export function exportPDF(canvas){

if(!canvas){

alert("Canvas not available")
return

}

// convert canvas to image
const imgData = canvas.toDataURL("image/png")

// load jsPDF dynamically if not loaded
if(typeof window.jspdf === "undefined"){

const script = document.createElement("script")

script.src =
"https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"

script.onload = () => createPDF(imgData,canvas)

document.body.appendChild(script)

}else{

createPDF(imgData,canvas)

}

}



function createPDF(imgData,canvas){

const { jsPDF } = window.jspdf

// create pdf
const pdf = new jsPDF({

orientation:"landscape",
unit:"px",
format:[canvas.width,canvas.height]

})

// add canvas image
pdf.addImage(

imgData,
"PNG",
0,
0,
canvas.width,
canvas.height

)

// save file
pdf.save("love-air-pen.pdf")

}