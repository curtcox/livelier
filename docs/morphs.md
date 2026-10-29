# Morph reference

Every morph has an owner and ordered submorphs. The world is the root. All geometry values are in world units; rotations are radians. Use pt(x, y) to make a Point.

## Classes

| Class | Purpose | Notable properties |
| --- | --- | --- |
| Morph | Rectangle and container | fill, borderRadius, acceptsDrops |
| Ellipse | Circle or ellipse | extent, fill, borderWidth |
| Path | Open or closed vector path | vertices, closed, stroke, strokeWidth |
| Text | Editable plain text | text, editable, fontSize |
| Label | Noneditable text | text, fontFamily, textAlign |
| Image | Browser image | url (https or image data URI) |
| Button | Clickable control | text; action or onMouseUp |
| Slider | Numeric range input | min, max, value |
| List | Selectable list | items, selection (index) |
| Window | Tool or content window | title, minimized |
| HTMLMorph | Arbitrary HTML in the sandbox | html |
| CanvasMorph | 2D drawing surface | context, draw(callback) |
| World | Root, scheduler, and hand | paused, zoom, pan, hand |

The Image name in user script scope refers to the morph class. To construct a native browser image, use document.createElement('img').

## Common properties

position, extent, and origin are Points. Replace a Point to notify the system: morph.position = morph.position.add(pt(10, 0)). Mutating morph.position.x directly does not notify the renderer or bindings. The same applies to arrays such as items and vertices: assign a new array.

rotation, scale, opacity, visible, clip, shadow (CSS box shadow), reactsToPointer, draggable, grabbable, and acceptsDrops control behavior. fill accepts a CSS color; rectangles also accept CSS gradient strings. Borders use borderWidth, borderColor, borderRadius, and borderStyle. Text uses fontFamily, fontSize, fontColor, and textAlign. HTMLMorph content executes only within the sandbox’s permissions and CSP.

Images can retain https URLs or embed data URIs. Remote images need a network connection and may require CORS for canvas exports. Downscale an image before embedding it when the whole document would exceed 5 MiB. HTMLMorph content is intentionally omitted from standalone vector export; SVG exports represent the world’s shapes, controls, text, paths, images, and canvases.

## Tree and geometry

```javascript
const panel = world.addMorph(new Morph({acceptsDrops: true}));
const title = panel.addMorph(new Label({text: 'A panel'}));
title.remove();
panel.bringToFront();
const found = world.get('panel'); // also available as $('panel')
const globalPoint = panel.globalize(pt(0, 0));
const localPoint = panel.localize(globalPoint);
```

addMorph(morph, index) reparents and inserts at a chosen index. duplicate() makes a copy with fresh IDs. keep() preserves a scripted morph. Local/global transforms include owners’ position, origin, rotation, and scale. morphAt(point) searches the topmost visible morph with pointer reactions; clipping limits children’s hit testing.

## Events

Override onMouseDown, onMouseUp, onMouseMove, onHoverIn, onHoverOut, onDrag, onDrop, onKeyDown, onKeyUp, or onWheel using addScript. Pointer dispatch supports mouse, pen, and touch. The hand reassigns a grabbed morph to a container with acceptsDrops. Keyboard events go to the focused morph. Native controls and text editing retain native input handling.

## Drawing

```javascript
const paper = world.addMorph(new CanvasMorph({extent: pt(300, 180)}));
paper.draw(ctx => {
  ctx.fillStyle = 'tomato';
  ctx.fillRect(25, 25, 100, 80);
});
```
