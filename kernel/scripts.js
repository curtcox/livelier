(() => {
const K=globalThis.Livelier;
K.scriptScope ||= (world)=>({...K.classes,world,pt:K.pt,Color:K.Color,$:name=>world?.get(name),connect:K.connect,inspect:K.inspect});
function functionSource(fn) { let source=typeof fn==='function'?fn.toString().replaceAll('__lg();','').replaceAll('__lg.check();','').replaceAll('(__lg(),','('):fn; if(!/^(?:async\s+)?function\b|^(?:async\s*)?\(?[\w\s,={}.[\]]*\)?\s*=>|^\(/.test(source))source=source.replace(/^(async\s+)?(\*?\w+)\s*\(/,(_,a,n)=>(a||'')+'function '+n+'(');return source; }
function addScript(morph,fn,name) {
  const source=functionSource(fn), compiled=K.compileFunction(source,{scope:K.scriptScope?.()||{},name:`scripts/${morph.id}/${name||fn.name||'script'}`});
  name=name||compiled.name;if(!name||['__proto__','constructor','prototype'].includes(name)||name.startsWith('_'))throw Error('Give the script a public method name.');
  morph.scripts[name]=source;let installedWorld;let installed; morph[name]=function(...args){if(installedWorld!==this.world||!installed){installed=K.compileFunction(source,{scope:K.scriptScope?.(this.world)||{},name:`scripts/${morph.id}/${name}`});installedWorld=this.world;}const run=K.activeRun;K.activeRun=this._run;try{return installed.apply(this,args);}finally{K.activeRun=run;}};morph.changed('scripts');return morph;
}
function keepMorph(morph) {
  const kept=new Set(morph.withAllSubmorphs());for(const m of kept) {
    let proto=Object.getPrototypeOf(m);
    while(proto&&!Object.values(K.classes).some(C=>proto===C.prototype)){
      for(const name of Object.getOwnPropertyNames(proto)) {const descriptor=Object.getOwnPropertyDescriptor(proto,name);if(name!=='constructor'&&typeof descriptor.value==='function'&&!m.scripts[name])addScript(m,descriptor.value,name);}proto=Object.getPrototypeOf(proto);
    }
    m._run=null;
  }
  const world=morph.world;for(const c of world?.connections||[])if(!c.source._run&&!c.target._run&&(kept.has(c.source)||kept.has(c.target)))c.run=null;
  morph.changed('keep'); return morph;
}
Object.assign(K,{functionSource,addScript,keepMorph});
if(typeof module!=='undefined')module.exports=K;
})();
