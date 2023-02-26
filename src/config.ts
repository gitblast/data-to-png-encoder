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
    width: {
      type: "string",
    },
    height: {
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
const OUTPUT_FILENAME = `${FILENAME}${EXT}`;
const WIDTH = Number(values.width || 854);
const HEIGHT = Number(values.height || 480);
const PIXEL_TOTAL = WIDTH * HEIGHT;
const TOTAL_BYTES = PIXEL_TOTAL * 4;
const BYTES_CAPACITY = PIXEL_TOTAL * 3 - 1;

const config = {
  FILEPATH,
  FILENAME,
  EXT,
  WIDTH,
  HEIGHT,
  PIXEL_TOTAL,
  TOTAL_BYTES,
  BYTES_CAPACITY,
  OUTPUT_FILENAME,
  values,
};

export type Config = typeof config;

export default config;
