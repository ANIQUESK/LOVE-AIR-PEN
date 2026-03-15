export function exportPDF(canvas){

const img=canvas.toDataURL("image/png")

const win=window.open("")

win.document.write(`
<img src="${img}" style="width:100%">
<script>window.print()</script>
`)

}