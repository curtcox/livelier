(() => {
const K=globalThis.Livelier;
const clean=value=>JSON.parse(JSON.stringify(value));
const forbidden=new Set(['__proto__','constructor','prototype']);
function morphRecord(morph,{all=false}={}) {
  let C=morph.constructor; while(C&&!Object.values(K.classes).includes(C))C=Object.getPrototypeOf(C);
  const props={};for(const key of Object.keys(K.defaults))props[key]=clean(morph[key]);
  const scripts={};for(const key of Object.keys(morph.scripts).sort())scripts[key]=morph.scripts[key];
  return {id:morph.id,class:C?.name||'Morph',...(all?{run:morph._run,stepping:morph._stepping?{ms:morph._stepping.ms,method:morph._stepping.method,last:morph._stepping.last}:null}:{}),props,scripts,submorphs:morph.submorphs.filter(m=>!m._tool&&(all||!m._run)).map(m=>morphRecord(m,{all}))};
}
function snapshot(world,{all=false}={}) {
  const root=morphRecord(world,{all}),ids=new Set(); const walk=r=>{ids.add(r.id);r.submorphs.forEach(walk);};walk(root);
  const connections=[...world.connections].filter(c=>(all||!c.run)&&ids.has(c.source.id)&&ids.has(c.target.id)).map(c=>({source:c.source.id,prop:c.prop,target:c.target.id,method:c.method,converter:c.converter}));
  connections.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return {v:1,root,connections};
}
function restore(data,{warn=message=>console.warn(message)}={}) {
  if(!data||data.v!==1||!data.root)throw Error('Unsupported world version. See docs/program-model.html.');
  const byID=new Map();let count=0;
  const read=(r,depth=0)=>{
    if(depth>100||++count>20000)throw Error('World is too complex.');
    const C=Object.hasOwn(K.classes,r.class)?K.classes[r.class]:K.Morph;if(C===K.Morph&&r.class!=='Morph')warn('Unknown class '+r.class+' loaded as Morph. See docs/morphs.html.');
    const props={};for(const [key,value]of Object.entries(r.props||{})) {if(Object.hasOwn(K.defaults,key))props[key]=value;else warn('Unknown property '+key+' ignored. See docs/morphs.html.');}
    const m=new C(props);if(typeof r.id==='string'&&!byID.has(r.id)){m.id=r.id;K.reserveID(m.id);}else if(r.id)throw Error('Duplicate morph ID.');byID.set(m.id,m);
    for(const [name,source]of Object.entries(r.scripts||{}))if(!forbidden.has(name)&&typeof source==='string')try{K.addScript(m,source,name);}catch(e){warn('Script '+name+': '+e.message);}
    for(const child of r.submorphs||[])m.addMorph(read(child,depth+1));return m;
  };
  let world=read(data.root);if(!(world instanceof K.World)){const m=world;world=new K.World();world.addMorph(m);}
  for(const c of data.connections||[]) { const s=byID.get(c.source),t=byID.get(c.target);if(s&&t&&!forbidden.has(c.method)&&!String(c.method).startsWith('_'))try{K.connect(s,c.prop,t,c.method,{converter:c.converter});}catch(e){warn(e.message);} }
  world.paused=true;return world;
}
function cloneMorph(morph) {
  const record=morphRecord(morph,{all:true}),ids=new Map();const fresh=r=>{const old=r.id;r.id=K.id();ids.set(old,r.id);r.submorphs.forEach(fresh);};fresh(record);
  const w=restore({v:1,root:{class:'World',props:{},submorphs:[record]},connections:[]}); const clone=w.submorphs[0];clone.name=morph.name+' copy';clone.remove();clone.position=clone.position.add(K.pt(20,20));return clone;
}
Object.assign(K,{snapshot,restore,morphRecord,cloneMorph});
if(typeof module!=='undefined')module.exports=K;
})();
