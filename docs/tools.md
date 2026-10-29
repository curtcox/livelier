# Live tools

Tool windows belong to the world. They are transient and are not included in saved documents. Drag their title bars, resize at the lower corner, minimize with −, or close with ×. Tool views use native controls and Ace where appropriate.

## Halo

Alt-click, Ctrl/Cmd-click, long-press, or use Halo mode to select a morph. The handles move, resize, rotate, scale, grab, duplicate, delete, edit style, inspect, edit scripts, and open the morph menu. Drag Grab into a container to reparent while preserving the drop position. Edit the name above the halo. Scripted morphs offer Keep in world and explain that unkept changes reset on the next run.

## Workspace

Open ƒ Workspace in the footer or the world menu. Select some code or use the whole buffer. Ctrl/Cmd+D does it; Ctrl/Cmd+P prints the final expression; Ctrl/Cmd+I inspects it. Errors appear in the output and Console. Main script variables are not workspace globals; use world and morph names to navigate the world.

## Inspector

The i handle opens a property tree. Expand nested objects and edit primitive leaves. Numeric and boolean leaves use JSON syntax. Edits go through property setters and undo. The evaluator binds this to the inspected object. Functions and morph IDs are not editable leaves.

## Object editor

The ƒ handle lists stored scripts and templates for onMouseDown, onMouseUp, and step. Save script compiles and installs the method; syntax errors appear inline. Start stepping runs the step method. The lower part lists existing connections and accepts a source property, target morph name, target property or method, and optional converter.

## Parts bin and style editor

Parts contains all v1 classes, a sticky note, a labeled slider, and a clock face. Drag a part out on desktop or tap it to add it. Style exposes fill, borders, radius, opacity, shadow, font, and alignment. Property edits are undoable. Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z act on direct manipulation rather than main-script execution.
