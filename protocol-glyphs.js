import Pbf from "pbf";
import TinySDF from "@mapbox/tiny-sdf";

function writeFontstacks(glyphs, pbf) {
  pbf.writeMessage(1, writeFontstack, glyphs);
}

function writeFontstack(glyphs, pbf) {
  for (let i = 0; i < glyphs.length; i++) {
    pbf.writeMessage(3, writeGlyph, glyphs[i]);
  }
}

function writeGlyph(glyph, pbf) {
  pbf.writeVarintField(1, glyph.id);
  pbf.writeBytesField(2, glyph.data);
  const border = 3;
  //https://github.com/maplibre/maplibre-gl-js/blob/34b378dbea4bc1c1ad11c53f6d4540a5c69ebb29/src/style/parse_glyph_pbf.ts#L20
  pbf.writeVarintField(3, glyph.width - 2 * border);
  pbf.writeVarintField(4, glyph.height - 2 * border);
  pbf.writeSVarintField(5, glyph.glyphLeft);
  pbf.writeSVarintField(6, glyph.glyphTop);
  pbf.writeVarintField(7, glyph.glyphAdvance);
}

function generateGlyphs(font, range) {
  range = range.split("-");
  const tinySdf = new TinySDF({
    fontSize: 24, // Font size in pixels
    // Add something to parse this from the font
    fontFamily: "Arial", // CSS font-family
    fontWeight: font.indexOf("Medium") == -1 ? "normal" : "500", // CSS font-weight
    fontStyle: font.indexOf("Italic") == -1 ? "normal" : "italic", // CSS font-style
    buffer: 3, // Whitespace buffer around a glyph in pixels
    radius: 8, // How many pixels around the glyph shape to use for encoding distance
    cutoff: 0.25, // How much of the radius (relative) is used for the inside part of the glyph
  });

  const pbf = new Pbf();

  const glyphs = [];
  for (let i = range[0]; i <= Number(range[1]) + 1; i++) {
    const char = String.fromCharCode(i);
    const sdf = tinySdf.draw(char);
    sdf.id = i;
    glyphs.push(sdf);
  }
  writeFontstacks(glyphs, pbf);

  return pbf.finish();
}

export default async function (params) {
  const pattern = /glyphs:\/\/(.*)\/(.*)/i;
  const url = params.url.match(pattern);
  const glyphPbf = generateGlyphs(url[1], url[2]);
  return {
    data: glyphPbf,
  };
}
