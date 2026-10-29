(() => {
const K=globalThis.Livelier,port=globalThis.livelierPort;
const send=data=>port.postMessage(data);
function preview(value,depth=0,seen=new WeakSet()) {if(typeof value==='string')return value.slice(0,4000);if(value===null||typeof value!=='object')return String(value);if(value instanceof Error)return value.name+': '+value.message;if(seen.has(value))return '[Circular]';if(depth>2)return '['+(value.constructor?.name||'Object')+']';seen.add(value);try{if(Array.isArray(value))return '['+value.slice(0,20).map(v=>preview(v,depth+1,seen)).join(', ')+(value.length>20?', …':'')+']';return (value instanceof K.Morph?value.constructor.name+' ':'')+'{'+Object.keys(value).filter(k=>!k.startsWith('_')).slice(0,15).map(k=>k+': '+preview(value[k],depth+1,seen)).join(', ')+'}';}catch(_){return '[Uninspectable]';}}
let lines=0,bytes=0;
for(const level of ['log','info','warn','error']){const native=console[level].bind(console);console[level]=(...args)=>{native(...args);if(lines>=20000||bytes>=1024*1024)return;let text=args.map(v=>preview(v)).join(' ').slice(0,8000);lines++;bytes+=text.length;send({type:'console',level,text});};}
function reportError(error){const location=K.errorLocation(error);send({type:'error',message:String(error.message||error).slice(0,4000),name:error.name,...location});}
addEventListener('error',evt=>{reportError(evt.error||Error(evt.message));evt.preventDefault();});addEventListener('unhandledrejection',evt=>{reportError(evt.reason||Error('Unhandled rejection'));evt.preventDefault();});
function scriptScope(world=K.world){return {...K.classes,pt:K.pt,Point:K.Point,Rect:K.Rect,Transform:K.Transform,Color:K.Color,world,$:name=>world.get(name),connect:K.connect,disconnect:K.disconnect,disconnectAll:K.disconnectAll,inspect:K.inspect,
  setTimeout:(fn,ms)=>world.userTimer(fn,ms,false),setInterval:(fn,ms)=>world.userTimer(fn,ms,true),clearTimeout:timer=>timer?.cancel(),clearInterval:timer=>timer?.cancel()};}
let runSequence=0;
async function runMain(src){
  const seq=++runSequence,world=K.world;world.clearRun();world.resume();const run=++world.runID;
  const resume=value=>{if(seq!==runSequence)throw Object.assign(Error('Previous run was replaced.'),{name:'RunCancelledError'});K.activeRun=run;queueMicrotask(()=>{if(K.activeRun===run)K.activeRun=null;});return value;};
  send({type:'status',message:'Running'});
  try{K.activeRun=run;const pending=K.compile(src,{scope:{...scriptScope(),__resume:resume},name:'main.js',lastExpression:false,resumeAwait:true}).call(world);K.activeRun=null;return preview(await pending);}
  catch(error){if(error.name!=='RunCancelledError')reportError(error);}
  finally{if(K.activeRun===run)K.activeRun=null;}
}
port.onmessage=async({data})=>{
  if(!data||typeof data.type!=='string')return;
  if(data.type==='ping'){send({type:'pong'});return;}
  const reply=value=>send({type:'reply',reply:data.id,value});
  try{switch(data.type){
    case 'load': await K.loadProgram(data.program);if(data.run)await runMain(data.program.src);reply(true);break;
    case 'run':if(typeof data.src!=='string'||data.src.length>5*1024*1024)throw Error('Invalid source.');await runMain(data.src);reply(true);break;
    case 'pause':K.world.pause();send({type:'status',message:'Paused'});reply(true);break;
    case 'resume':K.world.resume();send({type:'status',message:'Running'});reply(true);break;
    case 'snapshot':reply(K.snapshot(K.world));break;
    case 'svg':reply(K.world.exportSVG());break;
    case 'halo-mode':K.world.haloMode=!!data.value;reply(true);break;
    case 'fit':K.world.zoom=1;K.world.pan=K.pt(0,0);K.world.dirty.add(K.world);reply(true);break;
    case 'tool':if(data.name==='workspace')K.openWorkspace();if(data.name==='parts')K.openPartsBin();if(data.name==='inspector')K.inspect(K.world);if(data.name==='menu')K.openMenu();reply(true);break;
    case 'undo':K.world.undo.undo();reply(true);break;
    case 'redo':K.world.undo.redo();reply(true);break;
  }}catch(error){reportError(error);send({type:'reply',reply:data.id,error:error.message});}
};
Object.assign(K,{send,preview,reportError,scriptScope,runMain});
})();
