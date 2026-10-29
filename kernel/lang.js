/* Original Livelier kernel, MIT. Shared by the frame and Node tests. */
(() => {
const K = globalThis.Livelier = globalThis.Livelier || {};
class Point {
  constructor(x = 0, y = 0) { this.x = Number(x); this.y = Number(y); }
  add(p) { return new Point(this.x + p.x, this.y + p.y); }
  sub(p) { return new Point(this.x - p.x, this.y - p.y); }
  mul(n) { return new Point(this.x * n, this.y * n); }
  distanceTo(p) { return Math.hypot(this.x - p.x, this.y - p.y); }
  toJSON() { return { x: this.x, y: this.y }; }
  static from(p) { return p instanceof Point ? p : new Point(p?.x, p?.y); }
}
class Rect {
  constructor(x, y, width, height) { Object.assign(this, { x, y, width, height }); }
  contains(p) { return p.x >= this.x && p.y >= this.y && p.x <= this.x + this.width && p.y <= this.y + this.height; }
}
class Transform {
  constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) { Object.assign(this, { a, b, c, d, e, f }); }
  apply(p) { return new Point(this.a*p.x + this.c*p.y + this.e, this.b*p.x + this.d*p.y + this.f); }
  multiply(t) { return new Transform(this.a*t.a+this.c*t.b, this.b*t.a+this.d*t.b, this.a*t.c+this.c*t.d, this.b*t.c+this.d*t.d, this.a*t.e+this.c*t.f+this.e, this.b*t.e+this.d*t.f+this.f); }
  inverse() { const z = this.a*this.d-this.b*this.c; if (!z) throw Error('Transform is singular.'); return new Transform(this.d/z,-this.b/z,-this.c/z,this.a/z,(this.c*this.f-this.d*this.e)/z,(this.b*this.e-this.a*this.f)/z); }
}
let nextID = 1;
const id = () => 'm' + nextID++;
const reserveID = value => { const n = /^m(\d+)$/.exec(value); if (n) nextID = Math.max(nextID, Number(n[1])+1); };
const Color = { random: () => `hsl(${Math.floor(Math.random()*360)} 70% 60%)`, rgb: (r,g,b) => `rgb(${r},${g},${b})` };
Object.assign(K, { Point, pt: (x,y) => new Point(x,y), Rect, Transform, Color, id, reserveID });
if (typeof module !== 'undefined') module.exports = K;
})();
