import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync} from 'node:child_process';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=path.resolve(new URL('../',import.meta.url).pathname);let count=0;
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){if(['node_modules','.git','test-results'].includes(e.name))continue;const file=path.join(dir,e.name);if(e.isDirectory())await walk(file);else if(/\.(?:js|cjs|mjs)$/.test(e.name)){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status)throw Error(result.stderr);count++;}}}
await walk(root);
for(const script of [['scripts/render-docs.mjs','--check'],['scripts/render-gallery.mjs','--check'],['scripts/update-offline.mjs','--check']]){const result=spawnSync(process.execPath,script,{cwd:root,encoding:'utf8'});if(result.status)throw Error(result.stdout+result.stderr);console.log(result.stdout.trim());}
const html=await fs.readFile(path.join(root,'index.html'),'utf8');for(const match of html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)){const ref=match[1];if(/^(?:https?:|#|\.\/)/.test(ref))continue;await fs.access(path.join(root,ref));}
for(const name of ['src/app.js','src/world-host.js','src/program.js']){const src=await fs.readFile(path.join(root,name),'utf8');if(/\beval\s*\(|new\s+Function\s*\(/.test(src))throw Error('Shell code must never evaluate strings: '+name);}
for(const file of require('../src/kernel-files.js'))await fs.access(path.join(root,file));console.log(count+' JavaScript files checked; shell execution contract holds.');

for(const script of [['vendor/fragment-kit-v0.3.3/tools/check.mjs','--config','fragment-kit.config.json'],['scripts/render-world-previews.mjs','--check']]){const result=spawnSync(process.execPath,script,{cwd:root,stdio:'inherit'});if(result.status)process.exit(result.status);}

const {createHash}=await import('node:crypto'),bootstrap=require('../src/world-bootstrap.js'),config=JSON.parse(await fs.readFile(path.join(root,'fragment-kit.config.json'),'utf8')),expected='sha256-'+createHash('sha256').update(bootstrap).digest('base64');if(config.worldBootstrapHash!==expected||!html.includes(expected))throw Error('Original world bootstrap CSP pin mismatch.');
