import { join } from "path";
import { parseArgs } from "util";
import {
  checkBuffersMatch,
  pack,
  readBuffer,
  uint8arrToPng,
  unpack,
  writeBuffer,
} from "./lib";

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
const BYTES_CAPACITY = PIXEL_TOTAL * 3;

const config = {
  FILEPATH,
  DIMENSION_X,
  DIMENSION_Y,
  PIXEL_TOTAL,
  TOTAL_BYTES,
  BYTES_CAPACITY,
  OUTPUT_FILENAME,
  VERBOSE: values.verbose,
};

export type Config = typeof config;

const main = async () => {
  if (values.decode) {
    if (!FILEPATH.endsWith(EXT)) {
      throw new Error(`File must end with ${EXT}`);
    }

    const unpacked = await unpack(FILEPATH, config);

    const filename = `unpacked_${FILENAME.replace(EXT, "")}`;

    writeBuffer(join("build", filename), unpacked);
  } else {
    const buffer = readBuffer(FILEPATH);

    const packed = pack(buffer, config);

    const path = uint8arrToPng(packed, config);

    if (values.check) {
      const unpacked = await unpack(path, config);

      if (checkBuffersMatch(buffer, unpacked)) {
        console.log("Buffers match");
      } else {
        console.log("Buffers do not match");
      }
    }
  }

  values.verbose && console.log("Done");
};

main();
