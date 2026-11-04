import {mountGallery} from '../vendor/fragment-kit-v0.3.3/src/index.js';
import {urlState} from './fragment-config.mjs';
mountGallery({container:document.getElementById('gallery'),catalog:Examples.map(example=>({...example,cover:'gallery/covers/'+example.id+'.png'})),urlState:{build:doc=>urlState.build(doc,{url:new URL('./',location.href).href})}});
document.querySelector('.fk-gallery-filters input').id='search';document.querySelector('.fk-gallery-filters select').id='tag';
