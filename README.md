# maplibre-local-glyphs

Custom protocol for creating all glyphs locally in the browser without any changes to maplibre

## Installation

```
npm install maplibre-local-glyphs --save
```

## In Maplibre

```js
import maplibregl from "maplibre-gl";
import glyphs from "maplibre-local-glyphs";
maplibregl.addProtocol("glyphs", glyphs);

// Load map as usual
```

in your style:

```
glyphs: "glyphs://{fontstack}/{range}",
```

Done! Simple as that.

## Security and glyph rendering

Version 1.2.1 removes `patch-package` and the installation hook. Installing this
package no longer modifies dependencies in the consuming application.

Glyphs use upstream `@mapbox/tiny-sdf` 2.3.0 or later, which accounts for glyph
bearings when positioning and measuring characters such as `j`. The old patch
for clipped characters is no longer needed. This package is an ES module, as
shown in the import example above.
