(() => {
const K=globalThis.Livelier;
class UndoManager {
  constructor(world) { this.world=world;this.past=[];this.future=[];this.limit=100;this.objects=new Map(); }
  capture() { for(const m of this.world.withAllSubmorphs())this.objects.set(m.id,m);return JSON.stringify(K.snapshot(this.world,{all:true})); }
  begin() { this.before=this.capture(); }
  commit() { if(this.before&&this.before!==this.capture()){this.past.push(this.before);if(this.past.length>this.limit)this.past.shift();this.future=[];}this.before=null; }
  transaction(fn) { this.begin();try{return fn();}finally{this.commit();} }
  apply(record) {
    const data=JSON.parse(record);for(const c of [...this.world.connections])c.disconnect();
    const apply=(r,m)=>{
      m ||= this.objects.get(r.id);if(!m){m=new (K.classes[r.class]||K.Morph)();m.id=r.id;this.objects.set(r.id,m);}
      for(const key of Object.keys(K.defaults))m[key]=r.props[key];
      m._run=r.run??null;m._stepping=r.stepping||null;
      for(const name of Object.keys(m.scripts))if(!Object.hasOwn(r.scripts,name)){delete m[name];delete m.scripts[name];}
      for(const [name,source]of Object.entries(r.scripts))if(m.scripts[name]!==source)K.addScript(m,source,name);
      for(const child of [...m.submorphs])if(!child._tool)child.remove();
      for(const child of r.submorphs)m.addMorph(apply(child));return m;
    };
    apply(data.root,this.world);
    for(const c of data.connections){const source=this.objects.get(c.source),target=this.objects.get(c.target);if(source&&target)K.connect(source,c.prop,target,c.method,{converter:c.converter});}
    this.world.changed('undo');K.hideHalo?.();
  }
  undo() { if(!this.past.length)return;this.future.push(this.capture());this.apply(this.past.pop()); }
  redo() { if(!this.future.length)return;this.past.push(this.capture());this.apply(this.future.pop()); }
}
K.UndoManager=UndoManager;if(typeof module!=='undefined')module.exports=K;
})();
