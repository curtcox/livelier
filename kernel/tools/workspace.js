(() => {
const K=globalThis.Livelier;
function codeEditor(parent,source=''){const host=document.createElement('div');host.className='tool-code';parent.append(host);const editor=ace.edit(host);editor.setTheme('ace/theme/chrome');editor.session.setUseWorker(false);editor.session.setMode('ace/mode/javascript');editor.setOptions({fontSize:16,tabSize:2,useSoftTabs:true,showPrintMargin:false});editor.setValue(source,-1);return editor;}
function openWorkspace(source='// Try: world.addMorph(new Ellipse({fill: Color.random()}))\n2 + 3',context){const {window:w,view}=K.openTool('Workspace',520,380);const bar=document.createElement('nav');view.append(bar);const editor=codeEditor(view,source),output=K.textNode('pre','');output.className='tool-output';view.append(output);
  const run=async mode=>{try{const src=editor.getSelectedText()||editor.getValue();const value=await K.compile(src,{scope:K.scriptScope(),name:'workspace.js'}).call(context||K.world);if(mode==='print'){output.textContent=K.preview(value);console.log(value);}if(mode==='inspect')K.inspect(value);}catch(e){output.textContent=e.message;K.reportError(e);}};
  for(const [mode,label,key]of [['do','Do it','D'],['print','Print it','P'],['inspect','Inspect it','I']]){K.toolButton(label,()=>run(mode),bar);editor.commands.addCommand({name:mode,bindKey:{win:'Ctrl-'+key,mac:'Command-'+key},exec:()=>run(mode)});}return w;
}
Object.assign(K,{codeEditor,openWorkspace});
})();
