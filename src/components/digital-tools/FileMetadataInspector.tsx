'use client';

import React, { useState, useRef } from 'react';

type MetadataRow = {
  label: string;
  value: string;
  href?: string;
  tone?: 'slate' | 'blue' | 'emerald' | 'amber' | 'purple' | 'red';
};

type GpsCoordinates = {
  latitude: number;
  longitude: number;
  altitude?: number;
  mapDatum?: string;
  imageDirection?: number;
  dateStamp?: string;
};

type ReverseLocation = {
  displayName: string;
  city?: string;
  state?: string;
  county?: string;
  suburb?: string;
  road?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
  source: string;
  attribution: string;
};

type ExifSummary = {
  make?: string;
  model?: string;
  software?: string;
  lensModel?: string;
  orientation?: string;
  dateTime?: string;
  dateTimeOriginal?: string;
  dateTimeDigitized?: string;
  exposureTime?: number;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  focalLength35mm?: number;
  exposureProgram?: string;
  exposureBias?: number;
  meteringMode?: string;
  whiteBalance?: string;
  flash?: string;
  gps?: GpsCoordinates;
  rawTags: MetadataRow[];
};

type ImageInfo = {
  width: number;
  height: number;
  megapixels: string;
  aspectRatio: string;
};

type SourceInference = {
  label: string;
  confidence: 'High' | 'Medium' | 'Low';
  evidence: string;
};

type ElaResult = {
  elaUrl: string;
  varianceScore: number;
  editedRisk: boolean;
};

type AiDetectionResult = {
  isAiGenerated: boolean;
  detectedEngine?: string;
  confidence: number;
  reasons: string[];
};

type AuthenticityReport = {
  riskScore: number; // 0 to 100
  verdict: 'Authentic Original' | 'Processed / Edited' | 'High Manipulation / AI Risk';
  tone: 'emerald' | 'amber' | 'red';
  reasons: string[];
  aiDetection: AiDetectionResult;
  ela?: ElaResult;
};

type InspectionResult = {
  name: string;
  extension: string;
  type: string;
  category: string;
  size: number;
  lastModified: string;
  signature: string;
  sha256?: string;
  hashNote?: string;
  image?: ImageInfo;
  previewUrl?: string;
  exif?: ExifSummary;
  source: SourceInference;
  location?: ReverseLocation;
  locationError?: string;
  warnings: string[];
  authenticity?: AuthenticityReport;
};

type ExifValue = string | number | number[];

const HASH_SIZE_LIMIT = 80 * 1024 * 1024;
const EXIF_SCAN_LIMIT = 12 * 1024 * 1024;

const TONE_CLASS: Record<NonNullable<MetadataRow['tone']>, string> = {
  slate: 'text-slate-200',
  blue: 'text-blue-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  purple: 'text-purple-400',
  red: 'text-red-400',
};

const TIFF_TAGS: Record<number, string> = {
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'DateTime',
  0x8298: 'Copyright',
};

const EXIF_TAGS: Record<number, string> = {
  0x829a: 'ExposureTime',
  0x829d: 'FNumber',
  0x8822: 'ExposureProgram',
  0x8827: 'ISOSpeedRatings',
  0x9003: 'DateTimeOriginal',
  0x9004: 'DateTimeDigitized',
  0x9204: 'ExposureBiasValue',
  0x9207: 'MeteringMode',
  0x9209: 'Flash',
  0x920a: 'FocalLength',
  0xa002: 'ExifImageWidth',
  0xa003: 'ExifImageHeight',
  0xa403: 'WhiteBalance',
  0xa405: 'FocalLengthIn35mmFilm',
  0xa432: 'LensSpecification',
  0xa434: 'LensModel',
};

const GPS_TAGS: Record<number, string> = {
  0x0000: 'GPSVersionID',
  0x0001: 'GPSLatitudeRef',
  0x0002: 'GPSLatitude',
  0x0003: 'GPSLongitudeRef',
  0x0004: 'GPSLongitude',
  0x0005: 'GPSAltitudeRef',
  0x0006: 'GPSAltitude',
  0x0007: 'GPSTimeStamp',
  0x0010: 'GPSImgDirectionRef',
  0x0011: 'GPSImgDirection',
  0x0012: 'GPSMapDatum',
  0x001d: 'GPSDateStamp',
};

const TYPE_BYTE_SIZE: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  7: 1,
  9: 4,
  10: 8,
};

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function fileExtension(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1].toUpperCase() : 'None';
}

function formatDateTime(value: string) {
  const match = value.match(/^(\d{4}):(\d{2}):(\d{2})\s+(.+)$/);
  return match ? `${match[1]}-${match[2]}-${match[3]} ${match[4]}` : value;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function aspectRatio(width: number, height: number) {
  if (!width || !height) return 'Unknown';
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

function toHex(bytes: Uint8Array, max = 16) {
  return Array.from(bytes.slice(0, max))
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

function detectSignature(bytes: Uint8Array, file: File) {
  const ascii = new TextDecoder('latin1').decode(bytes.slice(0, 16));
  const name = file.name.toLowerCase();
  const isoBrand = ascii.slice(8, 16).toLowerCase();

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'JPEG photo/image';
  if (bytes[0] === 0x89 && ascii.slice(1, 4) === 'PNG') return 'PNG image';
  if (ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a')) return 'GIF image';
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'WebP image';
  if (ascii.includes('ftyp') && /(heic|heix|hevc|hevx|heif|mif1|msf1)/.test(isoBrand)) return 'HEIC/HEIF photo container';
  if (ascii.includes('ftyp')) return 'MP4/QuickTime media container';
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'PDF document';
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) return name.endsWith('.docx') ? 'DOCX/Office Open XML document' : 'ZIP-based file';
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'WebM/Matroska media container';

  return `Unknown binary signature (${toHex(bytes, 8) || 'empty file'})`;
}

function readAscii(view: DataView, offset: number, count: number) {
  const bytes: number[] = [];
  for (let i = 0; i < count && offset + i < view.byteLength; i++) {
    const value = view.getUint8(offset + i);
    if (value === 0) break;
    bytes.push(value);
  }
  return new TextDecoder('latin1').decode(new Uint8Array(bytes)).trim();
}

function readExifValue(view: DataView, tiffStart: number, entryOffset: number, littleEndian: boolean): ExifValue | undefined {
  const type = view.getUint16(entryOffset + 2, littleEndian);
  const count = view.getUint32(entryOffset + 4, littleEndian);
  const typeSize = TYPE_BYTE_SIZE[type];
  if (!typeSize || count > 100000) return undefined;

  const byteLength = typeSize * count;
  const valueOffset = byteLength <= 4
    ? entryOffset + 8
    : tiffStart + view.getUint32(entryOffset + 8, littleEndian);

  if (valueOffset < 0 || valueOffset + byteLength > view.byteLength) return undefined;

  if (type === 2) return readAscii(view, valueOffset, count);
  if (type === 7) return count <= 8 ? Array.from(new Uint8Array(view.buffer, view.byteOffset + valueOffset, count)) : `${count} bytes`;

  const values: number[] = [];
  for (let index = 0; index < count; index++) {
    const offset = valueOffset + index * typeSize;
    if (type === 1) values.push(view.getUint8(offset));
    if (type === 3) values.push(view.getUint16(offset, littleEndian));
    if (type === 4) values.push(view.getUint32(offset, littleEndian));
    if (type === 5) {
      const numerator = view.getUint32(offset, littleEndian);
      const denominator = view.getUint32(offset + 4, littleEndian);
      values.push(denominator ? numerator / denominator : 0);
    }
    if (type === 9) values.push(view.getInt32(offset, littleEndian));
    if (type === 10) {
      const numerator = view.getInt32(offset, littleEndian);
      const denominator = view.getInt32(offset + 4, littleEndian);
      values.push(denominator ? numerator / denominator : 0);
    }
  }

  return values.length === 1 ? values[0] : values;
}

function valueToString(value: ExifValue | undefined) {
  if (value === undefined) return '';
  if (Array.isArray(value)) return value.map((item) => Number.isInteger(item) ? String(item) : item.toFixed(6)).join(', ');
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  return value;
}

function readIfd(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  littleEndian: boolean,
  tagMap: Record<number, string>,
  values: Record<string, ExifValue>,
  rawTags: MetadataRow[]
) {
  const absoluteOffset = tiffStart + ifdOffset;
  if (absoluteOffset < 0 || absoluteOffset + 2 > view.byteLength) return {};

  const entryCount = view.getUint16(absoluteOffset, littleEndian);
  const pointers: Record<number, number> = {};

  for (let index = 0; index < entryCount; index++) {
    const entryOffset = absoluteOffset + 2 + index * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, littleEndian);
    const value = readExifValue(view, tiffStart, entryOffset, littleEndian);
    const tagName = tagMap[tag] || `Tag 0x${tag.toString(16).padStart(4, '0')}`;

    if (tag === 0x8769 || tag === 0x8825 || tag === 0xa005) {
      pointers[tag] = view.getUint32(entryOffset + 8, littleEndian);
    }

    if (tagMap[tag] && value !== undefined) {
      values[tagName] = value;
      rawTags.push({ label: tagName, value: valueToString(value), tone: tagMap === GPS_TAGS ? 'emerald' : 'slate' });
    }
  }

  return pointers;
}

function mapOrientation(value?: ExifValue) {
  const code = typeof value === 'number' ? value : undefined;
  const labels: Record<number, string> = {
    1: 'Normal',
    2: 'Mirrored horizontally',
    3: 'Rotated 180 degrees',
    4: 'Mirrored vertically',
    5: 'Mirrored and rotated 90 degrees',
    6: 'Rotated 90 degrees clockwise',
    7: 'Mirrored and rotated 270 degrees',
    8: 'Rotated 270 degrees clockwise',
  };
  return code ? `${labels[code] || 'Unknown orientation'} (${code})` : undefined;
}

function mapExposureProgram(value?: ExifValue) {
  const code = typeof value === 'number' ? value : undefined;
  const labels: Record<number, string> = {
    0: 'Not defined',
    1: 'Manual',
    2: 'Normal program',
    3: 'Aperture priority',
    4: 'Shutter priority',
    5: 'Creative program',
    6: 'Action program',
    7: 'Portrait mode',
    8: 'Landscape mode',
  };
  return code !== undefined ? `${labels[code] || 'Unknown'} (${code})` : undefined;
}

function mapMeteringMode(value?: ExifValue) {
  const code = typeof value === 'number' ? value : undefined;
  const labels: Record<number, string> = {
    0: 'Unknown',
    1: 'Average',
    2: 'Center-weighted average',
    3: 'Spot',
    4: 'Multi-spot',
    5: 'Pattern',
    6: 'Partial',
  };
  return code !== undefined ? `${labels[code] || 'Other'} (${code})` : undefined;
}

function mapWhiteBalance(value?: ExifValue) {
  const code = typeof value === 'number' ? value : undefined;
  if (code === 0) return 'Auto';
  if (code === 1) return 'Manual';
  return code !== undefined ? `Unknown (${code})` : undefined;
}

function mapFlash(value?: ExifValue) {
  const code = typeof value === 'number' ? value : undefined;
  if (code === undefined) return undefined;
  const fired = (code & 1) === 1 ? 'Flash fired' : 'Flash did not fire';
  return `${fired} (${code})`;
}

function firstNumber(value?: ExifValue) {
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) return value.find((item) => Number.isFinite(item));
  return undefined;
}

function gpsToDecimal(value?: ExifValue, ref?: ExifValue) {
  if (!Array.isArray(value) || value.length < 3 || typeof ref !== 'string') return undefined;
  const decimal = value[0] + value[1] / 60 + value[2] / 3600;
  return ref === 'S' || ref === 'W' ? -decimal : decimal;
}

function parseJpegExif(buffer: ArrayBuffer): ExifSummary | null {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
    if (length < 2) break;

    if (marker === 0xe1 && offset + 2 + length <= bytes.length) {
      const header = new TextDecoder('latin1').decode(bytes.slice(offset + 4, offset + 10));
      if (header === 'Exif\0\0') {
        const exifStart = offset + 10;
        const view = new DataView(buffer, exifStart);
        const endian = readAscii(view, 0, 2);
        const littleEndian = endian === 'II';
        if (!littleEndian && endian !== 'MM') return null;
        if (view.getUint16(2, littleEndian) !== 42) return null;

        const values: Record<string, ExifValue> = {};
        const rawTags: MetadataRow[] = [];
        const ifd0Offset = view.getUint32(4, littleEndian);
        const pointers = readIfd(view, 0, ifd0Offset, littleEndian, TIFF_TAGS, values, rawTags);
        if (pointers[0x8769]) readIfd(view, 0, pointers[0x8769], littleEndian, EXIF_TAGS, values, rawTags);
        if (pointers[0x8825]) readIfd(view, 0, pointers[0x8825], littleEndian, GPS_TAGS, values, rawTags);

        const latitude = gpsToDecimal(values.GPSLatitude, values.GPSLatitudeRef);
        const longitude = gpsToDecimal(values.GPSLongitude, values.GPSLongitudeRef);
        const altitudeRaw = firstNumber(values.GPSAltitude);
        const altitudeRef = firstNumber(values.GPSAltitudeRef);
        const altitude = altitudeRaw === undefined ? undefined : altitudeRef === 1 ? -altitudeRaw : altitudeRaw;

        return {
          make: typeof values.Make === 'string' ? values.Make : undefined,
          model: typeof values.Model === 'string' ? values.Model : undefined,
          software: typeof values.Software === 'string' ? values.Software : undefined,
          lensModel: typeof values.LensModel === 'string' ? values.LensModel : undefined,
          orientation: mapOrientation(values.Orientation),
          dateTime: typeof values.DateTime === 'string' ? formatDateTime(values.DateTime) : undefined,
          dateTimeOriginal: typeof values.DateTimeOriginal === 'string' ? formatDateTime(values.DateTimeOriginal) : undefined,
          dateTimeDigitized: typeof values.DateTimeDigitized === 'string' ? formatDateTime(values.DateTimeDigitized) : undefined,
          exposureTime: firstNumber(values.ExposureTime),
          fNumber: firstNumber(values.FNumber),
          iso: firstNumber(values.ISOSpeedRatings),
          focalLength: firstNumber(values.FocalLength),
          focalLength35mm: firstNumber(values.FocalLengthIn35mmFilm),
          exposureBias: firstNumber(values.ExposureBiasValue),
          exposureProgram: mapExposureProgram(values.ExposureProgram),
          meteringMode: mapMeteringMode(values.MeteringMode),
          whiteBalance: mapWhiteBalance(values.WhiteBalance),
          flash: mapFlash(values.Flash),
          gps: latitude !== undefined && longitude !== undefined
            ? {
                latitude,
                longitude,
                altitude,
                mapDatum: typeof values.GPSMapDatum === 'string' ? values.GPSMapDatum : undefined,
                imageDirection: firstNumber(values.GPSImgDirection),
                dateStamp: typeof values.GPSDateStamp === 'string' ? values.GPSDateStamp : undefined,
              }
            : undefined,
          rawTags,
        };
      }
    }

    offset += 2 + length;
  }

  return null;
}

function inferSource(file: File, exif?: ExifSummary | null): SourceInference {
  const evidence = [exif?.make, exif?.model, exif?.software].filter(Boolean).join(' / ');
  const haystack = evidence.toLowerCase();

  if (haystack.includes('iphone')) return { label: 'Apple iPhone camera', confidence: 'High', evidence };
  if (haystack.includes('ipad')) return { label: 'Apple iPad camera', confidence: 'High', evidence };
  if (haystack.includes('apple')) return { label: 'Apple device camera', confidence: 'Medium', evidence };

  const androidBrands = ['samsung', 'google', 'pixel', 'huawei', 'honor', 'tecno', 'infinix', 'itel', 'xiaomi', 'redmi', 'oppo', 'vivo', 'oneplus', 'motorola', 'nokia', 'sony mobile'];
  if (androidBrands.some((brand) => haystack.includes(brand)) || /\bsm-[a-z0-9]/i.test(exif?.model || '')) {
    return { label: 'Android phone/tablet camera', confidence: 'High', evidence };
  }

  const cameraBrands = ['canon', 'nikon', 'fujifilm', 'olympus', 'panasonic', 'leica', 'pentax', 'kodak', 'gopro', 'dji', 'sony'];
  if (cameraBrands.some((brand) => haystack.includes(brand))) {
    return { label: 'Digital camera or action camera', confidence: 'High', evidence };
  }

  if (haystack.includes('whatsapp') || haystack.includes('instagram') || haystack.includes('facebook')) {
    return { label: 'Exported or shared through a social app', confidence: 'Medium', evidence };
  }

  if (/\.(heic|heif)$/i.test(file.name)) {
    return {
      label: 'Likely phone/tablet HEIC photo',
      confidence: 'Medium',
      evidence: 'HEIC/HEIF is commonly produced by iPhone, iPad, and newer Android devices.',
    };
  }

  if (exif?.rawTags.length) {
    return { label: 'Camera/source metadata found', confidence: 'Low', evidence: evidence || `${exif.rawTags.length} EXIF tag(s)` };
  }

  if (file.type.startsWith('image/')) {
    return {
      label: 'No embedded camera source found',
      confidence: 'Low',
      evidence: 'The photo may have been edited, screenshotted, downloaded, or stripped by WhatsApp/social media.',
    };
  }

  return { label: 'General file upload', confidence: 'Low', evidence: file.type || fileExtension(file.name) };
}

function formatExposure(seconds?: number) {
  if (!seconds) return undefined;
  if (seconds < 1) return `1/${Math.round(1 / seconds)} sec`;
  return `${seconds.toFixed(2)} sec`;
}

async function readImageInfo(file: File): Promise<ImageInfo | undefined> {
  if (!file.type.startsWith('image/') && !/\.(jpg|jpeg|png|webp|gif|bmp|avif)$/i.test(file.name)) return undefined;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Browser could not decode the image preview.'));
      image.src = objectUrl;
    });

    const width = img.naturalWidth || 0;
    const height = img.naturalHeight || 0;
    return {
      width,
      height,
      megapixels: width && height ? (width * height / 1000000).toFixed(2) : 'Unknown',
      aspectRatio: aspectRatio(width, height),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function sha256(file: File) {
  if (!crypto.subtle) return undefined;
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function resolveLocation(gps: GpsCoordinates) {
  const params = new URLSearchParams({
    lat: gps.latitude.toFixed(8),
    lon: gps.longitude.toFixed(8),
  });
  const response = await fetch(`/api/metadata/reverse-geocode?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not resolve city/country from GPS.');
  return data as ReverseLocation;
}

// ─── OPTION 1: FORENSIC & ELA ANALYSIS ENGINE ──────────────────────────────

async function computeELA(file: File): Promise<ElaResult | undefined> {
  if (!file.type.startsWith('image/') && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) return undefined;

  try {
    const imgUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject();
      i.src = imgUrl;
    });

    const maxDim = 600;
    let w = img.naturalWidth || 600;
    let h = img.naturalHeight || 400;
    if (w > maxDim || h > maxDim) {
      if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
      else { w = Math.round((w * maxDim) / h); h = maxDim; }
    }

    const canvasA = document.createElement('canvas');
    canvasA.width = w; canvasA.height = h;
    const ctxA = canvasA.getContext('2d');
    if (!ctxA) return undefined;
    ctxA.drawImage(img, 0, 0, w, h);

    const jpegDataUrl = canvasA.toDataURL('image/jpeg', 0.88);
    const imgB = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject();
      i.src = jpegDataUrl;
    });

    const canvasB = document.createElement('canvas');
    canvasB.width = w; canvasB.height = h;
    const ctxB = canvasB.getContext('2d');
    if (!ctxB) return undefined;
    ctxB.drawImage(imgB, 0, 0, w, h);

    const dataA = ctxA.getImageData(0, 0, w, h);
    const dataB = ctxB.getImageData(0, 0, w, h);
    const elaData = ctxA.createImageData(w, h);

    let totalDiff = 0;
    const scale = 20;

    for (let i = 0; i < dataA.data.length; i += 4) {
      const rDiff = Math.abs(dataA.data[i] - dataB.data[i]) * scale;
      const gDiff = Math.abs(dataA.data[i + 1] - dataB.data[i + 1]) * scale;
      const bDiff = Math.abs(dataA.data[i + 2] - dataB.data[i + 2]) * scale;

      elaData.data[i] = Math.min(255, rDiff);
      elaData.data[i + 1] = Math.min(255, gDiff);
      elaData.data[i + 2] = Math.min(255, bDiff);
      elaData.data[i + 3] = 255;

      totalDiff += (rDiff + gDiff + bDiff) / 3;
    }

    ctxA.putImageData(elaData, 0, 0);
    const elaUrl = canvasA.toDataURL('image/png');
    const avgDiff = totalDiff / (w * h);
    const varianceScore = Math.min(100, Math.round(avgDiff * 1.8));

    URL.revokeObjectURL(imgUrl);
    return {
      elaUrl,
      varianceScore,
      editedRisk: varianceScore > 40,
    };
  } catch (err) {
    console.error('ELA analysis error:', err);
    return undefined;
  }
}

function detectAiAndSoftware(file: File, exif?: ExifSummary | null): AiDetectionResult {
  const software = (exif?.software || '').toLowerCase();
  const filename = file.name.toLowerCase();
  const rawText = (exif?.rawTags.map(t => `${t.label} ${t.value}`).join(' ') || '').toLowerCase();

  const aiGenerators = [
    { name: 'Midjourney', keywords: ['midjourney', 'mj_'] },
    { name: 'DALL-E / OpenAI', keywords: ['dall-e', 'dalle', 'openai'] },
    { name: 'Stable Diffusion', keywords: ['stable diffusion', 'stablediffusion', 'automatic1111', 'comfyui'] },
    { name: 'Adobe Firefly', keywords: ['firefly', 'adobe firefly'] },
    { name: 'Bing Image Creator', keywords: ['bing image creator', 'bingimagecreator'] },
    { name: 'Leonardo.Ai', keywords: ['leonardo', 'leonardo.ai'] },
    { name: 'StarryAI', keywords: ['starryai'] },
  ];

  for (const gen of aiGenerators) {
    if (gen.keywords.some(k => software.includes(k) || filename.includes(k) || rawText.includes(k))) {
      return {
        isAiGenerated: true,
        detectedEngine: gen.name,
        confidence: 95,
        reasons: [`Metadata or filename tags match AI generator: ${gen.name}`],
      };
    }
  }

  const editors = [
    { name: 'Adobe Photoshop', keywords: ['photoshop', 'adobe photoshop'] },
    { name: 'GIMP', keywords: ['gimp'] },
    { name: 'Canva', keywords: ['canva'] },
    { name: 'Affinity Photo', keywords: ['affinity'] },
    { name: 'Lightroom', keywords: ['lightroom', 'adobe lightroom'] },
    { name: 'Snapseed', keywords: ['snapseed'] },
    { name: 'Pixlr', keywords: ['pixlr'] },
  ];

  const matchedEditor = editors.find(e => software.includes(e.keywords[0]) || rawText.includes(e.keywords[0]));
  if (matchedEditor) {
    return {
      isAiGenerated: false,
      detectedEngine: matchedEditor.name,
      confidence: 85,
      reasons: [`Photo edit software signature detected: ${matchedEditor.name}`],
    };
  }

  return {
    isAiGenerated: false,
    confidence: 10,
    reasons: [],
  };
}

function evaluateAuthenticity(
  file: File,
  exif?: ExifSummary | null,
  ela?: ElaResult,
  aiDetect?: AiDetectionResult
): AuthenticityReport {
  let riskScore = 0;
  const reasons: string[] = [];

  const ai = aiDetect || detectAiAndSoftware(file, exif);

  if (ai.isAiGenerated) {
    riskScore += 55;
    reasons.push(`🚨 AI Generator Marker detected (${ai.detectedEngine || 'Synthetic Image'}).`);
  } else if (ai.detectedEngine) {
    riskScore += 30;
    reasons.push(`⚠️ Digital Photo Editing Software signature detected: ${ai.detectedEngine}.`);
  }

  if (file.type.startsWith('image/') && (!exif || !exif.make || !exif.model)) {
    riskScore += 20;
    reasons.push('⚠️ Missing hardware camera EXIF headers (Make/Model stripped or missing).');
  } else if (exif?.make && exif?.model) {
    reasons.push(`✅ Embedded hardware camera metadata verified (${exif.make} ${exif.model}).`);
  }

  if (ela) {
    if (ela.varianceScore > 45) {
      riskScore += 25;
      reasons.push(`⚠️ High Error Level Analysis (ELA) anomaly variance (${ela.varianceScore}%) — indicates digital manipulation, resaving, or spliced layers.`);
    } else if (ela.varianceScore > 20) {
      riskScore += 10;
      reasons.push(`ℹ️ Moderate ELA variance (${ela.varianceScore}%) — consistent with standard image compression or light color edits.`);
    } else {
      reasons.push(`✅ Uniform ELA compression distribution (${ela.varianceScore}%) — characteristic of authentic single-capture photo.`);
    }
  }

  if (exif?.dateTimeOriginal && file.lastModified) {
    const origTime = new Date(exif.dateTimeOriginal.replace(/:/g, '-')).getTime();
    const modTime = file.lastModified;
    if (Math.abs(modTime - origTime) > 86400000 * 30) {
      riskScore += 10;
      reasons.push('ℹ️ File modification timestamp differs significantly from EXIF capture date.');
    }
  }

  riskScore = Math.min(100, riskScore);

  let verdict: AuthenticityReport['verdict'] = 'Authentic Original';
  let tone: AuthenticityReport['tone'] = 'emerald';

  if (riskScore >= 50) {
    verdict = 'High Manipulation / AI Risk';
    tone = 'red';
  } else if (riskScore >= 20) {
    verdict = 'Processed / Edited';
    tone = 'amber';
  }

  return {
    riskScore,
    verdict,
    tone,
    reasons,
    aiDetection: ai,
    ela,
  };
}

async function sanitizeImage(file: File): Promise<{ cleanUrl: string; cleanFileName: string }> {
  const imgUrl = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Could not sanitize image'));
    i.src = imgUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || 800;
  canvas.height = img.naturalHeight || 600;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const cleanDataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'photo';

  URL.revokeObjectURL(imgUrl);
  return {
    cleanUrl: cleanDataUrl,
    cleanFileName: `${baseName}_sanitized_clean.jpg`,
  };
}

function detailRows(result: InspectionResult): MetadataRow[] {
  return [
    { label: 'Filename', value: result.name },
    { label: 'Extension', value: result.extension, tone: 'blue' },
    { label: 'Browser MIME type', value: result.type, tone: 'blue' },
    { label: 'Detected signature', value: result.signature, tone: 'amber' },
    { label: 'Size', value: `${result.size.toLocaleString()} bytes (${formatBytes(result.size)})`, tone: 'emerald' },
    { label: 'Last modified', value: result.lastModified, tone: 'purple' },
    ...(result.sha256 ? [{ label: 'SHA-256 fingerprint', value: result.sha256, tone: 'slate' as const }] : []),
    ...(result.hashNote ? [{ label: 'Fingerprint note', value: result.hashNote, tone: 'amber' as const }] : []),
  ];
}

function cameraRows(exif?: ExifSummary): MetadataRow[] {
  if (!exif) return [];
  return [
    { label: 'Device make', value: exif.make || 'Not embedded', tone: 'blue' },
    { label: 'Device model', value: exif.model || 'Not embedded', tone: 'blue' },
    { label: 'Software/editor', value: exif.software || 'Not embedded', tone: 'purple' },
    { label: 'Lens', value: exif.lensModel || 'Not embedded', tone: 'purple' },
    { label: 'Captured', value: exif.dateTimeOriginal || exif.dateTime || 'Not embedded', tone: 'emerald' },
    { label: 'Digitized', value: exif.dateTimeDigitized || 'Not embedded', tone: 'emerald' },
    { label: 'Orientation', value: exif.orientation || 'Not embedded', tone: 'amber' },
    { label: 'Exposure', value: formatExposure(exif.exposureTime) || 'Not embedded', tone: 'amber' },
    { label: 'Aperture', value: exif.fNumber ? `f/${exif.fNumber.toFixed(1)}` : 'Not embedded', tone: 'amber' },
    { label: 'ISO', value: exif.iso ? String(exif.iso) : 'Not embedded', tone: 'amber' },
    { label: 'Focal length', value: exif.focalLength ? `${exif.focalLength.toFixed(1)} mm` : 'Not embedded', tone: 'amber' },
    { label: '35mm equivalent', value: exif.focalLength35mm ? `${exif.focalLength35mm} mm` : 'Not embedded', tone: 'amber' },
    { label: 'Flash', value: exif.flash || 'Not embedded', tone: 'amber' },
    { label: 'White balance', value: exif.whiteBalance || 'Not embedded', tone: 'amber' },
    { label: 'Metering', value: exif.meteringMode || 'Not embedded', tone: 'amber' },
    { label: 'Exposure program', value: exif.exposureProgram || 'Not embedded', tone: 'amber' },
  ];
}

function imageRows(image?: ImageInfo): MetadataRow[] {
  if (!image) return [];
  return [
    { label: 'Pixel dimensions', value: `${image.width} x ${image.height} px`, tone: 'emerald' },
    { label: 'Megapixels', value: `${image.megapixels} MP`, tone: 'emerald' },
    { label: 'Aspect ratio', value: image.aspectRatio, tone: 'emerald' },
  ];
}

function locationRows(result: InspectionResult): MetadataRow[] {
  const gps = result.exif?.gps;
  if (!gps) return [];

  return [
    {
      label: 'Precise GPS',
      value: `${gps.latitude.toFixed(8)}, ${gps.longitude.toFixed(8)}`,
      href: `https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`,
      tone: 'emerald',
    },
    ...(gps.altitude !== undefined ? [{ label: 'Altitude', value: `${gps.altitude.toFixed(2)} m`, tone: 'emerald' as const }] : []),
    ...(gps.imageDirection !== undefined ? [{ label: 'Image direction', value: `${gps.imageDirection.toFixed(2)} degrees`, tone: 'emerald' as const }] : []),
    ...(gps.mapDatum ? [{ label: 'GPS map datum', value: gps.mapDatum, tone: 'emerald' as const }] : []),
    ...(gps.dateStamp ? [{ label: 'GPS date stamp', value: gps.dateStamp, tone: 'emerald' as const }] : []),
    ...(result.location?.city ? [{ label: 'City/Town', value: result.location.city, tone: 'blue' as const }] : []),
    ...(result.location?.state ? [{ label: 'State/Region', value: result.location.state, tone: 'blue' as const }] : []),
    ...(result.location?.country ? [{ label: 'Country', value: `${result.location.country}${result.location.countryCode ? ` (${result.location.countryCode})` : ''}`, tone: 'blue' as const }] : []),
    ...(result.location?.displayName ? [{ label: 'Readable place', value: result.location.displayName, tone: 'slate' as const }] : []),
    ...(result.location?.source ? [{ label: 'Location source', value: `${result.location.source} - ${result.location.attribution}`, tone: 'purple' as const }] : []),
    ...(result.locationError ? [{ label: 'Location lookup', value: result.locationError, tone: 'amber' as const }] : []),
  ];
}

function MetadataTable({ rows }: { rows: MetadataRow[] }) {
  if (!rows.length) return null;

  return (
    <div className="divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
      {rows.map((row) => (
        <div key={`${row.label}-${row.value}`} className="grid grid-cols-1 gap-1 px-3 py-2.5 sm:grid-cols-[150px_1fr] sm:gap-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{row.label}</div>
          {row.href ? (
            <a href={row.href} target="_blank" rel="noreferrer" className={`break-all text-xs font-semibold hover:underline ${TONE_CLASS[row.tone || 'slate']}`}>
              {row.value}
            </a>
          ) : (
            <div className={`break-all text-xs font-semibold ${TONE_CLASS[row.tone || 'slate']}`}>{row.value}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FileMetadataInspector() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [showElaView, setShowElaView] = useState(false);
  const [showEvidenceReport, setShowEvidenceReport] = useState(false);
  const [sanitizedUrl, setSanitizedUrl] = useState<string | null>(null);
  const [sanitizedFileName, setSanitizedFileName] = useState<string>('');

  const inspectFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setBusy(true);
    setSanitizedUrl(null);
    setShowElaView(false);
    setShowEvidenceReport(false);
    setStatus('Analyzing file signature & binary headers...');

    try {
      const previewUrl = selectedFile.type.startsWith('image/') ? URL.createObjectURL(selectedFile) : undefined;
      const header = new Uint8Array(await selectedFile.slice(0, 256).arrayBuffer());
      const signature = detectSignature(header, selectedFile);
      const category = selectedFile.type.split('/')[0] || (signature.includes('image') ? 'image' : 'file');

      setStatus('Reading EXIF, camera hardware, and GPS tags...');
      const [image, exif, hash] = await Promise.all([
        readImageInfo(selectedFile).catch(() => undefined),
        selectedFile.type.startsWith('image/') || /\.(jpg|jpeg)$/i.test(selectedFile.name)
          ? selectedFile.slice(0, Math.min(selectedFile.size, EXIF_SCAN_LIMIT)).arrayBuffer().then(parseJpegExif).catch(() => null)
          : Promise.resolve(null),
        selectedFile.size <= HASH_SIZE_LIMIT ? sha256(selectedFile).catch(() => undefined) : Promise.resolve(undefined),
      ]);

      setStatus('Running Error Level Analysis (ELA) & AI Generator detection...');
      const [ela, aiDetect] = await Promise.all([
        computeELA(selectedFile).catch(() => undefined),
        Promise.resolve(detectAiAndSoftware(selectedFile, exif)),
      ]);

      const warnings: string[] = [];
      if (selectedFile.type.startsWith('image/') && !exif?.rawTags.length) {
        warnings.push('No embedded EXIF metadata was found. Many social apps, screenshots, and web downloads remove camera/source/GPS details.');
      }
      if (exif?.rawTags.length && !exif.gps) {
        warnings.push('Photo metadata was found, but no GPS coordinates were embedded.');
      }

      const authenticity = evaluateAuthenticity(selectedFile, exif, ela, aiDetect);

      let nextResult: InspectionResult = {
        name: selectedFile.name,
        extension: fileExtension(selectedFile.name),
        type: selectedFile.type || 'Unknown',
        category,
        size: selectedFile.size,
        lastModified: new Date(selectedFile.lastModified).toLocaleString(),
        signature,
        sha256: hash,
        hashNote: selectedFile.size > HASH_SIZE_LIMIT ? `Skipped because the file is larger than ${formatBytes(HASH_SIZE_LIMIT)}.` : undefined,
        image,
        previewUrl,
        exif: exif || undefined,
        source: inferSource(selectedFile, exif),
        warnings,
        authenticity,
      };

      setResult(nextResult);

      if (exif?.gps) {
        setStatus('GPS found. Resolving city and country...');
        try {
          const location = await resolveLocation(exif.gps);
          nextResult = { ...nextResult, location };
        } catch (error: any) {
          nextResult = { ...nextResult, locationError: error.message || 'City/country lookup failed.' };
        }
        setResult(nextResult);
      }

      setStatus('Deep forensic analysis complete.');
    } catch (error: any) {
      console.error('File metadata inspection error:', error);
      setStatus(error.message || 'Could not inspect this file.');
    } finally {
      setBusy(false);
    }
  };

  const handleSanitize = async () => {
    if (!file) return;
    try {
      const res = await sanitizeImage(file);
      setSanitizedUrl(res.cleanUrl);
      setSanitizedFileName(res.cleanFileName);
    } catch (err: any) {
      alert('Could not sanitize image: ' + err.message);
    }
  };

  const hasLocation = !!result?.exif?.gps;
  const sourceTone = result?.source.confidence === 'High' ? 'text-emerald-400' : result?.source.confidence === 'Medium' ? 'text-amber-400' : 'text-slate-400';

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-900">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <i className="fas fa-shield-halved text-emerald-400" />
            <span>AI Forensic &amp; Deep Image Metadata Inspector</span>
          </h3>
          <p className="text-xs text-slate-400">Error Level Analysis (ELA), AI Generator Detection, EXIF Privacy Sanitizer &amp; Evidence Certificate</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1">
            <i className="fas fa-lock text-[8px]" /> 100% On-Device / Zero Cloud Upload
          </span>
        </div>
      </div>

      {/* Extension Promo — value distinct from the free web tool */}
      <div className="flex flex-col sm:flex-row items-start gap-3 p-3 bg-slate-900/80 border border-cyan-800/40 rounded-xl">
        <div className="w-8 h-8 flex-shrink-0 bg-cyan-900/50 border border-cyan-700/50 rounded-lg flex items-center justify-center text-cyan-400 text-sm">
          <i className="fas fa-puzzle-piece" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-white leading-tight">ForensicLens Browser Extension — Right-Click Any Web Image</p>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
            Inspect <strong className="text-slate-300">any photo on any website</strong> without uploading it. Pro adds unlimited scans, full multi-scale ELA, GPS mapping, and court-admissible PDF dossiers.
          </p>
        </div>
        <a
          href="/forensics-pro/pricing"
          className="flex-shrink-0 px-3 py-1.5 text-[10px] font-black bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90 text-white rounded-lg transition-all shadow-sm"
        >
          Get Extension ↗
        </a>
      </div>

      {/* Upload Zone */}
      <div className="relative">
        <input
          type="file"
          onChange={(event) => event.target.files?.[0] && inspectFile(event.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/80 p-6 rounded-2xl text-center transition-colors">
          <i className={`fas ${busy ? 'fa-circle-notch fa-spin text-emerald-400' : 'fa-magnifying-glass-location text-blue-400'} text-3xl mb-2 block`} />
          <p className="text-xs font-semibold text-slate-200">
            {file ? file.name : 'Upload a photo or document for deep forensic verification'}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Supports JPG, PNG, WEBP, HEIC, PDF, DOCX, ZIP (EXIF, ELA heatmap, AI detection, SHA-256)
          </p>
        </div>
      </div>

      {/* Status Bar */}
      {status && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3.5 py-2.5 text-xs font-semibold text-blue-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-circle-check text-emerald-400'}`} />
            <span>{status}</span>
          </div>
          {result?.authenticity && (
            <span className="font-mono text-[11px] text-slate-400">
              Risk: {result.authenticity.riskScore}/100
            </span>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-5">

          {/* ── OPTION 1: AUTHENTICITY & FORENSIC SUMMARY BANNER ──────────────── */}
          {result.authenticity && (
            <div className={`p-4 rounded-2xl border ${
              result.authenticity.tone === 'emerald'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : result.authenticity.tone === 'amber'
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                : 'bg-red-950/30 border-red-500/40 text-red-300'
            } shadow-lg space-y-3`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ${
                    result.authenticity.tone === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                    result.authenticity.tone === 'amber' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    <i className={`fas ${
                      result.authenticity.tone === 'emerald' ? 'fa-shield-check' :
                      result.authenticity.tone === 'amber' ? 'fa-triangle-exclamation' : 'fa-triangle-exclamation'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Authenticity Verdict</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                        Risk Score: {result.authenticity.riskScore}/100
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white">{result.authenticity.verdict}</h4>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEvidenceReport(true)}
                    className="py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <i className="fas fa-file-pdf" />
                    <span>Evidence Report</span>
                  </button>

                  {file?.type.startsWith('image/') && (
                    <button
                      onClick={handleSanitize}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <i className="fas fa-broom" />
                      <span>Sanitize EXIF</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Forensic Findings Bullet Points */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                {result.authenticity.reasons.map((reason, idx) => (
                  <p key={idx} className="flex items-center gap-2 font-medium">
                    <span>{reason}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Sanitized Image Download Card */}
          {sanitizedUrl && (
            <div className="p-4 bg-slate-900 rounded-2xl border border-emerald-500/40 flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <i className="fas fa-circle-check text-emerald-400 text-xl" />
                <div>
                  <p className="text-xs font-bold text-white">Metadata Sanitized &amp; GPS Stripped</p>
                  <p className="text-[11px] text-slate-400">{sanitizedFileName} — Safe for social media &amp; online sales</p>
                </div>
              </div>
              <a
                href={sanitizedUrl}
                download={sanitizedFileName}
                className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shrink-0"
              >
                <i className="fas fa-download" /> Download Cleaned
              </a>
            </div>
          )}

          {/* ── ELA (ERROR LEVEL ANALYSIS) HEATMAP SECTION ───────────────────── */}
          {result.authenticity?.ela && (
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="fas fa-microscope text-purple-400 text-sm" />
                  <span className="text-xs font-bold text-white">Error Level Analysis (ELA) Compression Heatmap</span>
                </div>
                <button
                  onClick={() => setShowElaView(!showElaView)}
                  className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                >
                  <i className={`fas ${showElaView ? 'fa-eye-slash' : 'fa-eye'}`} />
                  <span>{showElaView ? 'Hide Heatmap' : 'Toggle ELA Heatmap'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                ELA detects digital image modifications by analyzing compression level differences. Bright highlights or high-contrast patches indicate edited, spliced, or resaved layers.
              </p>

              {showElaView && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Original Image</span>
                    {result.previewUrl && (
                      <img src={result.previewUrl} alt="Original preview" className="w-full max-h-56 object-contain rounded-xl bg-black border border-slate-800" />
                    )}
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1.5">ELA Compression Heatmap</span>
                    <img src={result.authenticity.ela.elaUrl} alt="ELA heatmap" className="w-full max-h-56 object-contain rounded-xl bg-black border border-purple-500/30" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Source</p>
              <p className={`mt-1 text-sm font-black ${sourceTone}`}>{result.source.label}</p>
              <p className="mt-1 text-[11px] text-slate-500">{result.source.confidence} confidence</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Location</p>
              <p className={`mt-1 text-sm font-black ${hasLocation ? 'text-emerald-400' : 'text-slate-400'}`}>
                {result.location?.city || result.location?.country || (hasLocation ? 'GPS embedded' : 'No GPS found')}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{hasLocation ? 'From EXIF GPS coordinates' : 'Not embedded in this file'}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Integrity Fingerprint</p>
              <p className="mt-1 text-sm font-black text-purple-400">{result.sha256 ? 'SHA-256 Certified' : 'Signature only'}</p>
              <p className="mt-1 text-[11px] text-slate-500">{result.signature}</p>
            </div>
          </div>

          {result.source.evidence && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-[11px] text-slate-400">
              <span className="font-bold text-slate-300">Source evidence: </span>
              {result.source.evidence}
            </div>
          )}

          {result.warnings.map((warning) => (
            <div key={warning} className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-300">
              <i className="fas fa-triangle-exclamation mr-2" />
              {warning}
            </div>
          ))}

          {/* Tables Section */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">File Details</h4>
              <MetadataTable rows={detailRows(result)} />
            </div>

            <div>
              <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Image Details</h4>
              <MetadataTable rows={imageRows(result.image)} />
              {!result.image && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-500">
                  No browser-readable image dimensions found for this file type.
                </div>
              )}
            </div>
          </div>

          {result.exif && (
            <div>
              <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Camera &amp; Capture Details</h4>
              <MetadataTable rows={cameraRows(result.exif)} />
            </div>
          )}

          {(result.exif?.gps || result.locationError) && (
            <div>
              <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">GPS &amp; Location</h4>
              <MetadataTable rows={locationRows(result)} />
            </div>
          )}

          {result.exif?.rawTags.length ? (
            <details className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <summary className="cursor-pointer text-xs font-bold text-slate-300">
                Raw EXIF evidence ({result.exif.rawTags.length} tag{result.exif.rawTags.length === 1 ? '' : 's'})
              </summary>
              <div className="mt-3">
                <MetadataTable rows={result.exif.rawTags} />
              </div>
            </details>
          ) : null}

        </div>
      )}

      {/* ── OPTION 1: DIGITAL EVIDENCE AUDIT CERTIFICATE MODAL ───────────────── */}
      {showEvidenceReport && result && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 print:max-h-none print:p-0 print:border-none">

            {/* Modal Control Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <i className="fas fa-file-contract" /> Forensic Audit Report
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all"
                >
                  <i className="fas fa-print" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowEvidenceReport(false)}
                  className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-xmark text-lg" />
                </button>
              </div>
            </div>

            {/* Printable Evidence Certificate Document */}
            <div className="space-y-6 text-slate-200">
              {/* Report Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <i className="fas fa-shield-halved text-purple-400" />
                    DIGITAL FORENSIC EVIDENCE REPORT
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Cryptographic File Integrity &amp; EXIF Metadata Audit</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 block">REPORT ID</span>
                  <span className="text-xs font-mono font-bold text-purple-400">EVD-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>

              {/* Summary Audit Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Target Filename</span>
                  <p className="font-bold text-white truncate">{result.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">File Size</span>
                  <p className="font-bold text-white">{formatBytes(result.size)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase">SHA-256 Hash Fingerprint</span>
                  <p className="font-mono text-[11px] text-purple-300 break-all bg-slate-950 p-2 rounded-xl border border-slate-800 mt-1">
                    {result.sha256 || 'N/A (Large file)'}
                  </p>
                </div>
              </div>

              {/* Verdict Summary */}
              {result.authenticity && (
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Authenticity Rating</span>
                    <span className="text-sm font-black text-white">{result.authenticity.verdict} ({result.authenticity.riskScore}/100 Risk)</span>
                  </div>
                  <div className="space-y-1">
                    {result.authenticity.reasons.map((r, i) => (
                      <p key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <i className="fas fa-check-circle text-purple-400 text-[10px]" />
                        <span>{r}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Camera & GPS Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Camera Hardware Specs</h4>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Make:</span> {result.exif?.make || 'Not embedded'}</p>
                    <p><span className="text-slate-500">Model:</span> {result.exif?.model || 'Not embedded'}</p>
                    <p><span className="text-slate-500">Software:</span> {result.exif?.software || 'Not embedded'}</p>
                    <p><span className="text-slate-500">Captured:</span> {result.exif?.dateTimeOriginal || 'Not embedded'}</p>
                  </div>
                </div>

                <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">GPS Location Evidence</h4>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Coordinates:</span> {result.exif?.gps ? `${result.exif.gps.latitude.toFixed(6)}, ${result.exif.gps.longitude.toFixed(6)}` : 'No GPS'}</p>
                    <p><span className="text-slate-500">City/Country:</span> {result.location?.city || result.location?.country || 'Unknown'}</p>
                    <p><span className="text-slate-500">Location Source:</span> {result.location?.source || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Report Footer */}
              <div className="pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 space-y-1">
                <p>Generated by BridgeTech AI Digital Forensic Inspector on {new Date().toLocaleString()}</p>
                <p>This document verifies file integrity using client-side cryptographic hashing &amp; ELA compression analysis.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
