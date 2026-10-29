(() => {
// Keep byte-identical to the hash in index.html; npm run offline regenerates it.
const source=`addEventListener('message', function boot(event) {
  if (event.source !== parent || event.data?.type !== 'livelier:boot' || !event.ports[0] || typeof event.data.source !== 'string') return;
  removeEventListener('message', boot);
  globalThis.livelierPort = event.ports[0];
  try { new Function(event.data.source)(); }
  catch (error) { livelierPort.postMessage({type:'error', message:String(error.message).slice(0,2000)}); }
});`;
if(typeof module!=='undefined')module.exports=source;else globalThis.WorldBootstrap=source;
})();
