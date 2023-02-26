import { Config } from "./config";
import fs from "fs";
import { createCanvas, createImageData, loadImage } from "canvas";
import { join } from "path";

export const checkBuffersMatch = (buff1: Buffer, buff2: Buffer) => {
  if (buff1.length !== buff2.length) {
    return false;
  }

  for (let i = 0; i < buff1.length; i++) {
    if (buff1[i] !== buff2[i]) {
      console.log(buff1[i], buff2[i], i);

      return false;
    }
  }

  return true;
};

export const readBuffer = (path: string) => {
  const buffer = fs.readFileSync(path);

  return buffer;
};

export const writeBuffer = (path: string, buffer: Buffer) => {
  fs.writeFileSync(path, buffer);
};

export const pack = (buffer: Buffer, config: Config) => {
  const uint8arr = new Uint8ClampedArray(buffer);

  return padAlpha(uint8arr, config);
};

export const unpack = async (path: string, config: Config) => {
  const paddedArr = await pngToUint8arr(path, config);

  const unpadded = unPadAlpha(paddedArr, config);

  const buffer = Buffer.from(unpadded).subarray(0, unpadded.length);

  return buffer;
};

/**
 * Insert the bytes of the original buffer in the first 3 bytes of each pixel.
 * Every 4th byte (alpha value of the pixel) is set to 255.
 * This is due to alpha premultiplication causing loss of data.
 *
 * After the entire buffer has been inserted, set the alpha of the first full unrelevant pixel
 * to equal the byte offset of the last relevant byte. When unpacking, this can be used to
 * determine the length of the original buffer.
 *
 * @param unpaddedArr
 * @returns
 */
export const padAlpha = (unpaddedArr: Uint8ClampedArray, config: Config) => {
  const {
    DIMENSION_X,
    DIMENSION_Y,
    BYTES_CAPACITY,
    TOTAL_BYTES,
    PIXEL_TOTAL,
    values,
  } = config;

  const paddedArr = new Uint8ClampedArray(TOTAL_BYTES);

  const length = unpaddedArr.length;

  // ceil to nearest 4 and add 4 since we are using alpha byte as stop byte
  const neededBytes = Math.ceil((length * (4 / 3)) / 4) * 4 + 4;

  if (values.verbose) {
    console.log("Image width: " + DIMENSION_X);
    console.log("Image height: " + DIMENSION_Y);

    console.log("Pixel total: " + PIXEL_TOTAL);
    console.log("Bytes total: " + PIXEL_TOTAL * 4);

    console.log("Input buffer length: " + unpaddedArr.length);
    console.log("Needed bytes: " + neededBytes);
    console.log("Packed bytes capacity: " + BYTES_CAPACITY);
  }

  if (unpaddedArr.length > BYTES_CAPACITY) {
    throw new Error(
      `Buffer too large (${unpaddedArr.length} > ${BYTES_CAPACITY}))`
    );
  }

  const offset = neededBytes - 4 - Math.ceil(length * (4 / 3));

  let paddedArrIndex = 0;
  let unpaddedArrIndex = 0;

  while (paddedArrIndex < paddedArr.length) {
    paddedArr[paddedArrIndex++] = unpaddedArr[unpaddedArrIndex++];
    paddedArr[paddedArrIndex++] = unpaddedArr[unpaddedArrIndex++];
    paddedArr[paddedArrIndex++] = unpaddedArr[unpaddedArrIndex++];

    if (paddedArrIndex === neededBytes - 1) {
      paddedArr[paddedArrIndex] = offset; // save offset to serve as stop byte

      break;
    } else {
      paddedArr[paddedArrIndex++] = 255;
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
    Math.ceil((stopByteIndex * 3) / 4) - 4 - offsetInBytes;

  const lengthCorrected = unpadded.subarray(0, lastRelevantByteIndex + 1);

  return lengthCorrected;
};

/**
 * Encodes the buffer into a png image.
 * The array given as input should be padded with {@link padAlpha}.
 * This is because alpha premultiplication can cause loss of data.
 *
 * @param arr
 * @param config
 * @returns
 */
export const uint8arrToPng = (arr: Uint8ClampedArray, config: Config) => {
  const { DIMENSION_X, DIMENSION_Y, OUTPUT_FILENAME } = config;

  const canvas = createCanvas(DIMENSION_X, DIMENSION_Y);

  const context = canvas.getContext("2d");

  const imageData = createImageData(arr, DIMENSION_X, DIMENSION_Y);

  imageData.data.set(arr);

  context.putImageData(imageData, 0, 0);

  const buffer = canvas.toBuffer("image/png", {
    compressionLevel: 0,
    filters: canvas.PNG_FILTER_NONE,
  });

  const path = join("build", OUTPUT_FILENAME);

  fs.writeFileSync(path, buffer);

  return path;
};

export const pngToUint8arr = async (path: string, config: Config) => {
  const { DIMENSION_X, DIMENSION_Y } = config;

  const canvas = createCanvas(DIMENSION_X, DIMENSION_Y);
  const context = canvas.getContext("2d");

  const img = await loadImage(path);

  context.drawImage(img, 0, 0);

  const imageData = context.getImageData(0, 0, DIMENSION_X, DIMENSION_Y);

  const paddedArr = imageData.data;

  return paddedArr;
};
