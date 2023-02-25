import { createCanvas, createImageData, loadImage } from "canvas";

import fs from "fs";
import { join } from "path";
import { Config } from ".";

// 1111 1001 0000

/**
 * Sets every 4th byte 255. This is due to alpha premultiplication causing loss of data.
 * After all data is packed, set the alpha of the first full unrelevant 3 bytes to equal the byte offset
 * of the last relevant byte. When unpacking, this can be used to determine the length of the original buffer.
 *
 * @param unpaddedArr
 * @returns
 */
export const padAlpha = (
  unpaddedArr: Uint8ClampedArray,
  { TOTAL_BYTES }: Config
) => {
  const paddedArr = new Uint8ClampedArray(TOTAL_BYTES);

  const length = unpaddedArr.length;

  // ceil to nearest 4 and add 4 since we are using alpha byte as stop byte
  const neededBytes = Math.ceil((length * (4 / 3)) / 4) * 4 + 4;
  const offset = neededBytes - Math.ceil(length * (4 / 3));

  let paddedArrIndex = 0;
  let unpaddedArrIndex = 0;

  while (paddedArrIndex < paddedArr.length) {
    paddedArr[paddedArrIndex++] = unpaddedArr[unpaddedArrIndex++];
    paddedArr[paddedArrIndex++] = unpaddedArr[unpaddedArrIndex++];
    paddedArr[paddedArrIndex++] = unpaddedArr[unpaddedArrIndex++];
    paddedArr[paddedArrIndex++] = 255;

    if (paddedArrIndex >= neededBytes) {
      paddedArr[paddedArrIndex + 3] = offset; // save offset to serve as stop byte

      break;
    }
  }

  return paddedArr;
};

/**
 * Removes the alpha padding created with {@link padAlpha} from the array.
 * @param paddedArr
 * @returns
 */
export const unPadAlpha = (
  paddedArr: Uint8ClampedArray,
  { BYTES_CAPACITY }: Config
) => {
  const unpadded = new Uint8ClampedArray(BYTES_CAPACITY);

  let unpaddedArrIndex = 0;
  let paddedIndex = 0;

  let stopByteIndex = -1;

  while (unpaddedArrIndex < unpadded.length) {
    unpadded[unpaddedArrIndex++] = paddedArr[paddedIndex++];
    unpadded[unpaddedArrIndex++] = paddedArr[paddedIndex++];
    unpadded[unpaddedArrIndex++] = paddedArr[paddedIndex++];

    if (paddedArr[paddedIndex] !== 255) {
      stopByteIndex = paddedIndex;

      break;
    }

    paddedIndex++;
  }

  if (stopByteIndex === -1) {
    throw new Error("Stop byte not found");
  }

  const offsetInBytes = paddedArr[stopByteIndex];

  const lastRelevantByteIndex =
    Math.floor((stopByteIndex * 3) / 4) - offsetInBytes;

  const lengthCorrected = unpadded.subarray(0, lastRelevantByteIndex + 1);

  return lengthCorrected;
};

export const uint8arrToPng = (packedArr: Uint8ClampedArray, config: Config) => {
  const arr = padAlpha(packedArr, config);

  const { DIMENSION_X, DIMENSION_Y, FILENAME } = config;

  const canvas = createCanvas(DIMENSION_X, DIMENSION_Y);

  /**
   * Note: alpha is multiplied by the color channels, so getImageData can return different
   * values than what was originally set. Either set alpha to 255 or disable alpha by setting { alpha: false }
   */
  const context = canvas.getContext("2d");

  const imageData = createImageData(arr, DIMENSION_X, DIMENSION_Y);

  imageData.data.set(arr);

  context.putImageData(imageData, 0, 0);

  const buffer = canvas.toBuffer("image/png", {
    compressionLevel: 0,
    filters: canvas.PNG_FILTER_NONE,
  });

  fs.writeFileSync(join("build", FILENAME), buffer);
};

export const pngToUint8arr = async (config: Config) => {
  const { DIMENSION_X, DIMENSION_Y, FILENAME } = config;

  const canvas = createCanvas(DIMENSION_X, DIMENSION_Y);
  const context = canvas.getContext("2d");

  const img = await loadImage(join("build", FILENAME));

  context.drawImage(img, 0, 0);

  const imageData = context.getImageData(0, 0, DIMENSION_X, DIMENSION_Y);

  const arr = imageData.data;

  return unPadAlpha(arr, config);
};
