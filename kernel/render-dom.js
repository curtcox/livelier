(() => {
const K=globalThis.Livelier;
const svgNS='http://www.w3.org/2000/svg';
function textNode(tag,content){const e=document.createElement(tag);e.textContent=content;return e;}
class DOMRenderer {
  constructor(world,host){this.world=world;this.host=host;this.nodes=new Map();this.world.dirty=new Set(world.withAllSubmorphs());}
  create(m){
    const e=document.createElement('div');e.className='morph '+m.constructor.name.toLowerCase();e.dataset.morph=m.id;e.tabIndex=-1;
    this.nodes.set(m,e);m._element=e;
    if(m instanceof K.Ellipse||m instanceof K.Path){const svg=document.createElementNS(svgNS,'svg');const shape=document.createElementNS(svgNS,m instanceof K.Ellipse?'ellipse':'path');svg.append(shape);e.append(svg);m._shape=shape;}
    else if(m instanceof K.Image){const img=document.createElement('img');img.alt=m.name;img.draggable=false;e.append(img);m._image=img;}
    else if(m instanceof K.Button){e.classList.add('button-control');const button=textNode('button',m.text);button.type='button';button.addEventListener('click',evt=>{if(evt.detail===0){try{m.onMouseUp(evt);}catch(e){K.reportError(e);}}});e.append(button);m._content=button;}
    else if(m instanceof K.Slider){const input=document.createElement('input');input.type='range';input.setAttribute('aria-label',m.name);input.onpointerdown=()=>K.world.undo.begin();input.onchange=()=>K.world.undo.commit();input.oninput=()=>{m.value=Number(input.value);};e.append(input);m._input=input;}
    else if(m instanceof K.List){const select=document.createElement('select');select.size=6;select.setAttribute('aria-label',m.name);select.onchange=()=>m.selection=select.selectedIndex;e.append(select);m._select=select;}
    else if(m instanceof K.CanvasMorph){const canvas=document.createElement('canvas');e.append(canvas);m._canvas=canvas;}
    else if(m instanceof K.HTMLMorph){const content=document.createElement('div');content.className='html-content';e.append(content);m._html=content;}
    else if(m instanceof K.Text){const content=document.createElement('div');content.className='text-content';content.setAttribute('role','textbox');content.setAttribute('aria-label',m.name);content.onfocus=()=>{K.world.focus(m);m._editBefore=m.text;};content.onblur=()=>{if(m._editBefore!==m.text){const after=m.text;m.text=m._editBefore;K.world.undo.transaction(()=>m.text=after);}};content.oninput=()=>m.text=content.textContent;content.onpaste=evt=>{evt.preventDefault();const value=evt.clipboardData.getData('text/plain');const selection=getSelection();if(selection.rangeCount){const range=selection.getRangeAt(0);range.deleteContents();const text=document.createTextNode(value);range.insertNode(text);range.setStartAfter(text);range.collapse(true);selection.removeAllRanges();selection.addRange(range);m.text=content.textContent;}};e.append(content);m._content=content;}
    else if(m instanceof K.Window){const title=document.createElement('header');title.className='window-title';const label=textNode('span',m.title);const minimize=textNode('button','−');minimize.title='Minimize';minimize.onclick=()=>m.minimized=!m.minimized;const close=textNode('button','×');close.title='Close';close.onclick=()=>m.remove();title.append(label,minimize,close);e.append(title);m._title=label;
      const resize=textNode('button','◢');resize.className='window-resize';resize.title='Resize window';resize.onpointerdown=evt=>K.beginHandle?.(evt,m,'resize');e.append(resize);
    }
    return e;
  }
  update(m,e){
    const p=m.position,o=m.origin;const style=e.style;
    Object.assign(style,{left:p.x+'px',top:p.y+'px',width:Math.max(1,m.extent.x)+'px',height:(m.minimized?34:Math.max(1,m.extent.y))+'px',transformOrigin:`${o.x}px ${o.y}px`,transform:`rotate(${m.rotation}rad) scale(${m.scale})`,background:m instanceof K.Ellipse||m instanceof K.Path?'transparent':m.fill,border:`${m.borderWidth}px ${m.borderStyle} ${m.borderColor}`,borderRadius:m.borderRadius+'px',opacity:m.opacity,display:m.visible?'':'none',overflow:m.clip||m.minimized?'hidden':'visible',boxShadow:m.shadow,color:m.fontColor,fontSize:m.fontSize+'px',fontFamily:m.fontFamily,textAlign:m.textAlign,pointerEvents:m.reactsToPointer?'auto':'none'});
    if(m===this.world){Object.assign(style,{left:'0',top:'0',width:'100%',height:'100%',transform:`translate(${m.pan.x}px,${m.pan.y}px) scale(${m.zoom})`,transformOrigin:'0 0',background:'transparent',pointerEvents:'auto'});this.host.style.background=m.fill;}
    if(m._shape){const s=m._shape,svg=s.parentNode;svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.setAttribute('viewBox',`0 0 ${m.extent.x} ${m.extent.y}`);s.setAttribute('fill',m.fill);s.setAttribute('stroke',m instanceof K.Path?m.stroke:m.borderColor);s.setAttribute('stroke-width',m instanceof K.Path?m.strokeWidth:m.borderWidth);if(m instanceof K.Ellipse){for(const [k,v]of Object.entries({cx:m.extent.x/2,cy:m.extent.y/2,rx:m.extent.x/2,ry:m.extent.y/2}))s.setAttribute(k,v);}else s.setAttribute('d',m.vertices.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ')+(m.closed?' Z':''));}
    if(m._image){if(!/^(https:\/\/|data:image\/(?:png|jpeg|gif|webp|svg\+xml)[;,])/.test(m.url)){m._image.removeAttribute('src');}else if(m._image.getAttribute('src')!==m.url)m._image.src=m.url;}
    if(m._content){if(document.activeElement!==m._content&&m._content.textContent!==m.text)m._content.textContent=m.text;if(m instanceof K.Text)m._content.contentEditable=String(m.editable);}
    if(m._input){Object.assign(m._input,{min:m.min,max:m.max,value:m.value});}
    if(m._select){if(m._select.dataset.items!==JSON.stringify(m.items)){m._select.replaceChildren(...m.items.map(item=>textNode('option',typeof item==='object'?JSON.stringify(item):String(item))));m._select.dataset.items=JSON.stringify(m.items);}m._select.selectedIndex=m.selection;}
    if(m._html&&m._html._source!==m.html){m._html.innerHTML=m.html;m._html._source=m.html;}
    if(m._canvas){if(m._canvas.width!==m.extent.x||m._canvas.height!==m.extent.y){m._canvas.width=m.extent.x;m._canvas.height=m.extent.y;}if(m._draw)try{m._draw.call(m,m.context);}catch(e){K.reportError(e);}}
    if(m._title)m._title.textContent=m.title;
  }
  render(){const live=new Set(this.world.withAllSubmorphs());for(const [m,e]of this.nodes)if(!live.has(m)){e.remove();this.nodes.delete(m);}for(const m of live){let e=this.nodes.get(m);const fresh=!e;if(!e)e=this.create(m);const parent=m.owner?this.nodes.get(m.owner):this.host;if(e.parentNode!==parent)parent.append(e);if(fresh||this.world.dirty.has(m))this.update(m,e);if(m._toolView&&m._toolView.parentNode!==e)e.append(m._toolView);const children=m.submorphs.map(child=>this.nodes.get(child)).filter(Boolean),actual=[...e.children].filter(node=>node.dataset.morph);if(children.length!==actual.length||children.some((node,i)=>node!==actual[i]))for(const node of children)e.append(node);}
    this.world.dirty.clear();K.updateHalo?.();}
}
Object.assign(K,{DOMRenderer,textNode});
})();
