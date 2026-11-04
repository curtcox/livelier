import fs from 'node:fs/promises';import {createHash} from 'node:crypto';import {createRequire} from 'node:module';
const root=new URL('../',import.meta.url),require=createRequire(import.meta.url),bootstrap=require('../src/world-bootstrap.js');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const htmlURL=new URL('index.html',root),html=await fs.readFile(htmlURL,'utf8'),hash="'sha256-"+createHash('sha256').update(bootstrap).digest('base64')+"'";
const updated=html.replace(/'sha256-[A-Za-z0-9+/=]+'/g,hash);
if(process.argv.includes('--check')){if(html!==updated)throw Error('Bootstrap CSP hash is stale.');}else if(updated!==html)await fs.writeFile(htmlURL,updated);
const {generateOffline}=await import('../vendor/fragment-kit-v0.3.3/tools/offline-assets.mjs');
const manifest=await generateOffline('offline.config.json',process.argv.includes('--check'));console.log(manifest.version+': '+manifest.assets.length+' verified assets');
