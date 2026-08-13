'use client';

import React, { useState } from 'react';

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
  exif?: ExifSummary;
  source: SourceInference;
  location?: ReverseLocation;
  locationError?: string;
  warnings: string[];
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

  const inspectFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setBusy(true);
    setStatus('Analyzing file structure...');

    try {
      const header = new Uint8Array(await selectedFile.slice(0, 256).arrayBuffer());
      const signature = detectSignature(header, selectedFile);
      const category = selectedFile.type.split('/')[0] || (signature.includes('image') ? 'image' : 'file');

      setStatus('Reading image and embedded photo metadata...');
      const [image, exif] = await Promise.all([
        readImageInfo(selectedFile).catch(() => undefined),
        selectedFile.type.startsWith('image/') || /\.(jpg|jpeg)$/i.test(selectedFile.name)
          ? selectedFile.slice(0, Math.min(selectedFile.size, EXIF_SCAN_LIMIT)).arrayBuffer().then(parseJpegExif).catch(() => null)
          : Promise.resolve(null),
      ]);

      setStatus(selectedFile.size <= HASH_SIZE_LIMIT ? 'Creating SHA-256 fingerprint...' : 'Skipping large-file fingerprint...');
      const hash = selectedFile.size <= HASH_SIZE_LIMIT ? await sha256(selectedFile).catch(() => undefined) : undefined;

      const warnings: string[] = [];
      if (selectedFile.type.startsWith('image/') && !exif?.rawTags.length) {
        warnings.push('No embedded EXIF metadata was found. Many social apps, screenshots, and web downloads remove camera/source/GPS details.');
      }
      if (exif?.rawTags.length && !exif.gps) {
        warnings.push('Photo metadata was found, but no GPS coordinates were embedded.');
      }

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
        exif: exif || undefined,
        source: inferSource(selectedFile, exif),
        warnings,
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

      setStatus('Metadata analysis complete.');
    } catch (error: any) {
      console.error('File metadata inspection error:', error);
      setStatus(error.message || 'Could not inspect this file.');
    } finally {
      setBusy(false);
    }
  };

  const hasLocation = !!result?.exif?.gps;
  const sourceTone = result?.source.confidence === 'High' ? 'text-emerald-400' : result?.source.confidence === 'Medium' ? 'text-amber-400' : 'text-slate-400';

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <i className="fas fa-magnifying-glass-location text-blue-400"></i>
        <span>Advanced File & Photo Metadata Inspector</span>
      </h3>

      <div className="relative">
        <input
          type="file"
          onChange={(event) => event.target.files?.[0] && inspectFile(event.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="border border-dashed border-slate-700 bg-slate-900 p-6 rounded-xl text-center transition-colors hover:border-blue-500/60">
          <i className={`fas ${busy ? 'fa-circle-notch fa-spin' : 'fa-file-shield'} text-2xl text-blue-400 mb-2`}></i>
          <p className="text-xs font-semibold text-slate-300">
            {file ? file.name : 'Upload a photo or file for deep metadata analysis'}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            EXIF, GPS, camera source, file signature, image dimensions, and fingerprint
          </p>
        </div>
      </div>

      {status && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-[11px] font-semibold text-blue-300">
          <i className="fas fa-circle-info mr-2"></i>
          {status}
        </div>
      )}

      {result && (
        <div className="space-y-4">
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
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Integrity</p>
              <p className="mt-1 text-sm font-black text-purple-400">{result.sha256 ? 'SHA-256 ready' : 'Signature only'}</p>
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
              <i className="fas fa-triangle-exclamation mr-2"></i>
              {warning}
            </div>
          ))}

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
              <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Camera & Capture Details</h4>
              <MetadataTable rows={cameraRows(result.exif)} />
            </div>
          )}

          {(result.exif?.gps || result.locationError) && (
            <div>
              <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">GPS & Location</h4>
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
    </div>
  );
}
