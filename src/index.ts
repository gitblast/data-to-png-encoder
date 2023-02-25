import { parseArgs } from "util";
import { pngToUint8arr, uint8arrToPng } from "./canvas";
import { checkBuffersMatch, packBuffer } from "./lib";
import fs from "fs";

const { values } = parseArgs({
  options: {
    x: {
      type: "string",
    },
    y: {
      type: "string",
    },
    file: {
      type: "string",
      short: "f",
    },
    output: {
      type: "string",
      short: "o",
    },
  },
});

const FILENAME = values.output || `packed_${Date.now()}.png`;
const DIMENSION_X = Number(values.x || 854);
const DIMENSION_Y = Number(values.y || 480);
const PIXEL_TOTAL = DIMENSION_X * DIMENSION_Y;
const TOTAL_BYTES = PIXEL_TOTAL * 4;
const BYTES_CAPACITY = PIXEL_TOTAL * 3;

const config = {
  DIMENSION_X,
  DIMENSION_Y,
  PIXEL_TOTAL,
  TOTAL_BYTES,
  BYTES_CAPACITY,
  FILENAME,
};

export type Config = typeof config;

const main = async () => {
  if (!values.file) {
    throw new Error("No file specified");
  }

  console.log("Pixel total: " + PIXEL_TOTAL);
  console.log("Bytes total: " + PIXEL_TOTAL * 4);
  console.log("Packed bytes capacity: " + BYTES_CAPACITY);

  const buffer = fs.readFileSync(values.file);

  const packed = packBuffer(buffer, config);

  uint8arrToPng(packed, config);

  const arr = await pngToUint8arr(config);

  const unpackedBuffer = Buffer.from(arr).subarray(0, buffer.length);

  if (!checkBuffersMatch(buffer, unpackedBuffer)) {
    throw new Error("Buffers do not match");
  } else {
    console.log("Buffers match");
  }

  if (values.output) {
    fs.writeFileSync(values.output, unpackedBuffer);
  }

  console.log("Done");
};

main();
