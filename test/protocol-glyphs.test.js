import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import Pbf from "pbf";
import glyphs from "../protocol-glyphs.js";

let draws;
let cache;
let closed;
const originals = {
  document: globalThis.document,
  window: globalThis.window,
  error: console.error,
  log: console.log,
};

function request(result, error) {
  const req = {};
  queueMicrotask(() => {
    req.result = result;
    req.error = error;
    if (error) req.onerror?.();
    else req.onsuccess?.();
  });
  return req;
}

beforeEach(() => {
  draws = [];
  cache = new Map();
  closed = 0;
  globalThis.document = {
    createElement(tag) {
      assert.equal(tag, "canvas");
      return {
        getContext() {
          return {
            measureText: () => ({
              width: 8, actualBoundingBoxLeft: 2, actualBoundingBoxRight: 4,
              actualBoundingBoxAscent: 16, actualBoundingBoxDescent: 5,
            }),
            clearRect() {},
            fillText: (...args) => draws.push(args),
            getImageData: (x, y, width, height) => ({
              data: new Uint8ClampedArray(width * height * 4).fill(255),
            }),
          };
        },
      };
    },
  };
  globalThis.window = {
    indexedDB: {
      open() {
        return request({
          transaction: () => ({ objectStore: () => ({
            get: (key) => request(cache.get(key)),
            add: (entry) => cache.set(entry.fontRange, entry),
          }) }),
          close: () => closed++,
        });
      },
    },
  };
  console.error = () => {};
  console.log = () => {};
});

afterEach(() => {
  for (const key of ["document", "window"]) {
    if (originals[key] === undefined) delete globalThis[key];
    else globalThis[key] = originals[key];
  }
  console.error = originals.error;
  console.log = originals.log;
});

function readGlyphs(data) {
  const output = [];
  new Pbf(new Uint8Array(data)).readFields((tag, result, reader) => {
    if (tag !== 1) return;
    reader.readMessage((stackTag, items, stack) => {
      if (stackTag !== 3) return;
      items.push(stack.readMessage((field, glyph, pbf) => {
        if (field === 1) glyph.id = pbf.readVarint();
        else if (field === 2) glyph.data = pbf.readBytes();
        else if (field === 3) glyph.width = pbf.readVarint();
        else if (field === 4) glyph.height = pbf.readVarint();
        else if (field === 5) glyph.left = pbf.readSVarint();
        else if (field === 6) glyph.top = pbf.readSVarint();
        else if (field === 7) glyph.advance = pbf.readVarint();
      }, {}));
    }, result);
  }, output);
  return output;
}

test("encodes glyph bearings and a complete buffered bitmap without an install patch", async () => {
  const response = await glyphs({ url: "glyphs://Arial/106-106" });
  const [j] = readGlyphs(response.data);
  assert.equal(j.id, 106);
  assert.equal(j.left, -2);
  assert.equal(j.width, 6);
  assert.equal(j.height, 21);
  assert.equal(j.top, 16);
  assert.equal(j.advance, 8);
  assert.equal(j.data.length, (j.width + 6) * (j.height + 6));
  assert.deepEqual(draws[0], ["j", 5, 19]);
});

test("returns cached glyph bytes without rasterizing again", async () => {
  const params = { url: "glyphs://Arial/106-106" };
  const first = await glyphs(params);
  const count = draws.length;
  const second = await glyphs(params);
  assert.deepEqual(second.data, first.data);
  assert.equal(draws.length, count);
  assert.equal(closed, 2);
});

test("different font requests do not share a cache entry", async () => {
  await glyphs({ url: "glyphs://Arial/106-106" });
  const count = draws.length;
  await glyphs({ url: "glyphs://Arial Italic/106-106" });
  assert.ok(draws.length > count);
  assert.equal(cache.size, 2);
});

test("generates glyphs when IndexedDB is unavailable", async () => {
  delete globalThis.window.indexedDB;
  assert.equal(readGlyphs((await glyphs({ url: "glyphs://Arial/106-106" })).data)[0].id, 106);
});

test("generates glyphs when opening IndexedDB is denied", async () => {
  globalThis.window.indexedDB.open = () => request(undefined, new Error("denied"));
  assert.equal(readGlyphs((await glyphs({ url: "glyphs://Arial/106-106" })).data)[0].id, 106);
});
