(() => {
const K=globalThis.Livelier;
function openStyleEditor(morph){const {window:w,view}=K.openTool('Style · '+morph.name,330,420);for(const key of ['fill','borderWidth','borderColor','borderRadius','borderStyle','opacity','shadow','fontFamily','fontSize','fontColor','textAlign']){const row=document.createElement('label');row.append(K.textNode('span',key));const input=document.createElement('input');input.setAttribute('aria-label',key);input.value=morph[key];if(typeof morph[key]==='number'){input.type='number';input.step=key==='opacity'?'.05':'1';}input.onfocus=()=>K.world.undo.begin();input.oninput=()=>{morph[key]=input.type==='number'?Number(input.value):input.value;};input.onchange=()=>K.world.undo.commit();row.append(input);view.append(row);}return w;}
K.openStyleEditor=openStyleEditor;
})();
