# Changelog

## 1.2.1

- Raise the Pbf minimum to 4.0.2 and refresh the lockfile, including patched
  protocol-buffers-schema 3.6.1.

- Remove the `patch-package` runtime dependency and `postinstall` hook, eliminating
  their vulnerable transitive dependency chain and consumer dependency mutation.
- Use upstream TinySDF 2.3.0 glyph-bearing handling instead of patching installed
  TinySDF code to work around clipped glyphs.
- Declare the existing ES-module entry point as an ES module.
- Add regression coverage for glyph bearings, PBF output, caching, and operation
  when IndexedDB is unavailable or rejects a request.
- Allow the existing uncached fallback to run when IndexedDB is unavailable or
  opening the database throws synchronously.
