(() => {
let sourcePromise;
class WorldHost {
  constructor(container,{onMessage=()=>{},onHang=()=>{}}={}){Object.assign(this,{container,onMessage,onHang});this.pending=new Map();this.sequence=0;this.generation=0;}
  async start(program,{run=true}={}) {
    this.destroy();const generation=++this.generation;
    sourcePromise ||= Promise.all(KernelFiles.map(async file=>{const response=await fetch(file+'?v=1');if(!response.ok)throw Error('Could not load '+file);return response.text();})).then(parts=>parts.join('\n;\n')).catch(e=>{sourcePromise=null;throw e;});
    const source=await sourcePromise;if(generation!==this.generation)return;
    const frame=document.createElement('iframe');frame.title='Live world';frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('allow','autoplay');
    const loaded=new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
    frame.srcdoc='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script>'+WorldBootstrap+'</scr'+'ipt></body></html>';
    this.container.replaceChildren(frame);this.frame=frame;await loaded;if(generation!==this.generation)return;
    const channel=new MessageChannel();this.port=channel.port1;this.lastBeat=Date.now();
    this.port.onmessage=({data})=>{
      if(!data||typeof data!=='object'||typeof data.type!=='string')return;
      let size;try{size=JSON.stringify(data).length;}catch(_){return;}if(size>6*1024*1024)return;
      if(data.type==='pong'){this.lastBeat=Date.now();return;}
      if(Number.isInteger(data.reply)&&this.pending.has(data.reply)){const {resolve,reject,timer}=this.pending.get(data.reply);clearTimeout(timer);this.pending.delete(data.reply);if(data.error)reject(Error(String(data.error)));else resolve(data.value);return;}
      if(['ready','changed','console','error','status','share'].includes(data.type))this.onMessage(data);
    };
    const initialized=new Promise((resolve,reject)=>{
      this.bootReady={resolve,reject};this.bootTimer=setTimeout(()=>reject(Error('Kernel boot timed out. Restart world.')),20000);
      const handler=this.port.onmessage;this.port.onmessage=event=>{
        if(event.data?.type==='ready'&&this.bootReady){clearTimeout(this.bootTimer);this.bootReady=null;this.request('load',{program,run}).then(resolve,reject);}
        handler(event);
      };
    });
    frame.contentWindow.postMessage({type:'livelier:boot',source},'*',[channel.port2]);
    this.watchdog=setInterval(()=>{if(document.hidden){this.lastBeat=Date.now();return;}this.port?.postMessage({type:'ping'});if(Date.now()-this.lastBeat>4000){this.onHang();clearInterval(this.watchdog);}},500);
    return initialized;
  }
  request(type,payload={}){if(!this.port)return Promise.reject(Error('World is loading.'));const id=++this.sequence;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('World request timed out. Restart world.'));},15000);this.pending.set(id,{resolve,reject,timer});this.port.postMessage({type,id,...payload});});}
  destroy(){this.generation++;clearInterval(this.watchdog);clearTimeout(this.bootTimer);this.bootReady?.reject(Error('World restarted.'));this.bootReady=null;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('World restarted.'));}this.pending.clear();this.port?.close();this.port=null;this.frame?.remove();}
}
globalThis.WorldHost=WorldHost;
})();
