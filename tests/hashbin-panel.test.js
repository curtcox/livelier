const test=require('node:test'),assert=require('node:assert/strict');
const elements=new Map();
function element(){return {textContent:'',disabled:false,open:false,addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},replaceChildren(){},append(){}};}
globalThis.document={getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);},createTextNode:text=>({textContent:text}),createElement:element};
globalThis.location={href:'https://curtcox.github.io/livelier/'};
globalThis.HashBinDocuments=require('../src/hashbin.js').HashBinDocuments;
require('../src/hashbin-panel.js');
test('Publish starts synchronously in the approval click; a changed document requires a fresh review',async()=>{
 let version=0,published=0,saved=0;
 const store={init:async()=>{},publish(){published++;return Promise.resolve({cid:'AAAAAAAA'});}};
 const panel=new HashBinPanel({store,getSnapshot:async()=>({src:String(version)}),getFingerprint:async snapshot=>JSON.stringify(snapshot||{src:String(version)}),getVersion:()=>version,onLoad(){},onSaved(){saved++;}});
 await panel.openSave();const pending=panel.commit();assert.equal(published,1,'Popup must open before any await');await pending;assert.equal(saved,1);
 await panel.openSave();version++;const changed=panel.commit();assert.equal(published,1,'Stale prepared documents must be reviewed again');await changed;await new Promise(resolve=>setImmediate(resolve));assert.equal(panel.version,version);const next=panel.commit();assert.equal(published,2);await next;
});
