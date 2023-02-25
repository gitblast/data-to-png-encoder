import { BYTES_CAPACITY } from "./consts";

export const getBuffer = (keys: number) => {
  const object: Record<string, number> = {};

  for (let i = 0; i < keys; i++) {
    object[i.toString()] = i;
  }

  const str = JSON.stringify(object);

  const buffer = Buffer.from(str);

  return buffer;
};

export const packBuffer = (buffer: Buffer) => {
  const length = buffer.length;

  if (length > BYTES_CAPACITY) {
    throw new Error(`Buffer too large (${length} > ${BYTES_CAPACITY}))`);
  }

  const clamped = new Uint8ClampedArray(length);

  for (let i = 0; i < buffer.length; i++) {
    clamped[i] = buffer[i];
  }

  return clamped;
};

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

// const getLengthBytes = () => {
//   let lengthBytes = 0;

//   while (1 << (lengthBytes * 8) < BYTES_CAPACITY) {
//     lengthBytes++;
//   }

//   return lengthBytes;
// };
