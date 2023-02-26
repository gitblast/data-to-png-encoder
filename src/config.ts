import { parseArgs } from "util";

const { values, positionals } = parseArgs({
  options: {
    verbose: {
      type: "boolean",
      short: "v",
    },
    check: {
      type: "boolean",
      short: "c",
    },
    x: {
      type: "string",
    },
    y: {
      type: "string",
    },
    decode: {
      type: "boolean",
      short: "d",
    },
  },
  allowPositionals: true,
});

if (positionals.length !== 1) {
  throw new Error("Must provide a file path");
}

const EXT = ".packed.png";
const FILEPATH = positionals[0];
const FILENAME = FILEPATH.split("/").pop() || `untitled_${Date.now()}`;
const OUTPUT_FILENAME = `${FILENAME}_${Date.now()}${EXT}`;
const DIMENSION_X = Number(values.x || 854);
const DIMENSION_Y = Number(values.y || 480);
const PIXEL_TOTAL = DIMENSION_X * DIMENSION_Y;
const TOTAL_BYTES = PIXEL_TOTAL * 4;
const BYTES_CAPACITY = PIXEL_TOTAL * 3 - 1;

const config = {
  FILEPATH,
  FILENAME,
  EXT,
  DIMENSION_X,
  DIMENSION_Y,
  PIXEL_TOTAL,
  TOTAL_BYTES,
  BYTES_CAPACITY,
  OUTPUT_FILENAME,
  values,
};

export type Config = typeof config;

export default config;
