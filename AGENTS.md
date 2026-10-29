# Livelier contracts

Read todo/master_plan.md for product scope and decisions. Use plain JavaScript, no production build step, no server runtime, and original kernel code. Do not copy a Lively implementation. Keep third-party notices and immutable HashBin SDK files intact.

## Execution boundary

- The shell must never eval user strings, call Function, import user code, or mount world HTML. Only kernel/compiler.js and the trusted frame bootstrap evaluate strings.
- The world iframe has exactly sandbox="allow-scripts". Never add allow-same-origin, popup, navigation, form, modal, download, or storage permissions.
- Bootstrap source is pinned by the shell CSP hash. Regenerate with npm run offline after edits. Kernel source enters only through the one-shot parent handshake and its transferred MessageChannel.
- Treat all frame messages, console text, snapshots, and exports as untrusted data. Bound their size, validate shape, use textContent for text, and rasterize SVG only through an image.
- The inherited CSP needs unsafe-eval for the frame’s compiler. This is not permission for evaluation in shell code.
- User code is Acorn-instrumented at every entry point: main, workspace, inspector, scripts, converters. Keep loop and catch guards, line mapping, and async support working together.
- Cache Storage is shared with sibling apps. Verify pinned hashes before serving or trusting cached assets. Cache names start livelier-.

## Model and persistence

Keep model/compiler/serializer/undo files independent of DOM. World snapshots are deterministic JSON; preserve IDs and property ordering. Never include tool windows or unkept scripted morphs. Main reruns remove their morphs, steps, managed timers, and bindings. Saved world edits survive reruns. Keep in world flattens custom class methods. Unknown classes/properties warn and degrade. Do not change the envelope without versioning/migration.

Never silently replace a local draft from a link, sample, CID, or file. Request a snapshot before saving, sharing, exporting a document, or reloading for offline updates. Preserve source and world across approved/cancelled HashBin redirects. Store no HashBin credentials on this origin. Public HashBin client ID remains empty until supplied; never invent one.

## Work and checks

Run npm test and npm run check. For execution, interaction, persistence, security, or UI changes run the relevant Playwright browser suite, using BROWSER=chromium/firefox/webkit. Do not label an unrun browser as passing. CI is a three-engine matrix; deploy is independent and has no build step.

After updating docs, samples, or shipped assets run the relevant generators, ending with npm run offline. Keep catalog documents, examples JSON, preview SVGs, fingerprints, and Markdown/HTML guides synchronized. Tests verify SDK SRI hashes, CSP pin, offline coverage, and shell evaluation rules.

Follow the plan’s direct-main workflow with commits and pushes when authorized by the task. Preserve lowercase curtcox/livelier and the HashBin return URL https://curtcox.github.io/livelier/. GitHub Pages must use GitHub Actions.
