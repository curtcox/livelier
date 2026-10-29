# Livelier — master plan

A static GitHub Pages site where people build live, direct-manipulation programs in the browser
and share them, the way [Python Online](https://curtcox.github.io/PythonOnline/) works for Python.
It follows the idea behind the [Lively Kernel](https://www.lively-kernel.org/): the system comes
live off a web page, it can change itself and create new content, and it can save what you made
as a new page someone else can open. There is no server. The kernel, its tools and your program
all run in the page.

Published at **https://curtcox.github.io/livelier/**. The GitHub repo is `curtcox/livelier`
(lowercase), and the Pages path and HashBin return URL must match that casing exactly.

## Decisions (agreed)

| Topic | Decision |
|---|---|
| Engine | **A new, original Lively-style kernel** written for this repo in plain JavaScript, with no build step. It has a world of morphs, halos for direct manipulation, an inspector, a workspace (do-it / print-it / inspect-it), per-morph scripts, connections, a parts bin, and worlds serialized as JSON. No Lively Kernel, lively.next or Lively4 code is copied. lively.next was ruled out because its IDE needs its Node server and only frozen app bundles host statically. |
| Program | **Both world and script.** A program is a saved **world** (morphs built by direct manipulation, with their properties, scripts and connections) plus a **main script** (JavaScript that runs after the world loads and re-runs on edit). See **Program model**. |
| Name | **Livelier.** It is unofficial and not affiliated with HPI or the Lively Kernel project. The README credits Lively as the inspiration. |
| Publishing | The same `deploy.yml` as PythonOnline: on a push to `main`, upload the repo root with `actions/upload-pages-artifact@v3` and deploy with `actions/deploy-pages@v4`. No build step. Deployment does not wait for tests. |
| Lineage features | Links to docs and the gallery, a mobile-friendly layout, loading and saving through HashBin, and QR codes of the URL (see **Lineage features**). |
| v1 extras | **Sandboxed execution** (shared worlds never run with the editor's origin), an **offline / installable PWA**, **cross-browser CI** (Node unit tests plus Playwright on Chromium, Firefox and WebKit), and the **is.gd link shortener** with compressed lz-string links. |
| HashBin | You register a new "Livelier" app. The code ships with an empty `hashbin-client-id` meta tag until then. Loading works without it. |
| Workflow | Direct commits on `main` with frequent pushes, as for PythonOnline. Say so if you'd rather have a branch and PR per phase. |

## What I checked before planning

- **PythonOnline** (`curtcox/PythonOnline`, 20 commits): its `deploy.yml` and `test.yml`, its
  layout, and the code worth copying: `hashbin.js` and `hashbin-panel.js` (HashBin Publish, no
  OAuth tokens on the shared origin), `share-links.js` (with the is.gd and AllOrigins shortener),
  `qr.js` (Project Nayuki, MIT), `render-scheduler.js`, `offline.js`, the hash-verified
  `service-worker.js`, `scripts/render-docs.mjs`, `scripts/check.mjs`, the gallery page, the
  vendored HashBin SDK v0.4.0 (`hashbin-sdk-v0.4.0.mjs`, `hashbin-cache-v0.4.0.js`), and Ace 1.4.1.
- **lively.next** (MIT, active): its README says it needs Node 24, Bun and Rust, runs a local
  server at `localhost:9011`, and warns against deploying it openly on the web. Only frozen app
  bundles can be served from any host. Hosting its IDE statically would mean replacing its module,
  file and storage server layers.
- **Classic Lively Kernel** (`LivelyKernel/LivelyKernel`, MIT, 64 MB repo, last pushed 2024) saved
  worlds over WebDAV. **Lively4** (`lively4-core`) is already served from GitHub Pages, but it uses
  web components and Markdown, not Morphic.
- **The HashBin SDK sandbox** (`createSandbox`) runs code in a *worker* inside an opaque-origin
  iframe. Workers have no DOM, but morphs render into the DOM. Livelier therefore uses its own
  opaque-origin **world frame** with a DOM, built on the same principles (see **Security**).
- **acorn 8.19.0** (MIT) is the current release. It is small enough to vendor and is used to
  instrument user code.
- `curtcox.github.io` is one origin shared by all of this account's Pages apps (PythonOnline,
  ManimOnline, GnuplotOnline…). Shared links run arbitrary JavaScript on open, so user code must
  never run with that origin.

## Lineage features

1. **Links to docs and the gallery.** The *More* panel has a docs row: *Livelier guide ↗*
   (`docs/getting-started.html`), *Morph reference ↗* (`docs/morphs.html`), *JavaScript ↗*
   (MDN JavaScript Guide), *Lively Kernel ↗* (https://www.lively-kernel.org/), *lively.next ↗*
   (https://github.com/LivelyKernel/lively.next), and *Sample gallery ↗* (`gallery.html`). The
   pane heading has *Explore samples ↗*. Each gallery card links to the docs page it shows off,
   and error messages for unsupported features link to the relevant guide.
2. **Mobile friendly.** At `max-width: 760px` or `max-height: 500px`: *World / Code / Console*
   tabs with World first, a prominent Run/Pause, rarely used controls behind *More*, 40 px touch
   targets, 16 px inputs so iOS does not zoom, and `100dvh`. Inside the world: long-press opens the
   halo or menu, a *Halo mode* toggle makes a tap open halos, and pinch zooms the world. See
   **Mobile**.
3. **HashBin load and save.** Copy `hashbin.js` and `hashbin-panel.js` from PythonOnline and
   adapt the document envelope (see **HashBin**). `#<cid>` URLs load automatically. Saving uses
   HashBin Publish, so this page never holds a HashBin credential. The source and world survive
   the publish redirect, whether the save is approved or cancelled.
4. **QR code of the URL.** Copy `qr.js` and its dialog. It uses the saved CID link when the
   program still matches that save, and otherwise the compressed document link. It offers SVG and
   PNG downloads. It warns about local hosts, dense codes (version above 20) and overlong URLs, and
   suggests HashBin. Worlds can be large, so this warning will be common, and HashBin is the
   answer.
5. **From GraphvizOnline:** the Ace editor, debounced auto-run on edit, the draggable splitter,
   the *Hide editor* toggle (here it gives a full-window world, the classic Lively view), the share
   link box, *Download*, and the fork-on-GitHub link. Keep `LICENSE-graphvizonline`.

## Repository layout

```
.github/workflows/deploy.yml     # copied from PythonOnline unchanged
.github/workflows/test.yml       # unit + check + Playwright matrix (chromium, firefox, webkit)
index.html                       # shell page: toolbar, Code pane, Console, world frame host, dialogs
gallery.html                     # sample gallery
manifest.webmanifest, icon.svg, icons/   # PWA install (own icon, not Lively's)
service-worker.js                # hash-verified offline cache (adapted)
offline-assets.js                # files to precache with SHA-256 hashes (generated)
ace/                             # Ace 1.4.1: ace.js, mode-javascript, worker-less, theme, ext-language_tools, LICENSE
vendor/                          # hashbin-sdk-v0.4.0.mjs, hashbin-cache-v0.4.0.js, lz-string.min.js, acorn.js (8.19.0) + licenses
src/app.js, src/app.css          # shell glue and styles
src/world-host.js                # creates/destroys the world frame; message protocol; heartbeat watchdog
src/world-bootstrap.js           # source of the tiny inline frame bootstrap (its hash is pinned in the CSP)
src/program.js                   # document model: {src, world, autorun}; fingerprint; local draft
src/console-view.js              # Console pane: ordered log/error entries, click-to-line
src/hashbin.js, src/hashbin-panel.js     # adapted / copied
src/share-links.js               # adapted (#, ?compressed=, ?doc=, ?example=, ?run=0, CID)
src/qr.js, src/render-scheduler.js, src/offline.js   # copied
src/export.js                    # downloads: livelier.json, main.js, world.svg, world.png, console.txt
src/examples.js                  # gallery catalog (id, title, tags, description, docs link, document)
src/gallery.js, src/gallery.css  # gallery page
kernel/                          # everything that runs inside the world frame
  lang.js                        # small helpers: geometry (Point, Rect, Transform), color, ids
  morph.js                       # Morph model (no DOM): tree, geometry, properties, change events
  morphs/*.js                    # Ellipse, Path, Text, Label, Image, Button, Slider, List, Window, HTMLMorph, CanvasMorph
  world.js                       # World, Hand (pointer + grabbed morphs), stepping, focus
  render-dom.js                  # renders morphs to DOM/SVG with a dirty-flag rAF loop
  events.js                      # pointer/keyboard/wheel dispatch, drag & drop, long-press, pinch
  compiler.js                    # acorn-based instrumentation: loop guard, last-expression value, async wrap
  scripts.js                     # addScript / per-morph methods, source kept for serialization
  bindings.js                    # connect(source, 'prop', target, 'method', {converter})
  serializer.js                  # deterministic world snapshot <-> morph tree
  undo.js                        # undo/redo for direct manipulation
  halo.js                        # halo handles
  menu.js                        # world/morph context menus
  tools/workspace.js, tools/inspector.js, tools/object-editor.js, tools/parts-bin.js, tools/style-editor.js
  export-svg.js                  # world -> standalone SVG (downloads, gallery covers)
  bridge.js                      # frame side of the message protocol; console forwarding
  boot.js                        # loads the kernel into the frame and starts the world
examples/<id>.json               # sample documents (kept in sync with examples.js)
gallery/previews/<id>.svg        # generated covers, committed
docs/*.md, docs/*.html           # guides (Markdown source, rendered HTML)
scripts/render-gallery.mjs       # loads each sample in headless Chromium, writes covers + fingerprints
scripts/render-docs.mjs          # copied
scripts/update-offline.mjs       # rewrites offline-assets.js with content hashes
scripts/check.mjs                # node --check on every script + consistency checks
tests/*.test.js                  # node --test: kernel model, compiler, serializer, sharing, hashbin, qr, offline
tests/browser/all.cjs            # Playwright suite
README.md, AGENTS.md, LICENSE, LICENSE-graphvizonline, todo/master_plan.md
package.json                     # devDependencies only: playwright (pinned)
```

The scripts are plain `<script>` files with `?v=N` cache busters. Modules export through
`module.exports` or `globalThis`, so the same files run in the browser and under `node --test`.
Kernel files never touch the DOM except `render-dom.js`, `events.js`, `export-svg.js`, the tools'
views and `boot.js`. That keeps the model, compiler and serializer testable in Node without jsdom.

## Program model

A Livelier document has two layers:

1. **The saved world.** These are morphs you made by hand, from the parts bin or kept from a
   script. A morph keeps its class, properties, submorphs, scripts (source text) and connections.
   This layer is what direct manipulation edits, and it is serialized into the document.
2. **The main script.** This is JavaScript in the Code pane. It runs after the saved world loads,
   with `world`, `$('name')`, the morph classes, `connect` and `inspect` in scope. Top-level
   `await` works. Morphs the script creates are **scripted morphs**: they are tagged with the run
   that made them, and they are not saved.

**Running.** With *Auto-run* on (the default, remembered locally), editing the main script waits
750 ms and then *re-runs*. Re-running removes scripted morphs, stops their stepping, timers and
connections, and runs the script again. The saved world stays as it is. *Run* (Ctrl/Cmd+Enter)
does the same on demand. *Pause* stops all stepping and user timers in the world. *Restart world*
reloads the frame from the last snapshot. Use it after a script has broken kernel state (the
kernel is live and scripts can change it).

**Keeping scripted morphs.** Direct manipulation of a scripted morph works, but the halo label
says "Made by the main script. Changes reset on the next run." A **Keep in world** command moves
it into the saved world. Its methods from user-defined classes are copied as scripts, flattened up
to the nearest kernel class, so they serialize.

**Changing the kernel.** Scripts and do-its can redefine kernel methods live. Those changes are
not part of the snapshot. To keep a kernel change, put it in the main script. The docs say this
plainly, and the gallery has a sample that does it.

**Document envelope** (same family as the siblings, so hashbin.org treats them alike):

```json
{ "format": "hashbin-diagram", "version": 1, "type": "livelier",
  "src": "const ball = new Ellipse({ extent: pt(40, 40), fill: 'tomato' });\nworld.addMorph(ball);",
  "livelier": { "kernel": 1, "autorun": true,
    "world": { "v": 1, "root": { "class": "World", "props": {}, "submorphs": [] }, "connections": [] } } }
```

A bare `.js` file loads as a main script with an empty world. `kernel` and `world.v` versions allow
later migrations. The serializer writes properties in a fixed order with stable morph IDs, so an
unchanged world always serializes to the same bytes and the same CID. The limit is 5 MiB for the
whole envelope, as in PythonOnline.

**Local draft.** The shell keeps `{src, world, autorun}` in `localStorage` under `livelier:` keys.
When the frame reports a change, the shell waits 1 s, asks for a snapshot and stores it (in a
try/catch). If it is too large for storage, the status says so and suggests HashBin. Links never
silently replace the stored program: share, sample and CID links ask first, as PythonOnline does.

## Kernel design

**Morphs (`kernel/morph.js`, `kernel/morphs/*`).** A `Morph` has a name, position, extent, origin,
rotation, scale, fill (color or gradient), border (width, color, radius, style), opacity,
visibility, clipping, a drop shadow, `reactsToPointer`, `draggable`, `grabbable` and
`acceptsDrops`, plus its `submorphs` and `owner`. It has local/global transforms and hit testing.
Property setters fire change notifications, which drive rendering, connections, undo and the
"changed" signal to the shell.

v1 classes:

- `Morph` (rectangle)
- `Ellipse`
- `Path` (vertices, closed/open, stroke)
- `Text` (editable, rich enough for font, size, color and alignment)
- `Label`
- `Image` (data URI or https URL)
- `Button`
- `Slider`
- `List`
- `Window` (title bar, close, minimize, resize)
- `HTMLMorph` (arbitrary HTML, allowed because the frame is sandboxed)
- `CanvasMorph` (a 2D canvas the script draws on)
- `World`

**World and hand (`kernel/world.js`).** The world owns the step loop: `morph.startStepping(ms,
'method')`, one rAF-driven scheduler, all paused by *Pause* and while `?run=0`. The **hand** is the
pointer. It grabs morphs (drag with the halo grab handle, or drag a `grabbable` morph) and drops
them into another morph that `acceptsDrops`, which reparents them. Lively worlds are built this
way. The world also tracks keyboard focus.

**Rendering (`kernel/render-dom.js`).** Each morph is an absolutely positioned element with CSS
transforms. Paths and ellipses use inline SVG. Text uses a `contenteditable` element limited to
plain text, so it is real, selectable and accessible text. Changes mark morphs dirty, and one rAF
pass updates only the dirty ones.

**Events (`kernel/events.js`).** Pointer events cover mouse, touch and pen. Morphs receive
`onMouseDown`, `onMouseUp`, `onMouseMove`, `onHoverIn`, `onHoverOut`, `onDrag`, `onDrop`,
`onKeyDown`, `onKeyUp` and `onWheel`. Kernel defaults are overridable by scripts. Alt-click
(Option on macOS) or Cmd/Ctrl-click opens a halo, right-click opens a menu, and on touch a
500 ms long-press does both. Pinch zooms and two-finger drag pans the world.

**Compiler (`kernel/compiler.js`).** Every piece of user code (main script, do-its, morph scripts,
connection converters) is parsed with acorn and spliced, without regenerating code, so columns
stay true:

- *Loop guard.* `__lg()` is inserted at the top of every loop body and function body; bodies
  without braces get braces. The first guard call in a synchronous stretch records the time and
  queues a microtask that clears it. The microtask can only run once the stretch ends, so a guard
  that finds more than **2 s** elapsed (sampled every 1,024 calls) throws a `LoopGuardError`:
  "This code ran for 2 seconds without pausing, so Livelier stopped it." It keeps throwing until
  the stretch ends, so a `try/catch` inside the loop cannot swallow it. Background-tab timer
  throttling does not cause false stops.
- *Last-expression value* for print-it: if the last statement is an expression, it becomes the
  return value.
- *Async wrap*, so `await` works at the top level of the main script and do-its.
- Each compiled unit gets a `//# sourceURL` (e.g. `main.js`, `scripts/ball/onMouseDown`) and a line
  map. Errors report the right line, and main-script errors put an Ace annotation and gutter marker
  on that line.

Kernel code itself is trusted and not instrumented.

**Scripts and connections (`kernel/scripts.js`, `kernel/bindings.js`).**
`morph.addScript(function onMouseDown(evt) { this.fill = Color.random(); })` installs an own method
and keeps its source. `connect(slider, 'value', box, 'opacity', { converter: v => v / 100 })` sets
up a data binding, à la lively.bindings. Connections and their converter sources serialize.
`disconnect` and `disconnectAll` undo them. Scripted morphs' connections are removed on re-run.

**Serializer (`kernel/serializer.js`).** Morph tree to snapshot JSON and back. It handles kernel
classes only: user-class behavior is kept as scripts (see **Keep in world**). Images are embedded
as data URIs or kept as https URLs. Unknown classes or properties in a snapshot load as plain
morphs with a warning in the Console, so a newer document degrades instead of failing. A
round-trip is byte-identical.

**Undo (`kernel/undo.js`).** Records move, resize, rotate, scale, delete, duplicate, reparent and
property edits made through halos and tools. Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z, and in the world
menu.

**Tools (`kernel/halo.js`, `kernel/menu.js`, `kernel/tools/*`).** The tools are morphs in the
world, as in Lively, so they can be inspected and changed too.

- *Halo* handles: move, resize, rotate, scale, grab (drag and drop to reparent), duplicate,
  delete, color, inspect, edit scripts, menu, a name tag you can edit, and Keep in world for scripted
  morphs.
- *World menu*: New morph ▸ (each v1 class), Workspace, Inspector on world, Parts bin, Undo/Redo,
  Pause/Resume, and "Save / Share…" (asks the shell to open its dialogs).
- *Workspace*: a code editor morph (Ace inside the frame, worker disabled) with do-it (Ctrl/Cmd+D),
  print-it (Ctrl/Cmd+P), and inspect-it (Ctrl/Cmd+I).
- *Inspector*: a property tree for any object, editable leaf values, and an evaluator pane where
  `this` is the inspected object.
- *Object editor*: lists a morph's scripts and connections, edits and saves script source (compile
  errors shown inline), and adds new scripts from templates (`onMouseDown`, `step`, …).
- *Parts bin*: a palette of ready-made parts (each kernel class, plus composite parts such as a
  labeled slider, a clock face and a sticky note). Drag one out to place a copy.
- *Style editor*: fill, border, radius, opacity, shadow and font. The halo's color handle opens it.

**Console bridge (`kernel/bridge.js`).** In the frame, `console.log`, `console.warn`,
`console.error`, uncaught errors and unhandled rejections are forwarded to the shell's Console pane
as structured data. Values are previewed with depth and length limits. The output cap is 1 MiB or
20,000 lines, as in PythonOnline. `inspect(obj)` opens an inspector in the world.

## Shell page (`index.html`, `src/app.js`)

Toolbar, in order:

- On mobile only, the *World / Code / Console* tabs.
- *▶ Run* (Ctrl/Cmd+Enter), *❚❚ Pause* / *Resume*, and the *Auto-run* checkbox.
- *↓ Download* (livelier.json, main.js, world.svg, world.png, console.txt).
- *↗ Share*, *QR code*, *Hide editor*, and *More ···*.
- *More*: Save to HashBin, a CID box and Load from HashBin; Restart world; New empty world; Halo mode
  (touch); the docs links row; offline status.

Layout: the Code pane (Ace, JavaScript mode, autocomplete for the kernel API, 2-space soft tabs) is
on the left with the collapsible **Console** below it. The **World** pane is on the right, and
holds the world frame. The splitter defaults to 40/60, favoring the world. *Hide editor* gives the
full-window world. The status line shows *Loading kernel…*, *Running*, *Paused*, *Error on line 7*,
*Stopped a long-running loop*, and so on.

The default program on a first visit is a short tour. It has a saved world with a welcome text, a
few shapes and a slider connected to one of them, and a main script that adds a bouncing ball with
`step()`. The text invites the user to Alt-click or long-press something.

## Security

Shared links and gallery cards run code automatically, on an origin shared with the account's
other Pages apps. The design keeps user code away from anything that matters:

- **World frame.** The kernel, the tools and all user code run in an
  `<iframe sandbox="allow-scripts">` with a `srcdoc` document, so its origin is `null`. It has no
  `allow-same-origin`, `allow-popups`, `allow-forms`, `allow-modals`, `allow-top-navigation` or
  `allow-downloads`. It cannot read `curtcox.github.io` localStorage, IndexedDB, cookies, Cache
  Storage or the HashBin publish state, and it cannot touch the shell's DOM.
- **Boot.** The `srcdoc` contains only a tiny inline bootstrap whose SHA-256 hash is pinned in the
  CSP. It accepts one `livelier:boot` message from `parent`, carrying a `MessageChannel` port and
  the kernel source. It then runs the kernel. The shell fetches that source through the service
  worker, which serves only hash-verified bytes, so the frame boots offline. This mirrors the
  HashBin SDK sandbox, with a DOM instead of a worker.
- **CSP.** The frame inherits the shell's policy, which allows `'unsafe-eval'` because the kernel
  compiles user code. The shell's own code never evaluates strings; `AGENTS.md` records that as a
  contract. `frame-src`, `connect-src` and `img-src` are kept to what the app needs. User code can
  use the network as any web page can (needed for `fetch` and https images).
- **Messages are data.** The shell accepts messages only from the frame's port. It validates their
  shape and size, and puts console text in through `textContent`. World snapshots from the frame
  are stored and serialized, never rendered in the shell.
- **Exports.** `world.svg` comes from our own `export-svg.js`. The shell rasterizes it to PNG
  through an `<img src="blob:…">`, which never runs scripts. Downloads happen in the shell, since
  the frame cannot download.
- **Hangs.** The loop guard stops runaway loops. If the frame still stops answering its 500 ms
  heartbeat for 4 s, the shell shows "The world stopped responding" with *Restart world*. (Where
  the browser runs the sandboxed frame in its own process, as current desktop Chrome does, the
  shell stays responsive. In Firefox and Safari a hang can also freeze the shell.) For that case
  the shell records `livelier:session = running` and clears it on `pagehide` and when the tab is
  hidden. A tab that was killed while hung therefore reopens **paused**, with "Livelier didn't
  close normally, so this world opened paused."
- This is not a hardened sandbox for hostile code. The README states what it protects (the
  shared origin's storage and the editor) and what it does not (CPU, network, and anything the
  user is tricked into typing into a world).

## Sharing and URLs

| URL form | Meaning |
|---|---|
| `#<url-encoded document or .js>` | The long form. |
| `?compressed=<lz-string>` | Main script only (empty world), compressed with `LZString.compressToEncodedURIComponent`. |
| `?doc=<lz-string>` | Compressed JSON document (the HashBin envelope). Used whenever the world is not empty or autorun is off. |
| `#<cid>` | Load from HashBin (`HashBinDocuments.isCID` tells it apart from source). |
| `?example=<id>` | Load a gallery sample. |
| `?run=0` | Open paused: the saved world loads but nothing steps, and the main script does not run until *Run*. The Share dialog has "Don't run on open". |

*Shorten link* posts to is.gd through AllOrigins, as PythonOnline's `ShareClient` does, with the
same bounded timeout. Its error guidance points to HashBin, and links that is.gd rejects as too
long keep the full link.

## HashBin

- `hashbin.js`: keep `HashBinStore` as it is except the transaction-key prefix
  (`livelier:hashbin:return:`) and `fileName: 'livelier.json'`. `HashBinDocuments.serialize` and
  `parse` handle the envelope above (`type: 'livelier'`, `livelier: {kernel, autorun, world}`).
  Plain-text CIDs load as a main script. Loads come from `https://256t.us/<cid>` and are verified
  against the CID. Short documents are inline.
- `hashbin-panel.js`: copied, with the same element IDs. The snapshot is `{src, livelier}`, with
  the world requested from the frame first. The fingerprint is a hash of the serialized envelope,
  so the address bar shows `#<cid>` until something changes.
- Vendor the immutable HashBin SDK v0.4.0 release byte for byte, as PythonOnline does. A test
  checks both files against the release's SRI hashes. Upgrade only by vendoring a newer release.
- **User action:** register a "Livelier" app at https://hashbin.org/developers with the return URL
  **`https://curtcox.github.io/livelier/`** (lowercase, trailing slash, no `index.html`). Then give
  me its public client ID for the meta tag. Until then, loading works and saving says "HashBin
  saving needs a registered client ID."

## Mobile

- Phone layout: tabs, a *More* drawer, 40 px buttons and 16 px inputs, as in PythonOnline.
  *World* is the first tab.
- In the world, long-press (500 ms, with a small progress ring) opens the halo. On the world
  background it opens the world menu. Halo handles are 36 px on touch.
- *Halo mode* (a toggle in the World pane heading) makes a single tap open a halo, for people who
  find long-press awkward.
- Pinch zooms the world (0.25×–4×) and two-finger drag pans it. *Fit* resets the view.
- Text morphs bring up the on-screen keyboard. The world scrolls the focused morph into view above
  it (`visualViewport`).
- Tool windows open at a phone-friendly size, and the workspace and object editor fill the world
  pane.

## Gallery

About 20 original samples in `src/examples.js` and `examples/<id>.json`, each written for this
site, tagged and searchable:

- *Basics*: Hello world (text + button script), counter, sticky-notes board (drag and drop between
  boards), a direct-manipulation tour (halo, inspector and object editor in a few steps).
- *Animation*: a bouncing ball, an analog clock, orbiting planets, a pendulum.
- *Connections*: an RGB color mixer (three sliders to a fill), a temperature converter (two text
  fields connected with converters), a slider-driven polygon.
- *Generative (main script)*: a flower or star pattern, a Game of Life grid, a sorting visualizer,
  turtle-style drawing on a `CanvasMorph`.
- *Apps*: a calculator, a to-do list (`List` + text), a tiny piano (WebAudio, which starts on the
  first tap).
- *Self-change*: "Change the kernel": a workspace that redefines how all buttons look, live, and a
  main script that keeps the change.

`gallery.html` reuses PythonOnline's card grid, search box and tag filter. The covers in
`gallery/previews/<id>.svg` are generated by `node scripts/render-gallery.mjs`. It loads each
sample in headless Chromium through Playwright, lets it step for a fixed simulated time, and calls
`world.exportSVG()`. `--check` verifies source fingerprints without re-rendering. A card links to
`./?example=<id>`, and a second link goes to its docs page.

## Docs

The guides are Markdown in `docs/`. `npm run docs` renders them to `docs/*.html` (the script is
copied from PythonOnline).

- `getting-started.md`: a tour of the world, halos, the workspace, saving and sharing.
- `program-model.md`: the saved world, the main script, scripted morphs and Keep in world.
- `morphs.md`: a reference for every class, its properties and its events.
- `scripts-and-connections.md`: `addScript`, `step`, and `connect` with converters.
- `tools.md`: halo handles, the inspector, the object editor, the parts bin and the style editor.
- `sharing.md`: the URL forms, QR codes, HashBin and the size limits.
- `shortcuts.md`: keyboard and touch gestures.

## Offline / PWA

- Follows PythonOnline's pattern. `offline-assets.js` lists every shipped file (the shell, the
  kernel, Ace, the vendored libraries, docs and gallery) with SHA-256 hashes, plus the pinned
  lz-string CDN URL. The service worker precaches them atomically and serves only bytes that match
  (using the vendored `hashbin-cache-v0.4.0.js` verifier), so another app on the shared origin
  cannot poison the cache. Cache names start with `livelier-`. Unlike PythonOnline there is no
  large runtime, so the whole app is about 1 MB and is fully available offline after the first
  visit.
- `src/offline.js` shows *Available offline*, *Retry offline setup* and *Update and reload*.
  Before reloading it saves the draft, including a fresh world snapshot.
- `manifest.webmanifest`, `icon.svg`, and PNG icons (180, 192 and 512 px) for Add to Home Screen.
- Images loaded from https URLs inside a world need the network. Data-URI images work offline.

## Tests

**Node (`node --test tests/*.test.js`)**

- *Kernel model*: geometry and transforms, hit testing, submorph add/remove/reorder, change
  notifications, stepping scheduler with a fake clock, focus, and undo/redo for every recorded
  operation.
- *Compiler*: loop-guard insertion for every loop and function form (including bodies without
  braces, labels and generators); a guard trip after the budget with a fake clock; `try/catch`
  inside a loop can't swallow it; last-expression rewriting; top-level `await`; line and column
  mapping for runtime and syntax errors.
- *Bindings*: connect, converters, disconnect, cycles stopped, and serialization.
- *Serializer*: a byte-identical round trip for every class; deterministic output; unknown
  classes or properties degrade with a warning; Keep in world flattens class methods into scripts.
- *Sharing and HashBin*: ported from PythonOnline (round trips, `?doc=`, `?run=0`, CID detection,
  envelope parse and limits, plain-text CIDs, mocked publish and redirect snapshot restore, SDK SRI
  hashes).
- *Other*: `qr` (copied vectors), examples catalog ↔ `examples/*.json` sync and preview
  fingerprints, and `offline-assets` coverage of every file referenced by the pages and the kernel.

**Browser (Playwright, `tests/browser/all.cjs`, own local server)**

- *Smoke*: the default world loads and steps; editing the main script re-runs it and keeps the
  saved world; an error marks the gutter; Run, Pause and Restart work.
- *Direct manipulation*: halo move, resize, rotate, duplicate and delete; grab and drop
  reparenting; undo/redo; editing a name tag.
- *Tools*: workspace do-it, print-it and inspect-it; inspector edits; the object editor installs a
  script that then handles a click; the parts bin drag-out; style editor changes.
- *Program model*: scripted morphs are not saved; Keep in world keeps one across a re-run and a
  reload.
- *Sandbox*: the frame's origin is `null`; `localStorage` and `indexedDB` throw or are absent; it
  cannot reach `parent.document`; forged messages from elsewhere are ignored.
- *Loop guard*: `while (true) {}` in the main script, a step script and a do-it is stopped, and the
  world keeps working. The paused reopen after an unclean session.
- *Sharing*: Share, then open in a new page, gives the same script and world; the QR dialog;
  mocked is.gd; downloads (JSON, JS, SVG, PNG and console text).
- *HashBin*: mocked publish, redirect return (approved and cancelled), and a `#cid` load with
  stale-load protection.
- *Gallery*: every card opens and runs with no console errors.
- *Mobile*: a 375×812 viewport. Tabs, *More*, no horizontal scroll, touch-target sizes, long-press
  halo, Halo mode, pinch zoom.
- *Offline*: after the service worker installs, stop the server, reload, and load and run a world.

**CI (`.github/workflows/test.yml`)**: one job runs `npm test`, `npm run check` and
`render-gallery --check`. A matrix job runs the browser suite on chromium, firefox and webkit, and
uploads `test-results/` on failure. Deployment stays a separate workflow.

## Phases

0. **Spike (de-risk the frame).** Boot a sandboxed `srcdoc` frame from a hash-pinned bootstrap
   with the kernel source posted in. Confirm, in Chromium, Firefox and WebKit, that the inherited
   CSP with `'unsafe-eval'` compiles user code, that the frame's origin is `null` with no storage
   access, that the microtask loop guard stops `while(true){}`, and that the frame boots offline
   through the service worker. **Gate:** if the DOM frame can't be made safe or reliable, fall back
   to running the morph model in a HashBin SDK worker sandbox, with the shell rendering a display
   list. That trades some liveness for an unbreakable Stop. I'll report back before going that way.
1. **Skeleton and deploy.** `deploy.yml`, a minimal `index.html` whose frame shows one draggable
   morph, `package.json`, README, `LICENSE` (MIT) and `LICENSE-graphvizonline`. Push and confirm
   https://curtcox.github.io/livelier/ is live. *User action:* Settings → Pages → Source = "GitHub
   Actions". Or, if you approve it, I run
   `gh api -X POST repos/curtcox/livelier/pages -f build_type=workflow`.
2. **Kernel core.** The morph model and v1 classes, the DOM renderer, events, the hand with drag
   and drop, stepping, focus and text editing.
3. **Compiler and scripting.** Acorn instrumentation, the loop guard, scripts, connections, the
   console bridge and error line mapping.
4. **Tools.** Halos, menus, workspace, inspector, object editor, parts bin, style editor and undo.
5. **Program model and shell.** The serializer, scripted morphs and Keep in world, the Code pane
   with Ace, the Console, Run/Pause/Restart, auto-run, the local draft, the heartbeat watchdog and
   the paused reopen.
6. **Sharing.** Share links, is.gd shortening, the QR dialog and downloads, including `export-svg.js`.
7. **HashBin.** Vendor SDK v0.4.0, adapt the store and panel, auto-load `#cid`, the publish
   redirect, and the placeholder client ID. Swap in the real ID once registered.
8. **Mobile.** Phone CSS, tabs, *More*, long-press, Halo mode, pinch and pan, and keyboard
   handling. Check WebKit and Chromium mobile viewports.
9. **Gallery and docs.** Samples, `gallery.html`, the cover generator, the guides and the links row.
10. **Offline/PWA.** The asset list and update script, the service worker, the manifest and icons,
    and the status UI.
11. **Tests, CI and docs.** Unit tests are written alongside each phase. This phase finishes the
    Playwright suite and `test.yml`, the README (features, limits, local development, security
    model), and `AGENTS.md`, which records these contracts for future sessions.

Each phase is one or a few commits pushed to `main`, deploying as it goes.

## Licensing notes

- The kernel is original code under MIT. It is inspired by Morphic, the Lively Kernel and
  lively.next (all MIT), but copies none of their code. If code is ever adapted from them, their
  MIT notice goes with it.
- "Lively" is the project's name, not ours. The README says Livelier is an unofficial project
  inspired by the Lively Kernel and not affiliated with HPI or the Lively Kernel project. It uses
  its own icon.
- Third-party code keeps its notices: Ace (BSD, `ace/LICENSE`), acorn (MIT,
  `vendor/LICENSE-acorn`), lz-string (MIT, `vendor/LICENSE-lz-string`), the QR encoder (MIT,
  Project Nayuki, notice in `src/qr.js`), and the HashBin SDK release (vendored unmodified).
- GraphvizOnline lineage: keep `LICENSE-graphvizonline` and the credit. svg-pan-zoom is not
  needed, because the world does its own pan and zoom.

## Risks and open items

- **Hangs outside the loop guard.** A huge synchronous builtin call (`new Array(1e9).fill(0)`),
  catastrophic regex backtracking, or a kernel method that a script broke can still block the
  frame. In Firefox and Safari that may freeze the tab. Mitigations: the paused reopen, the
  watchdog where the frame has its own process, and *Restart world*.
- **`'unsafe-eval'` in the shell's CSP.** The frame needs it and inherits the shell's policy. The
  shell itself evaluates nothing, so the added risk is small, but it is a contract to keep (it is
  checked in review and recorded in `AGENTS.md`).
- **Kernel scope.** A Lively-style kernel with good tools is the bulk of the work (phases 2–4).
  The v1 class list and tools above are the line. Anything more goes to v2.
- **Snapshot size.** Worlds with embedded images outgrow URL and QR limits quickly. Share and QR
  steer to HashBin, and the image import offers to downscale.
- **Auto-run side effects.** As in PythonOnline, a main script that calls web APIs re-runs on every
  edit. It is documented, Auto-run can be turned off, and links can carry `?run=0`.
- **Text editing across browsers.** `contenteditable` differs between engines, especially on iOS.
  Text morphs are plain-text only in v1, which keeps this manageable. The browser suite covers
  typing in all three engines.
- **Future (v2) ideas, not in v1:** a HashBin-backed parts bin (publish one morph, then
  `await $part('<cid>')` in any world); multi-user worlds; a code browser for the kernel itself
  with persistent kernel patches; layouts (horizontal and vertical flow); persistent world storage
  on the hosted HashBin run origin, as PythonOnline's "Keep files between runs" does; vector path
  editing handles.

## Implementation record — 2026-10-29

The v1 implementation is present: original kernel and tools, sandboxed shell, saved/scripted program
layers, sharing and downloads, HashBin Publish/CID integration, phone interactions, 20 original
samples and generated covers, seven rendered guides, verified offline PWA, and independent Pages
and three-engine CI workflows.

Validation: 27 Node tests and syntax/generated-asset checks pass. Complete browser suites pass
locally on Chromium and WebKit, and on Chromium, Firefox, and WebKit in Linux CI. The passing
[CI run](https://github.com/curtcox/livelier/actions/runs/40895757564) verifies code commit
`15ec00c`. Coverage includes isolation, loop recovery, manipulation/tools, retained morphs,
share/download round trips, approved/cancelled SDK redirect recovery, all gallery programs,
phone gestures, offline reload, and rejection of altered cached bytes. A regression test verifies
that HashBin Publish opens synchronously from the approval click and rechecks changed documents.

GitHub Pages deployment succeeded. A hosted browser check confirmed HTTP 200, a running
opaque-origin kernel, the 375 px shell layout, and all 20 gallery cards. The local macOS Firefox
binary cannot launch a profile under this execution host; the successful Linux Firefox suite
provides that engine's verification.

The public HashBin client ID intentionally remains empty. Register the app with the return URL
above before enabling saving. CID loading and mocked Publish/redirect validation work without
that registration. The README describes the execution, persistence, export, and browser limits.
