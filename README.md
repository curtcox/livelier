# Livelier

A live world you can change, built from original JavaScript with no build step.

Open **[Livelier](https://curtcox.github.io/livelier/)**, explore the **[20 sample worlds](https://curtcox.github.io/livelier/gallery.html)**, or read the **[guide](docs/getting-started.md)**.

Livelier is inspired by Morphic, the [Lively Kernel](https://www.lively-kernel.org/), and [lively.next](https://github.com/LivelyKernel/lively.next). It is an unofficial project, not affiliated with HPI or the Lively Kernel project. No Lively implementation code is copied.

## Build with the world

- Rectangles, ellipses, paths, editable text, images, buttons, sliders, lists, windows, HTML, and canvases.
- Direct manipulation through halos: move, resize, rotate, scale, grab/reparent, duplicate, delete, rename, and Keep in world.
- Workspace do-it/print-it/inspect-it, inspector, script/connection editor, parts bin, style editor, and undo/redo.
- A saved world plus a main JavaScript script; debounced Auto-run, Run, Pause/Resume, top-level await, per-morph scripts, bindings, and stepping.
- Ace editor, source-line error annotations, ordered Console, draggable splitter, and full-window world.
- Compressed share links, paused links, is.gd shortening, QR codes, and JSON/JavaScript/SVG/PNG/Console downloads.
- Verified HashBin CID loading and Publish integration. Saving needs a registered public client ID.
- Phone tabs, long-press halos, Halo mode, pinch zoom, two-finger pan, and an installable offline PWA.

## Develop locally

Serve the repository root over HTTP; no build is needed:

```sh
npm ci
npm run serve
# open http://localhost:8000/
```

Playwright is the only development dependency. Production libraries are vendored. Ace workers are disabled. The kernel and application use plain scripts; model files also export to Node.

```sh
npm test
npm run check
npx playwright install --with-deps
npm run test:browser
BROWSER=firefox npm run test:browser
BROWSER=webkit npm run test:browser
```

The browser suite owns its local server and writes failure screenshots to test-results/. PLAYWRIGHT_EXECUTABLE_PATH can select a compatible browser executable. No test should silently skip a missing browser. CI runs all three engines on Linux independently of deployment.

After changing shipped assets:

```sh
node scripts/create-examples.mjs  # only after editing original sample definitions
npm run docs
npm run gallery                 # renders each sample in Chromium
npm run offline                 # content hashes and frame bootstrap CSP pin
npm test
npm run check
```

The gallery renderer fixes time and random seeds before running each example, exports static SVG previews, and records document fingerprints. Its --check mode checks committed previews without launching a browser.

## GitHub Pages and HashBin

The separate deploy workflow publishes the repository root on each main push; it does not wait for tests. Set Settings → Pages → Source to GitHub Actions. Keep the repository/path lowercase: curtcox/livelier and https://curtcox.github.io/livelier/.

For saving, register a new Livelier app at https://hashbin.org/developers with return URL **https://curtcox.github.io/livelier/** (trailing slash, no index.html). Put its public client ID in index.html’s hashbin-client-id meta tag. Until then, loading works and saving reports that registration is needed. Publish approval, pricing, and authentication stay on HashBin; this editor holds no HashBin credentials. Redirect state is namespaced with livelier:hashbin:return:.

## Execution and security

The entire world, kernel, tools, and all user code run inside an opaque-origin srcdoc frame with **sandbox="allow-scripts"**. It has no same-origin access, top navigation, popup, form, modal, or download permission. It cannot access the shared curtcox.github.io origin’s storage or the editor DOM. A hash-pinned bootstrap accepts trusted kernel source and one MessageChannel port from the parent. Shell scripts never evaluate strings. Messages are bounded data; console text uses textContent. SVG rasterization uses an image, never an HTML mount.

Acorn instruments loops and function bodies with a two-second synchronous budget, including catch guards. A heartbeat watchdog offers recovery when the browser can keep the editor responsive. An unclean session reopens paused. The service worker atomically precaches and verifies asset hashes before serving cached bytes, preventing sibling apps on the same origin from substituting Cache Storage entries.

**This is not a hardened sandbox for hostile code.** User code can use CPU, network, WebAudio, and other browser APIs available to the frame. Huge builtin operations, catastrophic regex backtracking, or broken kernel methods can still hang a tab, especially where the frame shares the editor’s process. Nothing prevents a malicious world from asking the user to type secrets into it. Only open code you trust.

## Limits

Documents have a 5 MiB limit. Local storage and URL/QR limits can be much smaller; use a file or HashBin for large worlds. Images loaded from HTTPS require the network. SVG exports omit arbitrary HTMLMorph content; remote-image/canvas rasterization depends on browser CORS behavior.

Scripts save source, not JavaScript closures. Use this, $('name'), and the [serialized properties](docs/morphs.md) for persistent behavior. Arbitrary custom properties, kernel patches, active timer progress, tool windows, and unsaved main-script objects do not become snapshot state. Keep lasting kernel patches in the main script. Native browser builtins and APIs are not instrumented. Auto-run can repeat side effects; disable it or share with ?run=0 when needed.

## Credits and licenses

The original kernel and application are MIT ([LICENSE](LICENSE)). The editor/sharing lineage comes through [PythonOnline](https://github.com/curtcox/PythonOnline) and [GraphvizOnline](https://github.com/dreampuf/GraphvizOnline); retain [LICENSE-graphvizonline](LICENSE-graphvizonline). Ace 1.4.1 retains its BSD notice in ace/LICENSE. Acorn 8.19.0 and lz-string retain MIT notices in vendor/. The QR encoder is adapted from Project Nayuki with its MIT notice in src/qr.js. HashBin SDK and verified-cache v0.4.0 are vendored unmodified; tests pin their release SRI hashes. The icon is original.
