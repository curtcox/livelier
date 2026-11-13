import {mountClientAi,aiCallback} from './ai-client.js';
if(aiCallback()) await new Promise(()=>{});
import {LocalDrafts,RenderScheduler,HashBinPanel,compactShell,createShell,mountMobileTabs,createShareDialog,createQrDialog} from '../vendor/fragment-kit-v0.4.3/src/index.js';
import {config,type,urlState,HashBinDocuments,HashBinStore,LZString} from './fragment-config.mjs';
import Program from './program.js';
Object.assign(globalThis,{HashBinDocuments,LZString});
/* The editor origin never evaluates source. All execution belongs to WorldHost. */
(async () => {
const el=id=>document.getElementById(id),storage=Program.storage(),session=Program.storage('sessionStorage');
const safeGet=key=>{try{return storage?.getItem(key);}catch(_){return null;}},safeSet=(key,value)=>{try{storage?.setItem(key,value);}catch(_){}};
const oldHeader=document.querySelector('header'),brand=oldHeader.querySelector('.brand'),shell=createShell({config});shell.header.querySelector('.fk-brand').replaceChildren(...brand.childNodes);shell.header.querySelector('.fk-brand').href=new URL('./',location.href).href;oldHeader.remove();shell.toolbar.remove();shell.status.remove();
compactShell({header:shell.header,toolbar:document.querySelector(".toolbar"),status:document.querySelector("body > footer")});shell.header.querySelector('.fk-more').id='more-toggle';document.querySelector('.toolbar>#more-toggle').remove();
shell.drawer.body.append(el('more-panel'));el('more-panel').querySelector('a[href="gallery.html"]')?.remove();el('more-panel').hidden=false;el('more-close').remove();for(const id of ['hashbin-save','hashbin-cid','hashbin-load','hashbin-status','hashbin-dialog','share-dialog','qr-dialog'])el(id).remove();
const errorCount=document.createElement('span');errorCount.id='error-count';document.querySelector('.statusbar').append(errorCount);document.querySelector('.mobile-tabs').remove();
const drafts=new LocalDrafts({storage,key:'livelier:draft',serialize:value=>HashBinDocuments.serialize(value),parse:value=>HashBinDocuments.parse(value)});
let aiHold=false,aiPrepared=null,aiVersion=-1;
let dirty=false,navigationError=null,hashbin=null,prepared=null,qrSave=false;
let program=structuredClone(Examples[0].document),loading=false,ready=false,paused=true,saved=null,snapshotTimer,urlTimer,revision=0,navigationRevision=0;
const sessionGet=()=>{try{return session?.getItem('livelier:session');}catch(_){return null;}},sessionSet=value=>{try{session?.setItem('livelier:session',value);}catch(_){}};
let abnormal=sessionGet()==='running';
const status=text=>el('status').textContent=navigationError??text;
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
function changed(){dirty=true;revision++;navigationRevision++;hashbin?.cancelLoad();navigationError=null;saved=null;urlState.cancel();clearTimeout(urlTimer);const current=revision;urlTimer=setTimeout(async()=>{try{const doc=await snapshot();if(current===revision)urlState.write(doc,{run:!paused});}catch(error){handleError(error);}},300);if(drafts.message)drafts.message.textContent='Saving draft…';}
async function snapshot(){const version=revision,source=editor.getValue(),autorun=el('autorun').checked,world=ready?await host.request('snapshot'):program.livelier.world;if(version!==revision)throw Error('The world changed while taking its snapshot. Try again.');program={src:source,livelier:{kernel:1,autorun,world}};return structuredClone(program);}
async function saveDraft(){const p=await snapshot();if(drafts.attempt(p,dirty)){dirty=false;}return p;}
const media=matchMedia('(max-width:767px)'),codePane=document.querySelector('.editor-pane'),worldPane=document.querySelector('.world-pane'),consolePane=document.querySelector('.console-pane');
let activePanel=-1;const moveConsole=()=>{(media.matches||activePanel!==-1?el('layout'):codePane).append(consolePane);editor.setFontSize(media.matches?16:14);};moveConsole();media.addEventListener('change',moveConsole);
const tabNames=['code','world','console'];const tabs=mountMobileTabs({desktop:true,container:document.querySelector('.toolbar'),panels:[{label:'Code',panel:codePane},{label:'World',panel:worldPane},{label:'Console',panel:consolePane}],onChange:index=>{activePanel=index;moveConsole();document.body.classList.remove('editor-hidden','hide-editor');el('hide-editor').textContent=index===-1||index===0?'Hide editor':'Show editor';el('hide-editor').setAttribute('aria-pressed',String(index!==-1&&index!==0));document.body.dataset.tab=index===-1?'split':tabNames[index];editor.resize();}});
function setTab(tab){tabs.select(tabNames.indexOf(tab));}if(media.matches)setTab('world');
const scheduler=new RenderScheduler({detect:()=>{},render:()=>run().catch(handleError),renderDelay:750});
async function start(run){loading=true;ready=false;paused=!run;el('pause').textContent=paused?'Resume':'❚❚ Pause';status('Loading kernel…');clearErrors();try{await host.start(program,{run});ready=true;status(errors?el('status').textContent:run?'Running':'Paused');}finally{loading=false;markSession();}}
async function loadProgram(next,{run=true,cid=null}={}){
 aiUI?.cancel();aiHold=false;
 navigationError=null;urlState.cancel();clearTimeout(urlTimer);scheduler.cancel();clearTimeout(snapshotTimer);await saveDraft();
 const own=++navigationRevision;drafts.opened();dirty=false;loading=true;hashbin?.cancelLoad();revision++;program=HashBinDocuments.normalize(next);editor.setValue(program.src,-1);el('autorun').checked=program.livelier.autorun;
 await start(run);if(own!==navigationRevision)return false;await saveDraft();
 if(cid){const fingerprint=revision;saved={cid,fingerprint};history.replaceState(null,'',urlState.link(location.href,cid));}
 else history.replaceState(null,'',urlState.build(program,{run}).href);return true;
}
async function run(){aiHold=false;navigationError=null;if(!ready)return;scheduler.cancel();clearErrors();await host.request('run',{src:editor.getValue()});await saveDraft();}
el('autorun').checked=program.livelier.autorun;
editor.session.on('change',()=>{if(loading)return;program.src=editor.getValue();changed();scheduler.cancel();if(!aiHold&&el('autorun').checked)scheduler.schedule({detect:false});clearTimeout(snapshotTimer);snapshotTimer=setTimeout(()=>saveDraft().catch(handleError),1000);});
editor.commands.addCommand({name:'run',bindKey:{win:'Ctrl-Enter',mac:'Command-Enter'},exec:()=>run().catch(handleError)});
el('run').onclick=()=>run().catch(handleError);el('pause').onclick=()=>{scheduler.cancel();host.request(paused?'resume':'pause').catch(handleError);};
el('autorun').onchange=()=>{program.livelier.autorun=el('autorun').checked;scheduler.cancel();changed();saveDraft().catch(handleError);};
el('restart').onclick=async()=>{scheduler.cancel();await start(false);el('restart').classList.remove('primary');};
el('new-world').onclick=()=>loadProgram(Program.empty(),{run:false}).catch(handleError);
el('halo-mode').onchange=()=>host.request('halo-mode',{value:el('halo-mode').checked}).catch(handleError);el('fit').onclick=()=>host.request('fit').catch(handleError);
for(const [id,name]of [['parts-open','parts'],['workspace-open','workspace'],['world-menu-open','menu'],['inspector-open','inspector']])el(id).onclick=()=>host.request('tool',{name}).catch(handleError);
for(const type of ['undo','redo'])el(type).onclick=()=>host.request(type).catch(handleError);
for(const button of document.querySelectorAll('[data-trigger]'))button.onclick=()=>el(button.dataset.trigger).click();
el('hide-editor').onclick=()=>tabs.select(tabs.getView()==='split'||tabs.getView()===0?1:'split');
el('console-clear').onclick=()=>{consoleView.clear();clearErrors();};el('console-toggle').onclick=()=>{const closed=document.querySelector('.console-pane').classList.toggle('collapsed');el('console-toggle').setAttribute('aria-expanded',String(!closed));editor.resize();};
const splitter=el('splitter');function split(value){value=Math.max(20,Math.min(70,value));document.documentElement.style.setProperty('--code-width',value+'%');splitter.setAttribute('aria-valuenow',String(Math.round(value)));editor.resize();}
splitter.onpointerdown=evt=>{evt.preventDefault();splitter.setPointerCapture(evt.pointerId);const overlay=document.createElement('div');Object.assign(overlay.style,{position:'fixed',inset:0,zIndex:99,cursor:'col-resize'});document.body.append(overlay);const move=e=>split(e.clientX/innerWidth*100);document.addEventListener('pointermove',move);document.addEventListener('pointerup',()=>{document.removeEventListener('pointermove',move);overlay.remove();},{once:true});};splitter.onkeydown=evt=>{if(['ArrowLeft','ArrowRight'].includes(evt.key)){evt.preventDefault();split(Number(splitter.getAttribute('aria-valuenow'))+(evt.key==='ArrowRight'?2:-2));}};
addEventListener('resize',()=>editor.resize());
el('open-file').onclick=()=>el('file-input').click();el('file-input').onchange=async evt=>{try{const file=evt.target.files[0];if(!file)return;if(file.size>HashBinDocuments.MAX_BYTES)throw Error('Files are limited to 5 MiB.');await loadProgram(HashBinDocuments.parse(await file.text()));}catch(e){handleError(e);}finally{evt.target.value='';}};
async function openShare(){prepared=await snapshot();shell.drawer.dialog.close();share.open();}
const share=createShareDialog({urlState,getSnapshot:()=>prepared,onSave:()=>hashbin.openSave()});
el('share-open').onclick=()=>openShare().catch(handleError);
const qr=createQrDialog({config,urlState,onLoad:async outcome=>{if(outcome.kind==='cid'){await hashbin.load(outcome.cid);return;}const url=new URL(outcome.href);history.pushState(null,'',location.pathname+url.search+url.hash);await openURL();},onSave:()=>{qrSave=true;qr.dialog.close();return hashbin.openSave();}});
el('qr-open').onclick=async()=>{try{const p=await snapshot();shell.drawer.dialog.close();qr.open(saved?.fingerprint===revision?urlState.link(location.href,saved.cid):urlState.build(p).href);}catch(error){handleError(error);}};
el('download-open').onclick=()=>{shell.drawer.dialog.close();el('download-dialog').showModal();};for(const button of document.querySelectorAll('[data-download]'))button.onclick=async()=>{try{switch(button.dataset.download){case'json':Exports.download(HashBinDocuments.serialize(await snapshot()),'livelier.json','application/json');break;case'js':Exports.download(editor.getValue(),'main.js','text/javascript');break;case'txt':Exports.download(consoleView.export(),'console.txt');break;case'svg':Exports.download(await host.request('svg'),'world.svg','image/svg+xml');break;case'png':Exports.download(await Exports.svgToPNG(await host.request('svg')),'world.png','image/png');break;}}catch(e){handleError(e);}};
const store=new HashBinStore({legacyStorage:storage});
hashbin=new HashBinPanel({store,urlState,getSnapshot:()=>prepared,getFingerprint:()=>revision,container:el('more-panel'),
 onLoad:(next,cid)=>loadProgram(next,{cid,run:new URL(location.href).searchParams.get('run')!=='0'}),
 onSaved:(cid,fingerprint,url)=>{urlState.cancel();saved={cid,fingerprint};history.replaceState(null,'',url);if(qrSave){qrSave=false;hashbin.dialog.close();qr.open(url);}}
});
const hashControls=document.createElement('div');hashControls.className='hashbin-controls';hashControls.append(hashbin.saveButton,el('more-panel').querySelector('label[for=hashbin-cid]'),hashbin.input,hashbin.loadButton,hashbin.status);el('more-panel').querySelector('.drawer-heading').after(hashControls);el('more-panel').querySelector('.input-row').remove();
// Request a fresh world before each review; Publish itself remains synchronous in the kit's confirmation click.
const review=hashbin.openSave.bind(hashbin);hashbin.openSave=async()=>{try{prepared=await snapshot();await review();}catch(error){handleError(error);}};
hashbin.dialog.addEventListener('close',()=>{qrSave=false;});
drafts.mount(el('more-panel'),async value=>{await loadProgram(value,{run:false});shell.drawer.dialog.close();});hashControls.append(el('resume-work'),el('draft-recovery-status'));
let lastNavigation=location.href;const navigate=event=>{if(event.type==='hashchange'&&event.newURL!==location.href)return;if(location.href===lastNavigation)return;lastNavigation=location.href;void openURL();};addEventListener('hashchange',navigate);addEventListener('popstate',navigate);
// Save the world before activating an offline update; the worker waits for this click.
el('offline-action').addEventListener('click',async evt=>{if(el('offline-action').textContent==='Update and reload'){evt.stopImmediatePropagation();try{const doc=await saveDraft();urlState.cancel();clearTimeout(urlTimer);history.replaceState(null,'',urlState.build(doc,{run:!paused}).href);const registration=await navigator.serviceWorker.getRegistration();if(registration?.waiting){navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});registration.waiting.postMessage({type:'activate-update'});}}catch(e){handleError(e);}}},true);
addEventListener('offline-before-reload',()=>drafts.attempt(program,dirty));addEventListener('pagehide',()=>sessionSet('idle'));document.addEventListener('visibilitychange',markSession);
async function openURL(){
 aiUI?.cancel();aiHold=false;
 navigationError=null;const own=++navigationRevision;urlState.cancel();clearTimeout(urlTimer);scheduler.cancel();clearTimeout(snapshotTimer);hashbin.cancelLoad();
 try{
  const parsed=urlState.parse(location.href);let next=structuredClone(Examples[0].document),initialRun=!abnormal&&parsed.run!==false,cid=null;
  if(parsed.kind==='publish'){const result=await store.published(location.hash);if(own!==navigationRevision)return;if(result?.snapshot)next=HashBinDocuments.normalize(result.snapshot);if(result?.error)el('hashbin-status').textContent=result.error;cid=result?.cid??null;}
  else if(parsed.kind==='source')next=parsed.doc;
  else if(parsed.kind==='example'){const example=Examples.find(e=>e.id===parsed.id);if(!example)throw Error('Sample not found. Open the sample gallery.');next=structuredClone(example.document);}
  else if(parsed.kind==='cid'){next=await store.load(parsed.cid);cid=parsed.cid;}
  if(own!==navigationRevision)return;
  // Resolving an explicit link never writes the stored work; only subsequent edits can do that.
  await saveDraft();if(own!==navigationRevision)return;drafts.opened();dirty=false;revision++;loading=true;program=HashBinDocuments.normalize(next);editor.setValue(program.src,-1);el('autorun').checked=program.livelier.autorun;
  await start(initialRun);if(own!==navigationRevision)return;
  saved=cid?{cid,fingerprint:revision}:null;
  if(cid)history.replaceState(null,'',urlState.link(location.href,cid));else if(['example','publish'].includes(parsed.kind))history.replaceState(null,'',urlState.build(program,{run:initialRun}).href);
  if(abnormal)status('Livelier didn’t close normally, so this world opened paused.');
 }catch(error){if(own!==navigationRevision)return;navigationError=error.message;status(error.message);if(!ready)await start(false).catch(handleError);}
 finally{document.body.dataset.ready='true';}
}
const aiUI=await mountClientAi({config,type,urlState,container:shell.drawer.body,toolbar:document.querySelector('.toolbar'),status,prepareSnapshot:async()=>{if(loading||!ready)throw Error('Wait for the world to finish opening before asking.');scheduler.cancel();if(ready)await host.request('pause');aiPrepared=await snapshot();aiVersion=revision;status('World paused for AI review.');},getSnapshot:()=>{if(aiVersion!==revision)throw Error('World changed. Reopen Ask to capture a fresh paused snapshot.');return structuredClone(aiPrepared);},getFingerprint:()=>revision,onApply:doc=>{aiHold=true;scheduler.cancel();clearTimeout(snapshotTimer);clearTimeout(urlTimer);navigationRevision++;hashbin.cancelLoad();loading=true;program=type.normalize(doc);editor.setValue(program.src,-1);el('autorun').checked=program.livelier.autorun;revision++;dirty=true;saved=null;drafts.attempt(program,true);aiPrepared=structuredClone(program);aiVersion=revision;void start(false).then(()=>status('Change accepted — press Run.')).catch(handleError);}});
store.retireLegacyTokens().catch(()=>{});await openURL();
// Integration hooks for reproducible tests and gallery rendering.
globalThis.LivelierApp={host,editor,snapshot,loadProgram,run,saveDraft,hashbin,store,get ready(){return ready;},get revision(){return revision;}};
})();
