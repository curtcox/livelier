import {createRequire} from 'node:module';
const examples=createRequire(import.meta.url)('./src/examples.js');
export default {catalog:examples.map(example=>({...example,cover:'gallery/previews/'+example.id+'.svg'})),output:'gallery/covers',dependencies:['src/examples.js','scripts/render-world-previews.mjs',...examples.map(example=>'gallery/previews/'+example.id+'.svg')],async renderCover(page,example){await page.goto(new URL(example.cover,process.env.GALLERY_BASE_URL??'http://127.0.0.1:8000/').href);return page.locator('svg');}};
