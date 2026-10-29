(() => {
function download(content,name,type='text/plain'){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
async function svgToPNG(svg){const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('The SVG could not be rasterized.'));img.src=url;});const canvas=document.createElement('canvas');canvas.width=img.naturalWidth||1000;canvas.height=img.naturalHeight||800;canvas.getContext('2d').drawImage(img,0,0);return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG export failed.')),'image/png'));}finally{URL.revokeObjectURL(url);}}
globalThis.Exports={download,svgToPNG};
})();
