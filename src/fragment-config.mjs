import * as kit from '../vendor/fragment-kit-v0.3.5/src/index.js';
import appConfig from '../fragment-kit.config.json' with {type:'json'};
export const config=kit.createConfig(appConfig);
export const emptyWorld=()=>({v:1,root:{class:'World',props:{},submorphs:[]},connections:[]});
export const type={type:'livelier',settingsKeys:[],fileName:'livelier.json',contentType:'application/json',normalize({src,livelier={}}){
 if(typeof src!=='string')throw Error('Source must be text.');
 if(livelier.kernel!=null&&livelier.kernel!==1)throw Error('Unsupported kernel version. See docs/program-model.html.');
 const world=livelier.world??emptyWorld();
 if(world.v!==1||!world.root||typeof world.root!=='object'||Array.isArray(world.root))throw Error('Unsupported world version. See docs/program-model.html.');
 return {src,livelier:{kernel:1,autorun:livelier.autorun!==false,world}};
},isDefault:doc=>doc.livelier.autorun&&JSON.stringify(doc.livelier.world)===JSON.stringify(emptyWorld())};
export const legacyWriter=(doc,{url,run,view,compress,documents})=>{url.searchParams.set(type.isDefault(doc)?'compressed':'doc',compress(type.isDefault(doc)?doc.src:documents.serialize(doc)));if(run===false)url.searchParams.set('run','0');if(view)url.searchParams.set('view',view);return url.href;};
export const urlState=kit.createUrlState({config,type,legacyWriter,delay:0});
export const HashBinDocuments={...urlState.documents,emptyWorld,MAX_BYTES:config.maxBytes,link:urlState.link,...Object.fromEntries(['bytes','encode64','decode64','isCID','cidLength','verify'].map(key=>[key,kit[key]])),cid:value=>kit.cid(value,config.allowedHosts)};
export function publishTransactions(storage){
 const prefix='livelier:hashbin:return:';
 return storage?{getItem:key=>storage.getItem(prefix+key),setItem:(key,value)=>storage.setItem(prefix+key,value),removeItem:key=>storage.removeItem(prefix+key)}:undefined;
}
export class HashBinStore extends kit.HashBinStore{constructor(options={}){let storage;try{storage=globalThis.sessionStorage;}catch{}super({config,type,transactionStorage:publishTransactions(storage),...options});}}
export const ShareLinks={build:({url,run,view,...doc})=>urlState.build(doc,{url,run,view}),parse:href=>{const intent=urlState.parse(href);return intent.kind==='none'?null:{...intent,...intent.doc};}};
export const LZString={compressToEncodedURIComponent:kit.compress,decompressFromEncodedURIComponent:kit.decompress};
export {ShareClient} from '../vendor/fragment-kit-v0.3.5/src/index.js';
