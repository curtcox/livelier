(() => {
const K=globalThis.Livelier;
class Hand {
  constructor(world) { this.world=world; this.grabbed=null; }
  grab(morph) { this.grabbed=morph; return morph; }
  drop(target) { const m=this.grabbed; if(!m)return; const pos=m.globalize(K.pt(0,0)); if(target?.acceptsDrops && target!==m && !m.withAllSubmorphs().includes(target)) { target.addMorph(m); m.position=target.localize(pos); target.onDrop(m); } this.grabbed=null; }
}
class World extends K.Morph {
  constructor(p={}) { super({name:'world',extent:K.pt(1000,800),fill:'#f7f8f0',acceptsDrops:true,draggable:false,...p}); this.dirty=new Set([this]); this.hand=new Hand(this); this.paused=true; this.focusedMorph=null; this.connections=new Set(); this.timers=new Set(); this.runID=0; this.zoom=1; this.pan=K.pt(0,0); }
  tick(now) { this.now=now;if(this.paused)return; for(const m of this.withAllSubmorphs()) { const s=m._stepping; if(!s)continue; if(s.last===null||now-s.last>=s.ms){s.last=now;try{m[s.method]?.();}catch(e){m.stopStepping();K.reportError?.(e);}}} }
  focus(morph) { this.focusedMorph=morph; }
  pause() { this.paused=true; }
  resume() { this.paused=false; for(const m of this.withAllSubmorphs())if(m._stepping)m._stepping.last=null; }
  clearRun() { for(const m of this.withAllSubmorphs()) if(m!==this && m._run) {m.stopStepping();m.remove();} for(const c of [...this.connections])if(c.run || c.source._run || c.target._run)c.disconnect(); for(const t of [...this.timers])if(t.run){t.cancel();this.timers.delete(t);} }
  userTimer(fn,delay,repeat=false) { const timer={run:K.activeRun,elapsed:0,last:null,cancel:()=>this.timers.delete(timer)}; const morph=new K.Morph({visible:false,reactsToPointer:false,extent:K.pt(0,0)}); morph._tool=true; morph._run=timer.run; morph.step=()=>{const run=K.activeRun;K.activeRun=timer.run;try{fn();}finally{K.activeRun=run;}if(!repeat){morph.remove();timer.cancel();}}; morph.startStepping(delay,'step');morph._stepping.last=this.now??performance.now();this.addMorph(morph); timer.cancel=()=>{morph.remove();this.timers.delete(timer);}; this.timers.add(timer); return timer; }
  exportSVG() { return K.exportSVG(this); }
}
Object.assign(K,{World,Hand}); K.classes.World=World;
if(typeof module!=='undefined')module.exports=K;
})();
