# Shared tools migration

Livelier pins the published Fragment Kit v0.3.2. `fragment-kit.config.json` holds the app configuration and `src/fragment-config.mjs` owns the production world schema. New links keep the legacy writer until the fleet has v1 readers. Reusable workflows use immutable v2 separately from the exact runtime pin.

The original kernel, compiler, serializer, undo model, WorldHost and world bootstrap remain unchanged. The iframe still has exactly `sandbox="allow-scripts"`. The consumer checker pins the original bootstrap hash and rejects evaluation in the shell; the shared checker verifies the kit and its vendor integrity. The SDK belongs only to Publish, never to this kernel's execution boundary.

Shared modules supply URL state, verified CID loads and Publish, QR generation and scanning, drafts, sharing, scheduler, offline core, shell, mobile tabs and gallery. A fresh world snapshot is requested before save/share/export. A revision guard rejects snapshots that arrive after a newer edit. Snapshot preparation finishes before the shared review dialog enables the synchronous Publish confirmation click.

Existing `livelier:draft`, its history, abnormal-session marker and `livelier:hashbin:return:` Publish transaction namespace remain intact. Explicit links load directly, preserve earlier work and never ask for replacement confirmation. Invalid links report errors; asynchronous loads and editor changes share a revision guard. Source/world edits replace the URL after a guarded, debounced snapshot.

The client ID remains empty until supplied. No HashBin registration, credential retention or paid saves are performed by the migration.

`npm run gallery:world` executes the real original kernel to regenerate SVG previews. Serve the app and use `npm run gallery` for shared fingerprinted PNG covers; its `--check` is browser-free. Regenerate docs and offline hashes after shipped edits. `npm run test:contracts` uses the actual editor/world adapter. The three-engine workflow also runs the full original interaction, isolation, gallery, URL/draft and offline suites.

Remote rollout evidence is tracked in Fragment Kit's `todo/rollout-status.md`.
