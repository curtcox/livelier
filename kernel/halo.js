(() => {
const K=globalThis.Livelier;
let halo,target;
function hideHalo(){halo?.remove();halo=null;target=null;}
function showHalo(morph){hideHalo();if(morph===K.world){K.openMenu(morph);return;}target=morph;halo=document.createElement('div');halo.className='halo';halo.dataset.target=morph.id;
  const name=document.createElement('input');name.value=morph.name;name.className='halo-name';name.setAttribute('aria-label','Morph name');name.onchange=()=>K.world.undo.transaction(()=>morph.name=name.value);halo.append(name);
  const handles=[['move','↔','Move'],['resize','↘','Resize'],['rotate','↻','Rotate'],['scale','⤢','Scale'],['grab','✥','Grab and reparent'],['duplicate','⧉','Duplicate'],['delete','×','Delete'],['style','◉','Edit style'],['inspect','i','Inspect'],['scripts','ƒ','Edit scripts'],['menu','⋯','Morph menu']];
  for(const [action,label,title]of handles){const button=document.createElement('button');button.textContent=label;button.title=title;button.setAttribute('aria-label',title);button.dataset.action=action;button.onpointerdown=evt=>{evt.stopPropagation();if(['move','resize','rotate','scale','grab'].includes(action))beginHandle(evt,morph,action);};button.onclick=()=>{if(action==='duplicate'){K.world.undo.transaction(()=>morph.owner.addMorph(morph.duplicate()));}if(action==='delete'){K.world.undo.transaction(()=>morph.remove());hideHalo();}if(action==='style')K.openStyleEditor(morph);if(action==='inspect')K.inspect(morph);if(action==='scripts')K.openObjectEditor(morph);if(action==='menu')K.openMenu(morph);};halo.append(button);}
  if(morph._run){const keep=document.createElement('button');keep.textContent='Keep in world';keep.title='Made by the main script. Changes reset on the next run.';keep.onclick=()=>{morph.keep();showHalo(morph);};halo.append(keep);}
  document.body.append(halo);updateHalo();
}
function updateHalo(){if(!target||!halo)return;if(!target.world){hideHalo();return;}const box=target._element?.getBoundingClientRect();if(!box)return;const left=Math.max(4,Math.min(innerWidth-50,box.left));halo.style.left=left+'px';halo.style.top=Math.max(38,Math.min(innerHeight-45,box.top))+'px';halo.style.width=Math.max(120,Math.min(innerWidth-left-8,box.width))+'px';halo.style.height=Math.max(40,box.height)+'px';}
function beginHandle(evt,morph,action){evt.preventDefault();evt.stopPropagation();K.world.undo.begin();const start=K.pt(evt.clientX,evt.clientY),pos=morph.position,extent=morph.extent,rotation=morph.rotation,scale=morph.scale;const parent=morph.owner;const local=p=>parent?.localize(p.sub(K.world.pan).mul(1/K.world.zoom))||p;if(action==='grab')K.world.hand.grab(morph);
  const move=e=>{const p=K.pt(e.clientX,e.clientY),delta=local(p).sub(local(start));if(action==='move'||action==='grab')morph.position=pos.add(delta);if(action==='resize')morph.extent=K.pt(Math.max(20,extent.x+delta.x/scale),Math.max(20,extent.y+delta.y/scale));if(action==='rotate')morph.rotation=rotation+(p.x-start.x)/100;if(action==='scale')morph.scale=Math.max(.1,scale+(p.x-start.x)/200);};
  const up=e=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);if(action==='grab'){let drop=K.world.morphAt(K.toWorld(K.pt(e.clientX,e.clientY)));if(morph.withAllSubmorphs().includes(drop)){const hidden=morph.visible;morph.visible=false;drop=K.world.morphAt(K.toWorld(K.pt(e.clientX,e.clientY)));morph.visible=hidden;}while(drop&&!drop.acceptsDrops)drop=drop.owner;K.world.hand.drop(drop||K.world);}K.world.undo.commit();};
  document.addEventListener('pointermove',move);document.addEventListener('pointerup',up,{once:true});
}
Object.assign(K,{showHalo,hideHalo,updateHalo,beginHandle});
})();
