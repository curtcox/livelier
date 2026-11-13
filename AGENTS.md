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

Never silently replace a local draft from a link, sample, CID, or file. Request a snapshot before saving, sharing, exporting a document, or reloading for offline updates. Preserve source and world across approved/cancelled HashBin redirects. Store no HashBin credentials on this origin. Public HashBin client ID is app_f044e0da-520a-4196-81f5-041c78f43c02; its only return URL is https://livelier.hashbin.page/.

## Work and checks

Run npm test and npm run check. For execution, interaction, persistence, security, or UI changes run the relevant Playwright browser suite, using BROWSER=chromium/firefox/webkit. Do not label an unrun browser as passing. CI is a three-engine matrix; the shared Pages deploy is gated on it and has no build step.

After updating docs, samples, or shipped assets run the relevant generators, ending with npm run offline. Keep catalog documents, examples JSON, preview SVGs, fingerprints, and Markdown/HTML guides synchronized. Tests verify SDK SRI hashes, CSP pin, offline coverage, and shell evaluation rules.

Keep the Fragment Kit consumer migration on its own branch and PR. Commit and push when authorized by the task. Preserve lowercase curtcox/livelier and the canonical HashBin return URL https://livelier.hashbin.page/. GitHub Pages must use GitHub Actions.

## URL identity and draft recovery

Explicit program, source, example and CID URLs always load their document, independent of browser drafts. Never gate URL loading on a replacement confirmation. The bare homepage opens the default document. Preserve local drafts separately with LocalDrafts and offer Resume saved work. Opening or running a URL must not overwrite saved work; edits retain the previous draft for recovery. Keep stale-load guards and execution isolation.

## Fragment Kit

Shared contracts live in `vendor/fragment-kit-v0.4.3/docs/contracts.md`. Keep exact pinned runtime bytes immutable; workflows use the immutable `v2` reference. The production document adapter preserves the deterministic world and kernel version. The original kernel and execution boundary remain app-owned. Request fresh world snapshots before save/share/export; reject a stale response and keep Publish in the subsequent confirmation click. Keep `livelier:draft`, history, session markers and the existing app-prefixed Publish transaction namespace. Keep the registered client ID in index.html. Keep the legacy writer until all consumers read v1. `npm run gallery:world` regenerates original SVGs; the shared renderer exports covers. Check both renderers, regenerate docs after Markdown and offline hashes after shipped changes, and run unit/static/contracts plus real-kernel browser tests in Chromium, Firefox and WebKit. Report only browsers actually run.
