# A world you can change

Livelier is a live programming playground. Shapes, text, controls, and your tools share a world. There is no build step or server runtime. Start with the [sample gallery](../gallery.html), or open the [editor](../index.html).

## Make something yours

1. Alt-click a shape (Option on a Mac), Ctrl/Cmd-click, or long-press on touch to open its halo.
2. Drag the move handle. Try resize, rotate, or scale. The name above the halo is editable.
3. Choose the color handle to change its style, the i handle to inspect it, or ƒ to edit its scripts.
4. Open Parts to add a shape, control, or composite part. Drag a part out on desktop, or tap it on touch.
5. Use Undo in the world menu or Ctrl/Cmd+Z to reverse a tool edit.

The main script runs in the Code pane. Run executes it now; Auto-run waits 750 milliseconds after an edit. Pause stops stepping and managed timers. Restart world reloads the last saved world without running the main script.

## Try JavaScript

```javascript
const box = world.addMorph(new Morph({
  name: 'box', position: pt(50, 160),
  extent: pt(140, 100), fill: '#9bb6cf'
}));
box.addScript(function onMouseDown() {
  this.fill = Color.random();
});
```

Open Workspace to evaluate smaller ideas. Do it runs the selected text (or all text); Print it also displays its result; Inspect it opens an inspector on that result. Top-level await works. Use this inside the inspector’s evaluator to refer to the inspected object.

## Save and share

The editor saves a local draft on this device. Share produces a URL containing the program. Download keeps a whole program as livelier.json. QR code transfers the link to another device. Large worlds need a short HashBin CID link; saving to HashBin requires the project’s public client registration, while loading works immediately.

A linked world asks before replacing an existing draft. To open a linked program without executing it, use Don’t run on open in Share. Read the [program model](program-model.md), [tools guide](tools.md), and [sharing guide](sharing.md) next.

## Touch

World is the first phone tab. Switch to Code or Console when needed. Long-press for a halo; use Halo mode to select with a tap. Pinch to zoom from 0.25× to 4×, or drag with two fingers to pan. Fit resets zoom and pan. Use More for saving, opening files, and less frequent tools.
