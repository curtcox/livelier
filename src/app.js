/* The editor origin never evaluates source. All execution belongs to WorldHost. */
(async () => {
const el=id=>document.getElementById(id),storage=Program.storage(),session=Program.storage('sessionStorage');
const safeGet=key=>{try{return storage?.getItem(key);}catch(_){return null;}},safeSet=(key,value)=>{try{storage?.setItem(key,value);}catch(_){}};
let program=Program.loadDraft(storage)||structuredClone(Examples[0].document),loading=false,ready=false,paused=true,saved=null,snapshotTimer,runTimer,revision=0;
const sessionGet=()=>{try{return session?.getItem('livelier:session');}catch(_){return null;}},sessionSet=value=>{try{session?.setItem('livelier:session',value);}catch(_){}};
let abnormal=sessionGet()==='running';
const status=text=>el('status').textContent=text;
const editor=ace.edit('editor');editor.setTheme('ace/theme/chrome');editor.session.setUseWorker(false);editor.session.setMode('ace/mode/javascript');editor.setOptions({fontSize:14,tabSize:2,useSoftTabs:true,showPrintMargin:false,enableBasicAutocompletion:true,enableLiveAutocompletion:true});editor.setValue(program.src,-1);
const api=['world','Morph','Ellipse','Path','Text','Label','Image','Button','Slider','List','Window','HTMLMorph','CanvasMorph','pt','Color','connect','disconnect','inspect'];
ace.require('ace/ext/language_tools').addCompleter({getCompletions(_editor,_session,_pos,_prefix,callback){callback(null,api.map(value=>({caption:value,value,meta:'Livelier',score:1000})));}});
let errorMarker;
const consoleView=new ConsoleView(el('console'),{onLine:line=>{setTab('code');editor.gotoLine(line,0,true);editor.focus();}});
let errors=0;const clearErrors=()=>{errors=0;el('error-count').textContent='';editor.session.clearAnnotations();if(errorMarker!=null)editor.session.removeMarker(errorMarker);errorMarker=null;};
const host=new WorldHost(el('world-frame'),{onMessage:data=>{
  if(data.type==='console')consoleView.append(data);
  if(data.type==='error'){consoleView.append({level:'error',...data});errors++;el('error-count').textContent=String(errors);status(data.name==='LoopGuardError'?'Stopped a long-running loop':data.line?`Error on line ${data.line}`:data.message);if(data.source==='main.js'||(!data.source&&data.line)){editor.session.setAnnotations([{row:Math.max(0,data.line-1),column:Math.max(0,(data.column||1)-1),text:data.message,type:'error'}]);const Range=ace.require('ace/range').Range;errorMarker=editor.session.addMarker(new Range(data.line-1,0,data.line-1,1),'error-line','fullLine');}}
  if(data.type==='changed'&&!loading){changed();clearTimeout(snapshotTimer);snapshotTimer=setTimeout(()=>saveDraft().catch(handleError),1000);}
  if(data.type==='status'){paused=data.message==='Paused';el('pause').textContent=paused?'Resume':'❚❚ Pause';status(data.message);markSession();}
  if(data.type==='share')openShare().catch(handleError);
},onHang:()=>{status('The world stopped responding. Use More → Restart world.');el('restart').classList.add('primary');}});
const handleError=error=>{if(error.message!=='World restarted.')status(error.message);};
function markSession(){sessionSet(paused||document.hidden?'idle':'running');}
function changed(){revision++;hashbin?.cancelLoad();shareClient.cancel();if(saved){saved=null;const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);}el('draft-status').textContent='Saving draft…';}
async function snapshot(){if(ready)program.livelier.world=await host.request('snapshot');program.src=editor.getValue();program.livelier.autorun=el('autorun').checked;return structuredClone(program);}
async function saveDraft(){const p=await snapshot(),error=Program.saveDraft(storage,p);el('draft-status').textContent=error||'Saved on this device';return p;}
function setTab(tab){document.body.dataset.tab=tab;for(const b of document.querySelectorAll('.mobile-tabs button'))b.setAttribute('aria-selected',String(b.dataset.tab===tab));editor.resize();}
for(const b of document.querySelectorAll('.mobile-tabs button'))b.onclick=()=>setTab(b.dataset.tab);
async function start(run){loading=true;ready=false;paused=!run;el('pause').textContent=paused?'Resume':'❚❚ Pause';status('Loading kernel…');clearErrors();try{await host.start(program,{run});ready=true;status(errors?el('status').textContent:run?'Running':'Paused');}finally{loading=false;markSession();}}
async function loadProgram(next,{run=true,ask=true,cid=null}={}){
  if(ask&&!await confirmReplace())return false;
  clearTimeout(runTimer);loading=true;hashbin?.cancelLoad();revision++;program=HashBinDocuments.normalize(next);editor.setValue(program.src,-1);el('autorun').checked=program.livelier.autorun;
  await start(run);await saveDraft();if(cid){const fingerprint=await Program.fingerprint(program);saved={cid,fingerprint};history.replaceState(null,'',HashBinDocuments.link(location.href,cid));}return true;
}
function confirmReplace(){return new Promise(resolve=>{el('load-dialog').showModal();el('load-keep').onclick=()=>{el('load-dialog').close();resolve(false);};el('load-replace').onclick=()=>{el('load-dialog').close();resolve(true);};el('load-dialog').oncancel=()=>resolve(false);});}
async function run(){if(!ready)return;clearTimeout(runTimer);clearErrors();await host.request('run',{src:editor.getValue()});await saveDraft();}
el('autorun').checked=program.livelier.autorun;
editor.session.on('change',()=>{if(loading)return;program.src=editor.getValue();changed();clearTimeout(runTimer);if(el('autorun').checked)runTimer=setTimeout(()=>run().catch(handleError),750);clearTimeout(snapshotTimer);snapshotTimer=setTimeout(()=>saveDraft().catch(handleError),1000);});
editor.commands.addCommand({name:'run',bindKey:{win:'Ctrl-Enter',mac:'Command-Enter'},exec:()=>run().catch(handleError)});
el('run').onclick=()=>run().catch(handleError);el('pause').onclick=()=>{clearTimeout(runTimer);host.request(paused?'resume':'pause').catch(handleError);};
el('autorun').onchange=()=>{program.livelier.autorun=el('autorun').checked;clearTimeout(runTimer);changed();saveDraft().catch(handleError);};
el('restart').onclick=async()=>{clearTimeout(runTimer);await start(false);el('restart').classList.remove('primary');};
el('new-world').onclick=()=>loadProgram(Program.empty(),{run:false}).catch(handleError);
el('halo-mode').onchange=()=>host.request('halo-mode',{value:el('halo-mode').checked}).catch(handleError);el('fit').onclick=()=>host.request('fit').catch(handleError);
for(const [id,name]of [['parts-open','parts'],['workspace-open','workspace'],['world-menu-open','menu'],['inspector-open','inspector']])el(id).onclick=()=>host.request('tool',{name}).catch(handleError);
for(const type of ['undo','redo'])el(type).onclick=()=>host.request(type).catch(handleError);
for(const button of document.querySelectorAll('[data-trigger]'))button.onclick=()=>el(button.dataset.trigger).click();
el('more-toggle').onclick=()=>{el('more-panel').hidden=!el('more-panel').hidden;el('more-toggle').setAttribute('aria-expanded',String(!el('more-panel').hidden));};el('more-close').onclick=()=>{el('more-panel').hidden=true;el('more-toggle').setAttribute('aria-expanded','false');};
el('hide-editor').onclick=()=>{const hidden=document.body.classList.toggle('hide-editor');el('hide-editor').textContent=hidden?'Show editor':'Hide editor';el('hide-editor').setAttribute('aria-pressed',String(hidden));editor.resize();};
el('console-clear').onclick=()=>{consoleView.clear();clearErrors();};el('console-toggle').onclick=()=>{const closed=document.querySelector('.console-pane').classList.toggle('collapsed');el('console-toggle').setAttribute('aria-expanded',String(!closed));editor.resize();};
const splitter=el('splitter');function split(value){value=Math.max(20,Math.min(70,value));document.documentElement.style.setProperty('--code-width',value+'%');splitter.setAttribute('aria-valuenow',String(Math.round(value)));editor.resize();}
splitter.onpointerdown=evt=>{evt.preventDefault();splitter.setPointerCapture(evt.pointerId);const overlay=document.createElement('div');Object.assign(overlay.style,{position:'fixed',inset:0,zIndex:99,cursor:'col-resize'});document.body.append(overlay);const move=e=>split(e.clientX/innerWidth*100);document.addEventListener('pointermove',move);document.addEventListener('pointerup',()=>{document.removeEventListener('pointermove',move);overlay.remove();},{once:true});};splitter.onkeydown=evt=>{if(['ArrowLeft','ArrowRight'].includes(evt.key)){evt.preventDefault();split(Number(splitter.getAttribute('aria-valuenow'))+(evt.key==='ArrowRight'?2:-2));}};
addEventListener('resize',()=>editor.resize());
el('open-file').onclick=()=>el('file-input').click();el('file-input').onchange=async evt=>{try{const file=evt.target.files[0];if(!file)return;if(file.size>HashBinDocuments.MAX_BYTES)throw Error('Files are limited to 5 MiB.');await loadProgram(HashBinDocuments.parse(await file.text()));}catch(e){handleError(e);}finally{evt.target.value='';}};
const shareClient=new ShareClient();let currentLinks,qrSource;
async function links(){const p=await snapshot(),fingerprint=await Program.fingerprint(p),run=!el('share-paused').checked;if(saved?.fingerprint===fingerprint){const url=new URL(HashBinDocuments.link(location.href,saved.cid));if(!run)url.searchParams.set('run','0');return {long:url.href,fallback:url.href};}return ShareLinks.build({url:location.href,...p,compress:LZString.compressToEncodedURIComponent,run});}
async function updateLinks(){currentLinks=await links();el('share-url').value=currentLinks.long;el('share-status').textContent=currentLinks.long.length>20000?'This world makes a long link. Save to HashBin for a shorter one.':'';}
async function openShare(){el('share-dialog').showModal();await updateLinks();}el('share-open').onclick=()=>openShare().catch(handleError);el('share-paused').onchange=()=>updateLinks().catch(handleError);
el('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText(el('share-url').value);el('share-status').textContent='Link copied.';}catch(_){el('share-url').select();el('share-status').textContent='Select and copy the link above.';}};
el('shorten-link').onclick=async()=>{el('shorten-link').disabled=true;el('share-status').textContent='Shortening…';try{const result=await shareClient.shorten(currentLinks);if(result){el('share-url').value=result.url;el('share-status').textContent=result.error?.message||'Short link ready.';}}finally{el('shorten-link').disabled=false;}};el('share-dialog').addEventListener('close',()=>shareClient.cancel());
el('qr-open').onclick=async()=>{try{const link=(await links()).long,qr=encodeQr(link);el('qr-notes').textContent=qrNotes(link,qr);el('qr-image').replaceChildren();el('qr-svg').disabled=el('qr-png').disabled=!qr;if(qr){qrSource=qrSvg(qr);const img=document.createElement('img');img.src=URL.createObjectURL(new Blob([qrSource],{type:'image/svg+xml'}));img.onload=()=>URL.revokeObjectURL(img.src);img.alt='QR code of the current world';el('qr-image').append(img);}el('qr-dialog').showModal();}catch(e){handleError(e);}};
el('qr-svg').onclick=()=>Exports.download(qrSource,'livelier-qr.svg','image/svg+xml');el('qr-png').onclick=async()=>{try{Exports.download(await Exports.svgToPNG(qrSource),'livelier-qr.png','image/png');}catch(e){handleError(e);}};
el('download-open').onclick=()=>el('download-dialog').showModal();for(const button of document.querySelectorAll('[data-download]'))button.onclick=async()=>{try{switch(button.dataset.download){case'json':Exports.download(HashBinDocuments.serialize(await snapshot()),'livelier.json','application/json');break;case'js':Exports.download(editor.getValue(),'main.js','text/javascript');break;case'txt':Exports.download(consoleView.export(),'console.txt');break;case'svg':Exports.download(await host.request('svg'),'world.svg','image/svg+xml');break;case'png':Exports.download(await Exports.svgToPNG(await host.request('svg')),'world.png','image/png');break;}}catch(e){handleError(e);}};
const redirect=new URL('./',location.href);redirect.search='';redirect.hash='';
const store=new HashBinStore({clientId:document.querySelector('meta[name=hashbin-client-id]').content,redirectUri:redirect.href,storage,transactionStorage:session});
const hashbin=new HashBinPanel({store,getSnapshot:snapshot,getFingerprint:async captured=>Program.fingerprint(captured||await snapshot()),getVersion:()=>revision,onLoad:(next,cid)=>loadProgram(next,{cid,run:new URL(location.href).searchParams.get('run')!=='0'}),onSaved:(cid,fingerprint,url)=>{saved={cid,fingerprint};history.replaceState(null,'',url);}});
el('share-hashbin').onclick=()=>{el('share-dialog').close();hashbin.openSave();};
// Save the world before activating an offline update; the worker waits for this click.
el('offline-action').addEventListener('click',async evt=>{if(el('offline-action').textContent==='Update and reload'){evt.stopImmediatePropagation();try{await saveDraft();const registration=await navigator.serviceWorker.getRegistration();registration?.waiting?.postMessage({type:'activate-update'});}catch(e){handleError(e);}}},true);
addEventListener('offline-before-reload',()=>Program.saveDraft(storage,program));addEventListener('pagehide',()=>sessionSet('idle'));document.addEventListener('visibilitychange',markSession);
try{
 const parsed=ShareLinks.parse(location.href,LZString.decompressFromEncodedURIComponent);let initialRun=!abnormal&&(parsed?.run??true);
 if(parsed?.kind==='publish'){const result=await store.published(location.hash);if(result?.snapshot)program=HashBinDocuments.normalize(result.snapshot);if(result?.error)el('hashbin-status').textContent=result.error;if(result?.cid)saved={cid:result.cid,fingerprint:await Program.fingerprint(program)};history.replaceState(null,'',saved?HashBinDocuments.link(location.href,saved.cid):redirect.href);}
 else if(parsed){let linked;if(parsed.kind==='source')linked=HashBinDocuments.normalize(parsed);if(parsed.kind==='example'){const example=Examples.find(e=>e.id===parsed.id);if(!example)throw Error('Sample not found. Open the sample gallery.');linked=structuredClone(example.document);}if(parsed.kind==='cid')linked=await store.load(parsed.cid);if(linked){const draft=Program.loadDraft(storage);if(!draft||await Program.fingerprint(draft)===await Program.fingerprint(linked)||await confirmReplace()){program=linked;if(parsed.kind==='cid')saved={cid:parsed.cid,fingerprint:await Program.fingerprint(linked)};}else history.replaceState(null,'',redirect.href);}}
 loading=true;editor.setValue(program.src,-1);el('autorun').checked=program.livelier.autorun;await start(initialRun);await saveDraft();if(saved)saved.fingerprint=await Program.fingerprint(program);if(abnormal)status('Livelier didn’t close normally, so this world opened paused.');
}catch(error){handleError(error);if(!ready){await start(false).catch(handleError);}}
// Integration hooks for reproducible tests and gallery rendering.
globalThis.LivelierApp={host,editor,snapshot,loadProgram,run,saveDraft,hashbin,store,get ready(){return ready;},get revision(){return revision;}};
})();
