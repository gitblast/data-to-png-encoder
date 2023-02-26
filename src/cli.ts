#! /usr/bin/env node

import { join } from "path";
import {
  checkBuffersMatch,
  pack,
  readBuffer,
  uint8arrToPng,
  unpack,
  writeBuffer,
} from "./lib";

import fs from "fs";

import config from "./config";

const { FILEPATH, FILENAME, EXT, values } = config;

if (!fs.existsSync("build")) {
  fs.mkdirSync("build");
}

export const start = async () => {
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

  console.log("Done");
};

start();
