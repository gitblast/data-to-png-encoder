# file-to-png-encoder

_This project was created for fun, any real use case should probably use something else._

A small command line tool to encode any data into a png image. Disk space running low? Encode your data into images and upload to your favorite social media for infinite cloud storage!

Here is this README document encoded into a 30x30 png image:

![image](./example/README.md.packed.png)

Decoding the image with this tool will result in this exact same README file.

## Installation

Install dependencies & build:

```bash
yarn && yarn build
```

## Usage

### Encode any file

```bash
npx . README.md
```

This will create a file named `README.md.packed.png`. The files created by the program are created in a folder named `build`.

### Decode any file encoded with this tool:

```bash
npx . -d README.md.packed.png
```

This will create a file named `unpacked_README.md` matching the original file.

### With more options:

Create an image of size 30x30 pixels, with the `verbose` and `check` flags enabled.

```bash
npx . -cv --width=30 --height=30 README.md
```

Output:

```bash
Image width: 30
Image height: 30
Pixel total: 900
Bytes total: 3600
Input buffer length: 1546
Needed bytes: 2068
Packed bytes capacity: 2699
Buffers match
Done
```

## API

Filename must be given as the first argument.

The following flags are available to modify the functionality:

```javascript
options: {
    // decode an encoded image instead of encoding
    decode: {
      type: "boolean",
      short: "d",
    },
    // output information about the execution
    verbose: {
      type: "boolean",
      short: "v",
    },
    // after encoding, decode the image and verify that the decoded data matches the original.
    check: {
      type: "boolean",
      short: "c",
    },
    // set the width of the image in pixels, default 854
    width: {
      type: "string",
    },
    // set the height of the image in pixels, default 480
    height: {
      type: "string",
    },
  },
```
