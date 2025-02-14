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
