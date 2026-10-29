(() => {
const K=globalThis.Livelier;
K.toWorld=p=>p.sub(K.world.pan).mul(1/K.world.zoom);
function installEvents(world){
  const pointers=new Map();let drag,hold,ring,pinch,hover;
  const clearHold=()=>{clearTimeout(hold);ring?.remove();ring=null;};
  const morphFor=evt=>{const e=evt.target.closest?.('[data-morph]');return world.withAllSubmorphs().find(m=>m.id===e?.dataset.morph)||world;};
  const invoke=(m,name,evt)=>{try{const run=K.activeRun;K.activeRun=m._run;try{m[name]?.(evt);}finally{K.activeRun=run;}}catch(e){K.reportError(e);}};
  const isUI=evt=>evt.target.closest('input,button,select,textarea,.ace_editor,.tool-view,.halo,.context-menu,.text-content[contenteditable=true]');
  document.addEventListener('pointerdown',evt=>{
    if(evt.target.closest('.halo,.context-menu'))return;
    const m=morphFor(evt);const p=K.pt(evt.clientX,evt.clientY);pointers.set(evt.pointerId,p);world.focus(m);
    if(pointers.size===2){clearHold();drag=null;const [a,b]=[...pointers.values()];pinch={distance:a.distanceTo(b),center:a.add(b).mul(.5),zoom:world.zoom,pan:world.pan};evt.preventDefault();return;}
    if(evt.altKey||evt.metaKey||evt.ctrlKey||world.haloMode){evt.preventDefault();K.showHalo(m);return;}
    if(evt.button!==0)return;
    invoke(m,'onMouseDown',evt);
    if(evt.pointerType==='touch'){
      ring=document.createElement('div');ring.className='hold-ring';ring.style.left=p.x+'px';ring.style.top=p.y+'px';document.body.append(ring);
      hold=setTimeout(()=>{drag=null;clearHold();if(m===world)K.openMenu(world,p);else K.showHalo(m);},500);
    }
    if(isUI(evt)&&!(m instanceof K.Window&&evt.target.closest('.window-title')&&!evt.target.closest('button')))return;
    document.querySelector('.context-menu')?.remove();
    if(m!==world&&(m.draggable||m.grabbable)) {evt.preventDefault();world.undo.begin();drag={m,start:p,position:m.position,parent:m.owner};if(m.grabbable)world.hand.grab(m);}
  });
  document.addEventListener('pointermove',evt=>{
    const p=K.pt(evt.clientX,evt.clientY);if(pointers.has(evt.pointerId))pointers.set(evt.pointerId,p);
    if(pinch&&pointers.size>=2){const [a,b]=[...pointers.values()],center=a.add(b).mul(.5);world.zoom=Math.min(4,Math.max(.25,pinch.zoom*a.distanceTo(b)/(pinch.distance||1)));world.pan=center.sub(pinch.center.sub(pinch.pan).mul(world.zoom/pinch.zoom));world.dirty.add(world);evt.preventDefault();return;}
    const m=morphFor(evt);if(m!==hover){if(hover)invoke(hover,'onHoverOut',evt);invoke(m,'onHoverIn',evt);hover=m;}invoke(m,'onMouseMove',evt);
    if(drag){if(p.distanceTo(drag.start)>8)clearHold();const local=point=>drag.parent.localize(K.toWorld(point));drag.m.position=drag.position.add(local(p).sub(local(drag.start)));invoke(drag.m,'onDrag',evt);}
  },{passive:false});
  document.addEventListener('pointerup',evt=>{clearHold();pointers.delete(evt.pointerId);if(pinch){if(pointers.size<2)pinch=null;return;}const m=morphFor(evt);invoke(m,'onMouseUp',evt);if(drag){if(world.hand.grabbed){const moving=drag.m;moving.visible=false;let hit=world.morphAt(K.toWorld(K.pt(evt.clientX,evt.clientY)));moving.visible=true;while(hit&&!hit.acceptsDrops)hit=hit.owner;world.hand.drop(hit||world);}world.undo.commit();drag=null;}});
  document.addEventListener('pointercancel',()=>{clearHold();pointers.clear();pinch=null;drag=null;});
  document.addEventListener('contextmenu',evt=>{if(isUI(evt))return;evt.preventDefault();K.openMenu(morphFor(evt),K.pt(evt.clientX,evt.clientY));});
  document.addEventListener('wheel',evt=>invoke(morphFor(evt),'onWheel',evt),{passive:true});
  document.addEventListener('keydown',evt=>{if(!isUI(evt)&&(evt.ctrlKey||evt.metaKey)&&evt.key.toLowerCase()==='z'){evt.preventDefault();evt.shiftKey?world.undo.redo():world.undo.undo();return;}if(evt.key==='Escape'){K.hideHalo();document.querySelector('.context-menu')?.remove();}if(!isUI(evt))invoke(world.focusedMorph||world,'onKeyDown',evt);});
  document.addEventListener('keyup',evt=>{if(!isUI(evt))invoke(world.focusedMorph||world,'onKeyUp',evt);});
  globalThis.visualViewport?.addEventListener('resize',()=>{const m=world.focusedMorph;if(m instanceof K.Text)m._element?.scrollIntoView({block:'nearest'});});
}
K.installEvents=installEvents;
})();
