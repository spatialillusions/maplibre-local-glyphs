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

```json
glyphs: "glyphs://{fontstack}/{range}",
```

Done! Simple as that.

## Known issues

For some reason the letter j is rendered a bit to tight by tiny-sdf, this can be solved by modifying tiny-sdf. This is solved by patch-package on installation.
