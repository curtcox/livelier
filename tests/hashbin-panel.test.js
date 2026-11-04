const test=require('node:test'),assert=require('node:assert/strict');
const elements=new Map();
function element(){return {textContent:'',disabled:false,open:false,addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},replaceChildren(){},append(){},setAttribute(){}};}
globalThis.document={getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);},createTextNode:text=>({textContent:text}),createElement:element,querySelector(){return null;},body:element()};
globalThis.location={href:'https://curtcox.github.io/livelier/'};
globalThis.HashBinDocuments=require('../src/fragment-config.mjs').HashBinDocuments;
const {HashBinPanel}=require('../vendor/fragment-kit-v0.3.2/src/index.js');
const {urlState,HashBinDocuments}=require('../src/fragment-config.mjs');
test('Publish starts synchronously in the approval click; a changed document requires a fresh review',async()=>{
 let version=0,published=0,saved=0;
 const store={documents:HashBinDocuments,init:async()=>{},publish(){published++;return Promise.resolve({cid:'AAAAAAAA'});}};
 const panel=new HashBinPanel({store,urlState,getSnapshot:()=>({src:String(version)}),getFingerprint:()=>version,onLoad(){},onSaved(){saved++;}});
 await panel.openSave();const pending=panel.commit();assert.equal(published,1,'Popup must open before any await');await pending;assert.equal(saved,1);
 await panel.openSave();version++;const changed=panel.commit();assert.equal(published,1,'Stale prepared documents must be reviewed again');await changed;await new Promise(resolve=>setImmediate(resolve));assert.equal(panel.fingerprint,version);const next=panel.commit();assert.equal(published,2);await next;
});
