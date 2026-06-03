function quantizeMedianCut(data: Uint8ClampedArray, width: number, height: number, maxColors: number): { palette: number[][]; indices: Uint8Array } {
  const totalPixels = width * height;

  const refs: number[] = new Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) refs[i] = i;

  interface Box {
    lo: number;
    hi: number;
  }

  function calcRange(lo: number, hi: number): { rng: number; axis: number } {
    if (lo >= hi) return { rng: -1, axis: 0 };
    let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
    for (let i = lo; i <= hi; i++) {
      const ref = refs[i];
      const idx = ref * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r < rMin) rMin = r;
      if (r > rMax) rMax = r;
      if (g < gMin) gMin = g;
      if (g > gMax) gMax = g;
      if (b < bMin) bMin = b;
      if (b > bMax) bMax = b;
    }
    const rRng = rMax - rMin, gRng = gMax - gMin, bRng = bMax - bMin;
    let axis = 0, maxRng = rRng;
    if (gRng > maxRng) { axis = 1; maxRng = gRng; }
    if (bRng > maxRng) { axis = 2; maxRng = bRng; }
    return { rng: maxRng, axis };
  }

  function splitByAxis(lo: number, hi: number, axis: number): number {
    const sub = refs.slice(lo, hi + 1);
    sub.sort((a, b) => {
      const va = data[a * 4 + axis], vb = data[b * 4 + axis];
      return va - vb;
    });
    const mid = Math.floor(sub.length / 2);
    for (let i = 0; i < sub.length; i++) refs[lo + i] = sub[i];
    return lo + mid;
  }

  const boxes: (Box & { rng: number; axis: number })[] = [
    { lo: 0, hi: totalPixels - 1, ...calcRange(0, totalPixels - 1) }
  ];

  while (boxes.length < maxColors) {
    let maxRng = -1, maxIdx = -1;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].rng > maxRng) { maxRng = boxes[i].rng; maxIdx = i; }
    }
    if (maxIdx === -1 || maxRng < 1) break;

    const box = boxes[maxIdx];
    const split = splitByAxis(box.lo, box.hi, box.axis);
    const loBox = { lo: box.lo, hi: split - 1, ...calcRange(box.lo, split - 1) };
    const hiBox = { lo: split, hi: box.hi, ...calcRange(split, box.hi) };
    boxes[maxIdx] = loBox;
    boxes.push(hiBox);
  }

  const palette: number[][] = [];
  for (const box of boxes) {
    if (box.lo > box.hi) { palette.push([0, 0, 0]); continue; }
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (let i = box.lo; i <= box.hi; i++) {
      const ref = refs[i];
      const idx = ref * 4;
      rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2]; count++;
    }
    palette.push([Math.round(rSum / count), Math.round(gSum / count), Math.round(bSum / count)]);
  }

  while (palette.length < maxColors) palette.push([0, 0, 0]);

  const indices = new Uint8Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
    if (a < 128) { indices[i] = 0; continue; }
    let bestDist = Infinity, bestIdx = 0;
    for (let j = 0; j < palette.length; j++) {
      const dr = r - palette[j][0], dg = g - palette[j][1], db = b - palette[j][2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) { bestDist = dist; bestIdx = j; }
    }
    indices[i] = bestIdx;
  }

  return { palette, indices };
}

function lzwEncodeGIF(indices: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  const maxTableSize = 4096;

  let codeSize = minCodeSize + 1;
  let nextCode = clearCode + 2;

  const dict = new Map<string, number>();

  function initDict(): void {
    dict.clear();
    for (let i = 0; i < (1 << minCodeSize); i++) dict.set(String.fromCharCode(i), i);
    dict.set('CLR', clearCode);
    dict.set('EOI', eoiCode);
    nextCode = clearCode + 2;
    codeSize = minCodeSize + 1;
  }
  initDict();

  const bitStream: number[] = [];
  let bitBuffer = 0, bitCount = 0;

  function writeCode(code: number): void {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      bitStream.push(bitBuffer & 0xFF);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  }

  writeCode(clearCode);

  let current = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const next = indices[i];
    const key = current + ',' + next;
    const existing = dict.get(key);
    if (existing !== undefined) {
      current = existing;
    } else {
      writeCode(current);
      if (nextCode < maxTableSize) {
        dict.set(key, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
      } else {
        writeCode(clearCode);
        initDict();
      }
      current = next;
    }
  }
  writeCode(current);
  writeCode(eoiCode);
  if (bitCount > 0) bitStream.push(bitBuffer & 0xFF);

  return new Uint8Array(bitStream);
}

function write16LE(bytes: number[], val: number): void {
  bytes.push(val & 0xFF, (val >> 8) & 0xFF);
}

function writeSubBlocks(bytes: number[], data: Uint8Array): void {
  let offset = 0;
  while (offset < data.length) {
    const chunkSize = Math.min(255, data.length - offset);
    bytes.push(chunkSize);
    for (let i = 0; i < chunkSize; i++) bytes.push(data[offset + i]);
    offset += chunkSize;
  }
  bytes.push(0x00);
}

export function encodeGIF(imageData: ImageData): Blob {
  const { width, height } = imageData;
  const { palette, indices } = quantizeMedianCut(imageData.data, width, height, 256);

  const bytes: number[] = [];
  bytes.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);
  write16LE(bytes, width);
  write16LE(bytes, height);
  bytes.push(0xF7, 0x00, 0x00);

  for (let i = 0; i < 256; i++) {
    const c = palette[i] || [0, 0, 0];
    bytes.push(c[0], c[1], c[2]);
  }

  bytes.push(0x2C);
  write16LE(bytes, 0);
  write16LE(bytes, 0);
  write16LE(bytes, width);
  write16LE(bytes, height);
  bytes.push(0x00);

  bytes.push(0x08);
  const compressed = lzwEncodeGIF(indices, 8);
  writeSubBlocks(bytes, compressed);

  bytes.push(0x3B);

  return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
}

export function encodeTIFF(imageData: ImageData): Blob {
  const { data, width, height } = imageData;
  const spp = 4;
  const bps = 8;
  const rowBytes = width * spp;
  const stripByteCounts = rowBytes * height;

  const numIFDEntries = 14;
  const ifdOffset = 8;
  const entriesSize = 2 + numIFDEntries * 12 + 4;
  const bpsOffset = ifdOffset + entriesSize;
  const xresOffset = bpsOffset + 8;
  const yresOffset = xresOffset + 8;
  const extraOffset = yresOffset + 8;
  const pixelOffset = extraOffset + 2;

  const totalSize = pixelOffset + stripByteCounts;
  const buf = new ArrayBuffer(totalSize);
  const v = new DataView(buf);

  function u16(off: number, val: number) { v.setUint16(off, val, true); }
  function u32(off: number, val: number) { v.setUint32(off, val, true); }

  u16(0, 0x4949);
  u16(2, 42);
  u32(4, ifdOffset);

  u16(ifdOffset, numIFDEntries);

  let e = ifdOffset + 2;
  function entry(tag: number, type: number, count: number, value: number) {
    u16(e, tag);
    u16(e + 2, type);
    u32(e + 4, count);
    u32(e + 8, value);
    e += 12;
  }

  entry(254, 4, 1, 0);
  entry(256, 4, 1, width);
  entry(257, 4, 1, height);
  entry(258, 3, 4, bpsOffset);
  entry(259, 3, 1, 1);
  entry(262, 3, 1, 2);
  entry(273, 4, 1, pixelOffset);
  entry(277, 3, 1, spp);
  entry(278, 4, 1, height);
  entry(279, 4, 1, stripByteCounts);
  entry(282, 5, 1, xresOffset);
  entry(283, 5, 1, yresOffset);
  entry(296, 3, 1, 2);
  entry(338, 3, 1, extraOffset);

  u32(e, 0);

  u16(bpsOffset, 8); u16(bpsOffset + 2, 8); u16(bpsOffset + 4, 8); u16(bpsOffset + 6, 8);
  u32(xresOffset, 72); u32(xresOffset + 4, 1);
  u32(yresOffset, 72); u32(yresOffset + 4, 1);
  u16(extraOffset, 2);

  const pixels = new Uint8Array(buf, pixelOffset);
  for (let i = 0; i < data.length; i++) {
    pixels[i] = data[i];
  }

  return new Blob([buf], { type: 'image/tiff' });
}

export function encodeICO(pngBlob: Blob): Promise<Blob> {
  return pngBlob.arrayBuffer().then(pngData => {
    const pngBytes = new Uint8Array(pngData);
    const pngSize = pngBytes.length;

    const imgWidth = (pngBytes[16] << 24) | (pngBytes[17] << 16) | (pngBytes[18] << 8) | pngBytes[19];
    const imgHeight = (pngBytes[20] << 24) | (pngBytes[21] << 16) | (pngBytes[22] << 8) | pngBytes[23];

    const icoW = imgWidth >= 256 ? 0 : imgWidth;
    const icoH = imgHeight >= 256 ? 0 : imgHeight;

    const icoSize = 6 + 16 + pngSize;
    const icoBytes = new Uint8Array(icoSize);

    icoBytes[0] = 0x00; icoBytes[1] = 0x00;
    icoBytes[2] = 0x01; icoBytes[3] = 0x00;
    icoBytes[4] = 0x01; icoBytes[5] = 0x00;

    icoBytes[6] = icoW;  icoBytes[7] = icoH;
    icoBytes[8] = 0;    icoBytes[9] = 0;
    icoBytes[10] = 0;   icoBytes[11] = 0;
    icoBytes[12] = 0x01; icoBytes[13] = 0x00;
    icoBytes[14] = 0x20; icoBytes[15] = 0x00;
    icoBytes[16] = (pngSize >> 0) & 0xFF;
    icoBytes[17] = (pngSize >> 8) & 0xFF;
    icoBytes[18] = (pngSize >> 16) & 0xFF;
    icoBytes[19] = (pngSize >> 24) & 0xFF;
    icoBytes[20] = 22; 
    icoBytes[21] = 0;
    icoBytes[22] = 0;
    icoBytes[23] = 0;

    for (let i = 0; i < pngSize; i++) icoBytes[22 + i] = pngBytes[i];

    return new Blob([icoBytes], { type: 'image/x-icon' });
  });
}
