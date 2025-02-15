# maplibre-local-glyphs

Custom protocol for creating all glyphs locally in the browser without any changes to maplibre

## In Maplibre

```js
import maplibregl from "maplibre-gl";
import glyphs from "./protocol-glyphs.js";
maplibregl.addProtocol("glyphs", glyphs);

// Load map as usual
```

in your style:

```
glyphs: "glyphs://{fontstack}/{range}",
```

Done! Simple as that.

## Dependencies

Make sure your project has access to pbf and tiny-sdf.

```
npm install pbf
npm install @mapbox/tiny-sdf
```

## Known issues

For some reason the letter j is rendered a bit to tight by tiny-sdf, this can be solved by modifying tiny-sdf with the following code, line 59 forward:

```js
// If the glyph overflows the canvas size, it will be clipped at the bottom/right
// ADDING EXTRA PADDING otherwise "j" will be cut off
const EXTRA_PADDING = 2;
const glyphWidth = Math.max(
  0,
  Math.min(
    this.size - this.buffer,
    Math.ceil(actualBoundingBoxRight - actualBoundingBoxLeft) + EXTRA_PADDING,
  ),
);
```
