# Programs have two layers

A document contains a saved world and a main JavaScript script. The saved world contains morph properties, nested morphs, method source, and connections. The main script runs after that world loads.

## Saved and scripted morphs

Morphs created through the parts bin or tools belong to the saved world. Morphs created by the main script, its callbacks, or its managed timers are scripted morphs. A re-run removes them and their stepping, timers, and connections before running the new script. Saved morphs stay in place.

Direct edits to a scripted morph reset at the next run. Its halo offers Keep in world. This moves the morph and its children into the saved world. Methods from custom subclasses are flattened into scripts on their nearest kernel class so they can reload without the custom class definition.

```javascript
class Speck extends Ellipse {
  onMouseDown() { this.fill = Color.random(); }
}
const speck = world.addMorph(new Speck({position: pt(60, 180)}));
speck.keep();
```

Scripts installed on morphs should use this, world, and $('name') to find state. Their source is saved, so JavaScript closures over local main-script variables do not survive serialization. Store persistent data in morph properties, text, or items. Custom arbitrary properties are live but are not part of the v1 property schema.

## Kernel changes

The kernel is live. You can change Button.prototype.onMouseDown and all buttons will use the new behavior. Kernel changes do not belong to snapshots. Put a lasting patch in the main script. Restart world restores the original kernel.

## Execution and recovery

Run re-runs the main script. Resume continues stepping without re-running it. Pause stops all stepping and the managed setTimeout/setInterval APIs. A main script can use top-level await. Auto-run may repeat network calls and other side effects when you edit; disable it when that is undesirable.

Loops and function bodies are instrumented with a two-second synchronous execution budget. A stopped loop reports a LoopGuardError. Large synchronous browser builtins or pathological regular expressions can still freeze a tab. The heartbeat detects unresponsive frames where the browser keeps the editor responsive. After an unclean session the editor reopens paused.

## Document format

The JSON envelope uses format hashbin-diagram, version 1, type livelier, a src string, and livelier containing kernel: 1, autorun, and world. Worlds use v: 1 with root and connections. Serialization orders properties and scripts consistently and preserves morph IDs. Unknown classes load as Morph with a warning. Unsupported envelope or kernel versions produce an explanatory error.

A bare .js file opens with an empty world. The complete envelope is limited to 5 MiB. Local storage may fill earlier; download or save to HashBin if the draft status reports a storage problem.
