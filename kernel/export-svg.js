(() => {
const K=globalThis.Livelier;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function exportSVG(world){
  const draw=m=>{if(!m.visible||m._tool)return '';const w=m.extent.x,h=m.extent.y;
    let shape='';const attrs=`fill="${esc(m.fill)}" stroke="${esc(m.borderColor)}" stroke-width="${m.borderWidth}"`;
    if(m instanceof K.Ellipse)shape=`<ellipse cx="${w/2}" cy="${h/2}" rx="${w/2}" ry="${h/2}" ${attrs}/>`;
    else if(m instanceof K.Path)shape=`<path d="${m.vertices.map((p,i)=>(i?'L':'M')+Number(p.x)+' '+Number(p.y)).join(' ')}${m.closed?' Z':''}" fill="${esc(m.fill)}" stroke="${esc(m.stroke)}" stroke-width="${Number(m.strokeWidth)}"/>`;
    else if(m instanceof K.Image&&/^(https:\/\/|data:image\/)/.test(m.url))shape=`<image width="${w}" height="${h}" href="${esc(m.url)}"/>`;
    else if(m instanceof K.CanvasMorph&&m._canvas){try{shape=`<image width="${w}" height="${h}" href="${m._canvas.toDataURL()}"/>`;}catch(_){shape=`<rect width="${w}" height="${h}" ${attrs}/>`;}}
    else shape=`<rect width="${w}" height="${h}" rx="${m.borderRadius}" ${attrs}/>`;
    if(m instanceof K.Slider)shape+=`<path d="M 8 ${h/2} H ${w-8}" stroke="#a9b9ae" stroke-width="4"/><circle cx="${8+(w-16)*(m.value-m.min)/(m.max-m.min||1)}" cy="${h/2}" r="8" fill="#34765f"/>`;
    const lines=m instanceof K.List?m.items.map(String):String(m instanceof K.Window?m.title:m.text).split('\n');
    shape+=lines.map((line,i)=>`<text x="${m.textAlign==='center'?w/2:8}" y="${m.fontSize*(i+1)+4}" font-family="${esc(m.fontFamily)}" font-size="${m.fontSize}" text-anchor="${m.textAlign==='center'?'middle':'start'}" fill="${esc(m.fontColor)}">${esc(line)}</text>`).join('');
    const t=m.transform;return `<g transform="matrix(${t.a} ${t.b} ${t.c} ${t.d} ${t.e} ${t.f})" opacity="${m.opacity}">${shape}${m.submorphs.map(draw).join('')}</g>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${world.extent.x}" height="${world.extent.y}" viewBox="0 0 ${world.extent.x} ${world.extent.y}"><rect width="100%" height="100%" fill="${esc(world.fill)}"/>${world.submorphs.map(draw).join('')}</svg>`;
}
K.exportSVG=exportSVG;if(typeof module!=='undefined')module.exports=K;
})();
