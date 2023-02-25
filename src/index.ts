import { pngToUint8arr, uint8arrToPng } from "./canvas";
import { PIXEL_TOTAL, BYTES_CAPACITY } from "./consts";
import { checkBuffersMatch, getBuffer, packBuffer } from "./lib";

console.log("Pixel total: " + PIXEL_TOTAL);
console.log("Bytes total: " + PIXEL_TOTAL * 4);
console.log("Packed bytes capacity: " + BYTES_CAPACITY);

const main = async () => {
  const buffer = getBuffer(2);

  const packed = packBuffer(buffer);

  uint8arrToPng(packed);

  const arr = await pngToUint8arr();

  const unpackedBuffer = Buffer.from(arr).subarray(0, buffer.length);

  if (!checkBuffersMatch(buffer, unpackedBuffer)) {
    throw new Error("Buffers do not match");
  } else {
    console.log("Buffers match");
  }
};

main();
