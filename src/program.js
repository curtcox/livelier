(() => {
const Documents=typeof module!=='undefined'?require('./hashbin.js').HashBinDocuments:globalThis.HashBinDocuments;
const Program={
  empty:()=>Documents.normalize({src:''}),
  async fingerprint(program){const hash=await crypto.subtle.digest('SHA-256',Documents.bytes(Documents.serialize(program)));return Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');},
  loadDraft(storage){try{const text=storage?.getItem('livelier:draft');return text?Documents.parse(text):null;}catch(_){return null;}},
  saveDraft(storage,program){try{storage?.setItem('livelier:draft',Documents.serialize(program));return null;}catch(_){return 'Draft could not be stored locally. Download it or save to HashBin.';}},
  storage(name='localStorage'){try{return globalThis[name];}catch(_){return null;}}
};
if(typeof module!=='undefined')module.exports=Program;else globalThis.Program=Program;
})();
