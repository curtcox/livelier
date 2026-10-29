(() => {
const K=globalThis.Livelier;
function openTool(title,width=400,height=320){const w=new K.Window({name:title,title,position:K.pt(24,48),extent:K.pt(Math.min(width,innerWidth/K.world.zoom-48),Math.min(height,innerHeight/K.world.zoom-70))});w._tool=true;const view=document.createElement('div');view.className='tool-view';w._toolView=view;K.world.addMorph(w);return {window:w,view};}
function button(label,fn,parent){const b=K.textNode('button',label);b.type='button';b.onclick=()=>{try{const value=fn();value?.catch?.(K.reportError);}catch(e){K.reportError(e);}};parent?.append(b);return b;}
function openMenu(morph=K.world,position){document.querySelector('.context-menu')?.remove();const menu=document.createElement('div');menu.className='context-menu';menu.setAttribute('role','menu');menu.style.left=Math.min(position?.x||20,innerWidth-230)+'px';menu.style.top=Math.min(position?.y||32,innerHeight-300)+'px';
  const item=(label,fn)=>button(label,()=>{menu.remove();fn();},menu);
  if(morph===K.world){const select=document.createElement('select');select.setAttribute('aria-label','New morph class');for(const name of Object.keys(K.classes).filter(n=>n!=='World'))select.append(new Option(name,name));menu.append(select);item('＋ New morph',()=>K.world.undo.transaction(()=>{const m=new K.classes[select.value]({position:K.pt(100,100)});K.world.addMorph(m);K.showHalo(m);}));item('Workspace',()=>K.openWorkspace());item('Parts bin',()=>K.openPartsBin());item('Pause / Resume',()=>{K.world.paused?K.world.resume():K.world.pause();K.send({type:'status',message:K.world.paused?'Paused':'Running'});});item('Save / Share…',()=>K.send({type:'share'}));}
  else{item('Edit scripts',()=>K.openObjectEditor(morph));item('Edit style',()=>K.openStyleEditor(morph));item('Duplicate',()=>K.world.undo.transaction(()=>morph.owner.addMorph(morph.duplicate())));item('Keep in world',()=>morph.keep());item('Delete',()=>K.world.undo.transaction(()=>morph.remove()));}
  item('Inspector',()=>K.inspect(morph));item('Undo',()=>K.world.undo.undo());item('Redo',()=>K.world.undo.redo());item('Close',()=>{});document.body.append(menu);
}
Object.assign(K,{openTool,toolButton:button,openMenu});
})();
