(() => {
const K=globalThis.Livelier;
let delivering=new Set();
function connect(source,prop,target,method,{converter}={}) {
  if(!source?.on||!target)throw Error('Connections need a source morph and target.');
  const code=converter?K.functionSource(converter):null;
  const convert=code?K.compileFunction(code,{scope:K.scriptScope?.()||{},name:'connection.js'}):v=>v;
  const connection={source,prop,target,method,converter:code,run:K.activeRun,disconnect(){off();const world=source.world;world?.connections.delete(connection);world?.changed('connections',null,connection);}};
  const off=source.on(prop,value=>{if(delivering.has(connection))return;delivering.add(connection);try{const result=convert(value);if(typeof target[method]==='function')target[method](result);else target[method]=result;}finally{delivering.delete(connection);}});
  source.world?.connections.add(connection);source.world?.changed('connections',null,connection);return connection;
}
function disconnect(source,prop,target,method) { for(const c of [...source.world?.connections||[]])if(c.source===source&&(!prop||c.prop===prop)&&(!target||c.target===target)&&(!method||c.method===method))c.disconnect(); }
function disconnectAll(morph) { for(const c of [...morph.world?.connections||[]])if(c.source===morph||c.target===morph)c.disconnect(); }
Object.assign(K,{connect,disconnect,disconnectAll});
if(typeof module!=='undefined')module.exports=K;
})();
