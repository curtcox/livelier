(() => {
const K=globalThis.Livelier,{Morph,pt}=K;
class Ellipse extends Morph { containsPoint(p) { const q=this.localize(p),r=this.extent; return ((q.x-r.x/2)/(r.x/2))**2+((q.y-r.y/2)/(r.y/2))**2<=1; } }
class Path extends Morph { constructor(p={}) { super({fill:'transparent',...p}); } }
class Text extends Morph { constructor(p={}) { super({fill:'transparent',editable:true,...p}); } }
class Label extends Text { constructor(p={}) { super({editable:false,...p}); } }
class Image extends Morph { constructor(p={}) { super({fill:'transparent',...p}); } }
class Button extends Morph { constructor(p={}) { super({text:'Button',fill:'#254f43',fontColor:'white',borderRadius:8,extent:pt(130,42),draggable:false,...p}); } onMouseUp(evt) { if(this.action) this.action(evt); } }
class Slider extends Morph { constructor(p={}) { super({extent:pt(200,40),fill:'transparent',draggable:false,...p}); } }
class List extends Morph { constructor(p={}) { super({extent:pt(220,180),fill:'#ffffff',draggable:false,...p}); } }
class Window extends Morph { constructor(p={}) { super({extent:pt(340,260),fill:'#fcfcf8',borderWidth:1,borderColor:'#b5c4b8',shadow:'0 8px 28px #14251e26',acceptsDrops:true,...p}); } }
class HTMLMorph extends Morph { constructor(p={}) { super({fill:'transparent',...p}); } }
class CanvasMorph extends Morph { constructor(p={}) { super({fill:'#fff',...p}); } get context() { return this._canvas?.getContext('2d'); } draw(fn) { this._draw=fn; this.changed('canvas'); return this; } }
Object.assign(K,{Ellipse,Path,Text,Label,Image,Button,Slider,List,Window,HTMLMorph,CanvasMorph});
Object.assign(K.classes,{Ellipse,Path,Text,Label,Image,Button,Slider,List,Window,HTMLMorph,CanvasMorph});
if(typeof module!=='undefined') module.exports=K;
})();
