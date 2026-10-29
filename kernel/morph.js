(() => {
const K = globalThis.Livelier, { Point, Transform, Rect } = K;
const defaults = {
  name: '', position: {x:0,y:0}, extent: {x:120,y:80}, origin: {x:0,y:0}, rotation:0, scale:1,
  fill:'#6bbaa7', borderWidth:0, borderColor:'#25473e', borderRadius:8, borderStyle:'solid',
  opacity:1, visible:true, clip:false, shadow:'', reactsToPointer:true, draggable:true, grabbable:false, acceptsDrops:false,
  text:'', fontFamily:'system-ui, sans-serif', fontSize:18, fontColor:'#233e36', textAlign:'left', editable:false,
  vertices:[], closed:false, stroke:'#25473e', strokeWidth:2, url:'', value:0, min:0, max:100, items:[], selection:-1,
  title:'Window', minimized:false, html:''
};
const pointProps = new Set(['position','extent','origin']);
class Morph {
  constructor(props = {}) {
    this.id = props.id || K.id(); K.reserveID(this.id);
    this._props = {}; this.submorphs = []; this.owner = null; this._listeners = new Map(); this.scripts = {};
    this._run = K.activeRun || null;
    for (const key of Object.keys(defaults)) this._props[key] = pointProps.has(key) ? Point.from(props[key] || defaults[key]) : structuredClone(props[key] ?? defaults[key]);
    if (!this.name) this._props.name = this.constructor.name.toLowerCase();
  }
  get world() { let m = this; while(m.owner) m = m.owner; return m instanceof K.World ? m : null; }
  get bounds() { return new Rect(0,0,this.extent.x,this.extent.y); }
  get transform() { const c=Math.cos(this.rotation)*this.scale,s=Math.sin(this.rotation)*this.scale,p=this.position,o=this.origin; return new Transform(c,s,-s,c,p.x+o.x-c*o.x+s*o.y,p.y+o.y-s*o.x-c*o.y); }
  get globalTransform() { return this.owner ? this.owner.globalTransform.multiply(this.transform) : this.transform; }
  localize(p) { return this.globalTransform.inverse().apply(p); }
  globalize(p) { return this.globalTransform.apply(p); }
  containsPoint(p) { return this.bounds.contains(this.localize(p)); }
  morphAt(p) {
    if (!this.visible || (this.clip && !this.containsPoint(p))) return null;
    for (const child of [...this.submorphs].reverse()) { const hit = child.morphAt(p); if (hit) return hit; }
    return this.reactsToPointer && this.containsPoint(p) ? this : null;
  }
  addMorph(morph, index = this.submorphs.length) {
    if (!(morph instanceof Morph)) throw Error('addMorph expects a Morph.');
    for (let m=this; m; m=m.owner) if(m===morph) throw Error('A morph cannot contain itself.');
    morph.remove(); this.submorphs.splice(index,0,morph); morph.owner=this; this.changed('submorphs',null,morph); return morph;
  }
  remove() { if (!this.owner) return this; const owner=this.owner; owner.submorphs.splice(owner.submorphs.indexOf(this),1); this.owner=null; owner.changed('submorphs',null,this); return this; }
  bringToFront() { if(this.owner) this.owner.addMorph(this); return this; }
  withAllSubmorphs() { return [this, ...this.submorphs.flatMap(m=>m.withAllSubmorphs())]; }
  get(name) { return this.withAllSubmorphs().find(m=>m.name===name); }
  on(prop, fn) { if(!this._listeners.has(prop)) this._listeners.set(prop,new Set()); this._listeners.get(prop).add(fn); return ()=>this._listeners.get(prop)?.delete(fn); }
  changed(prop, oldValue, affected) {
    this._listeners.get(prop)?.forEach(fn=>fn(this[prop],oldValue)); this._listeners.get('*')?.forEach(fn=>fn(prop,this[prop]));
    const world=this.world; if(world) { world.dirty?.add(this); if(!this._tool) world.onChange?.(this,prop,affected); }
  }
  startStepping(ms = 16, method = 'step') { this._stepping={ms,method,last:null}; return this; }
  stopStepping() { this._stepping=null; return this; }
  addScript(fn, name) { return K.addScript(this,fn,name); }
  keep() { return K.keepMorph(this); }
  duplicate() { return K.cloneMorph(this); }
  onMouseDown() {}
  onMouseUp() {}
  onMouseMove() {}
  onHoverIn() {}
  onHoverOut() {}
  onDrag() {}
  onDrop() {}
  onKeyDown() {}
  onKeyUp() {}
  onWheel() {}
}
for(const key of Object.keys(defaults)) Object.defineProperty(Morph.prototype,key,{ configurable:true, enumerable:true,
  get(){return this._props[key];}, set(value){const old=this._props[key]; value=pointProps.has(key)?Point.from(value):value; if(JSON.stringify(old)===JSON.stringify(value))return; this._props[key]=value; this.changed(key,old);}});
K.classes = { Morph }; Object.assign(K,{Morph,defaults,pointProps});
if(typeof module!=='undefined')module.exports=K;
})();
