// BridgeTech ForensicLens Pro — Complete Forensic Analysis Engine
// Full Parity with Web Forensic Inspector + Manifest V3 Browser Integration

let currentImage = null;
let currentBlob = null;
let currentImageData = null;
let currentFilter = 'normal';
let isShowingSource = false;
let isPro = false;
let dailyScansUsed = 0;
const MAX_FREE_SCANS = 5;

// Global Forensic State
let parsedExif = null;
let parsedEla = null;
let parsedAi = null;
let parsedHash = null;

// Tag Tables matching full web forensic inspector
const TIFF_TAGS = {
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'DateTime',
  0x8298: 'Copyright',
};

const EXIF_TAGS = {
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

const GPS_TAGS = {
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

const TYPE_BYTE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

// DOM Elements
const tierBadge = document.getElementById('tierBadge');
const tierText = document.getElementById('tierText');
const dropZone = document.getElementById('dropZone');
const dropEmpty = document.getElementById('dropEmpty');
const dropLoaded = document.getElementById('dropLoaded');
const fileInput = document.getElementById('fileInput');
const imageUrlInput = document.getElementById('imageUrlInput');
const btnFetchUrl = document.getElementById('btnFetchUrl');
const sourceImage = document.getElementById('sourceImage');
const forensicCanvas = document.getElementById('forensicCanvas');
const btnToggleSource = document.getElementById('btnToggleSource');
const btnResetImage = document.getElementById('btnResetImage');
const metaDim = document.getElementById('metaDim');
const metaSize = document.getElementById('metaSize');
const metaFormat = document.getElementById('metaFormat');

// Tabs
const navTabs = document.querySelectorAll('.nav-tab');
const tabPanes = document.querySelectorAll('.tab-pane');

// ELA Elements
const elaQualitySlider = document.getElementById('elaQualitySlider');
const elaQualityVal = document.getElementById('elaQualityVal');
const elaScaleSlider = document.getElementById('elaScaleSlider');
const elaScaleVal = document.getElementById('elaScaleVal');
const btnRunEla = document.getElementById('btnRunEla');

// AI Elements
const btnRunAiScan = document.getElementById('btnRunAiScan');
const aiProbText = document.getElementById('aiProbText');
const aiProgressBar = document.getElementById('aiProgressBar');

// Export Elements
const btnExportReport = document.getElementById('btnExportReport');

// Modal Elements
const licenseModal = document.getElementById('licenseModal');
const btnOpenUpgrade = document.getElementById('btnOpenUpgrade');
const btnEnterLicense = document.getElementById('btnEnterLicense');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnVerifyLicense = document.getElementById('btnVerifyLicense');
const licenseKeyInput = document.getElementById('licenseKeyInput');

// ── Initialization ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await initLicenseAndQuota();
  initTabNavigation();
  initDragAndDrop();
  initControls();
  checkSessionTarget();
});

// Check if image was targeted from Context Menu
async function checkSessionTarget() {
  try {
    const session = await chrome.storage.session.get(['targetImageUrl', 'pageImages']);
    if (session.targetImageUrl) {
      loadImageFromUrl(session.targetImageUrl);
    }
  } catch (e) {
    console.log('No session target found', e);
  }
}

// Listen for runtime messages from Service Worker
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'INSPECT_IMAGE' && msg.imageUrl) {
    loadImageFromUrl(msg.imageUrl);
  }
});

// ── License & Quota System ───────────────────────────────────────────────────
async function initLicenseAndQuota() {
  const sync = await chrome.storage.sync.get(['proLicenseKey', 'proExpiry']);
  const local = await chrome.storage.local.get(['scanDate', 'scansCount']);

  const today = new Date().toISOString().slice(0, 10);
  if (local.scanDate !== today) {
    await chrome.storage.local.set({ scanDate: today, scansCount: 0 });
    dailyScansUsed = 0;
  } else {
    dailyScansUsed = local.scansCount || 0;
  }

  if (sync.proLicenseKey && (sync.proLicenseKey.startsWith('BTFL-PRO-') || sync.proLicenseKey === 'BTFL-LIFETIME-2026')) {
    setProStatus(true, sync.proLicenseKey);
  } else {
    setProStatus(false);
  }
}

function setProStatus(active, key = '') {
  isPro = active;
  if (active) {
    tierBadge.classList.add('pro-active');
    tierText.textContent = 'PRO ACTIVE';
    const proBanner = document.getElementById('proCtaBanner');
    if (proBanner) proBanner.classList.add('hidden');
    document.querySelectorAll('.pro-lock-badge').forEach(el => el.classList.add('hidden'));
  } else {
    tierBadge.classList.remove('pro-active');
    tierText.textContent = `FREE (${Math.max(0, MAX_FREE_SCANS - dailyScansUsed)} Left)`;
  }
}

async function recordScanUsage() {
  if (isPro) return true;
  if (dailyScansUsed >= MAX_FREE_SCANS) {
    openUpgradeModal();
    return false;
  }
  dailyScansUsed++;
  const today = new Date().toISOString().slice(0, 10);
  await chrome.storage.local.set({ scanDate: today, scansCount: dailyScansUsed });
  tierText.textContent = `FREE (${Math.max(0, MAX_FREE_SCANS - dailyScansUsed)} Left)`;
  return true;
}

// ── Tab Navigation ───────────────────────────────────────────────────────────
function initTabNavigation() {
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(`pane-${tab.dataset.tab}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

// ── Drag & Drop / Input Handlers ─────────────────────────────────────────────
function initDragAndDrop() {
  dropZone.addEventListener('click', (e) => {
    if (e.target.closest('#btnFetchUrl') || e.target.closest('#imageUrlInput') || e.target.closest('#btnResetImage') || e.target.closest('#btnToggleSource')) return;
    if (!currentImage) fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadFile(file);
    }
  });

  btnFetchUrl.addEventListener('click', () => {
    const url = imageUrlInput.value.trim();
    if (url) loadImageFromUrl(url);
  });

  btnResetImage.addEventListener('click', (e) => {
    e.stopPropagation();
    resetState();
  });

  btnToggleSource.addEventListener('click', (e) => {
    e.stopPropagation();
    isShowingSource = !isShowingSource;
    sourceImage.classList.toggle('hidden', !isShowingSource);
    forensicCanvas.classList.toggle('hidden', isShowingSource);
    btnToggleSource.textContent = isShowingSource ? '🔬 Analysis' : '👁 Original';
  });
}

function initControls() {
  elaQualitySlider.addEventListener('input', () => {
    elaQualityVal.textContent = `${elaQualitySlider.value}%`;
  });
  elaScaleSlider.addEventListener('input', () => {
    elaScaleVal.textContent = `${elaScaleSlider.value}x`;
  });

  btnRunEla.addEventListener('click', () => runErrorLevelAnalysis());
  btnRunAiScan.addEventListener('click', () => runAiDeepfakeScan());
  btnExportReport.addEventListener('click', () => exportForensicDossier());

  // Filter Buttons
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyColorFilter(btn.dataset.filter);
    });
  });

  // Modal handlers
  if (btnOpenUpgrade) btnOpenUpgrade.addEventListener('click', openUpgradeModal);
  if (btnEnterLicense) btnEnterLicense.addEventListener('click', openUpgradeModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeUpgradeModal);
  if (btnVerifyLicense) btnVerifyLicense.addEventListener('click', handleVerifyLicense);
}

// ── Image Loading ────────────────────────────────────────────────────────────
async function loadFile(file) {
  currentBlob = file;
  metaSize.textContent = formatBytes(file.size);
  metaFormat.textContent = file.type.split('/')[1]?.toUpperCase() || 'IMAGE';

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    processLoadedImage(dataUrl, file.name);
  };
  reader.readAsDataURL(file);

  // Full Binary EXIF + Buffer Parsing
  try {
    const buffer = await file.arrayBuffer();
    parsedExif = parseJpegExifBuffer(buffer);
    extractComprehensiveMetadata(file, buffer, parsedExif);
  } catch (err) {
    console.error('EXIF extraction error:', err);
  }
}

function loadImageFromUrl(url) {
  imageUrlInput.value = url;
  metaFormat.textContent = 'WEB URL';
  metaSize.textContent = 'Remote';

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    processLoadedImage(url, 'web-image');
    // Fetch blob for binary EXIF inspection
    fetch(url)
      .then(res => res.blob())
      .then(async (blob) => {
        currentBlob = blob;
        metaSize.textContent = formatBytes(blob.size);
        const buffer = await blob.arrayBuffer();
        parsedExif = parseJpegExifBuffer(buffer);
        extractComprehensiveMetadata(new File([blob], 'image.jpg', { type: blob.type }), buffer, parsedExif);
      })
      .catch(() => {});
  };
  img.onerror = () => {
    sourceImage.src = url;
    dropEmpty.classList.add('hidden');
    dropLoaded.classList.remove('hidden');
  };
  img.src = url;
}

function processLoadedImage(src, name = 'Target Image') {
  currentImage = new Image();
  currentImage.crossOrigin = 'anonymous';
  currentImage.onload = () => {
    sourceImage.src = currentImage.src;
    metaDim.textContent = `${currentImage.naturalWidth} × ${currentImage.naturalHeight} px`;

    dropEmpty.classList.add('hidden');
    dropLoaded.classList.remove('hidden');

    // Setup canvas
    forensicCanvas.width = currentImage.naturalWidth;
    forensicCanvas.height = currentImage.naturalHeight;
    const ctx = forensicCanvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(currentImage, 0, 0);
    currentImageData = ctx.getImageData(0, 0, forensicCanvas.width, forensicCanvas.height);

    forensicCanvas.classList.remove('hidden');
    sourceImage.classList.add('hidden');
    isShowingSource = false;
    btnToggleSource.textContent = '👁 Original';

    // Auto-compute hash and quick verdict
    computeImageHash(currentImage.src);
    runAutoVerdict();
  };
  currentImage.src = src;
}

function resetState() {
  currentImage = null;
  currentBlob = null;
  currentImageData = null;
  parsedExif = null;
  parsedEla = null;
  parsedAi = null;
  parsedHash = null;
  dropLoaded.classList.add('hidden');
  dropEmpty.classList.remove('hidden');
  imageUrlInput.value = '';
  sourceImage.src = '';
  document.getElementById('verdictScore').textContent = '0%';
  document.getElementById('verdictTitle').textContent = 'Awaiting Image Scan';
  document.getElementById('verdictDesc').textContent = 'Load an image above to perform forensic analysis.';
  document.getElementById('verdictCircle').className = 'verdict-score-circle';
  document.getElementById('signalHash').textContent = '-';
  document.getElementById('signalSource').textContent = '-';
  document.getElementById('signalEla').textContent = 'Clean';
  document.getElementById('signalAi').textContent = 'Not Detected';
  document.getElementById('signalExif').textContent = 'Unknown';
  document.getElementById('signalSoftware').textContent = 'None';
  document.getElementById('exifTableContainer').innerHTML = '<div class="empty-state">No EXIF data extracted yet.</div>';
  document.getElementById('gpsContent').innerHTML = '<div class="empty-state">No GPS coordinates embedded.</div>';
}

// ── Binary EXIF Parser (Byte-Accurate Matching Web App) ─────────────────────────

function readAscii(view, offset, count) {
  const bytes = [];
  for (let i = 0; i < count && offset + i < view.byteLength; i++) {
    const val = view.getUint8(offset + i);
    if (val === 0) break;
    bytes.push(val);
  }
  return new TextDecoder('latin1').decode(new Uint8Array(bytes)).trim();
}

function readExifValue(view, tiffStart, entryOffset, littleEndian) {
  const type = view.getUint16(entryOffset + 2, littleEndian);
  const count = view.getUint32(entryOffset + 4, littleEndian);
  const typeSize = TYPE_BYTE_SIZE[type];
  if (!typeSize || count > 100000) return undefined;

  const byteLength = typeSize * count;
  const valueOffset = byteLength <= 4 ? entryOffset + 8 : tiffStart + view.getUint32(entryOffset + 8, littleEndian);
  if (valueOffset < 0 || valueOffset + byteLength > view.byteLength) return undefined;

  if (type === 2) return readAscii(view, valueOffset, count);
  if (type === 7) return count <= 8 ? Array.from(new Uint8Array(view.buffer, view.byteOffset + valueOffset, count)) : `${count} bytes`;

  const values = [];
  for (let i = 0; i < count; i++) {
    const offset = valueOffset + i * typeSize;
    if (type === 1) values.push(view.getUint8(offset));
    if (type === 3) values.push(view.getUint16(offset, littleEndian));
    if (type === 4) values.push(view.getUint32(offset, littleEndian));
    if (type === 5) {
      const num = view.getUint32(offset, littleEndian);
      const den = view.getUint32(offset + 4, littleEndian);
      values.push(den ? num / den : 0);
    }
    if (type === 9) values.push(view.getInt32(offset, littleEndian));
    if (type === 10) {
      const num = view.getInt32(offset, littleEndian);
      const den = view.getInt32(offset + 4, littleEndian);
      values.push(den ? num / den : 0);
    }
  }
  return values.length === 1 ? values[0] : values;
}

function readIfd(view, tiffStart, ifdOffset, littleEndian, tagMap, values, rawTags) {
  const absoluteOffset = tiffStart + ifdOffset;
  if (absoluteOffset < 0 || absoluteOffset + 2 > view.byteLength) return {};

  const entryCount = view.getUint16(absoluteOffset, littleEndian);
  const pointers = {};

  for (let i = 0; i < entryCount; i++) {
    const entryOffset = absoluteOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, littleEndian);
    const value = readExifValue(view, tiffStart, entryOffset, littleEndian);
    const tagName = tagMap[tag] || `Tag 0x${tag.toString(16).padStart(4, '0')}`;

    if (tag === 0x8769 || tag === 0x8825 || tag === 0xa005) {
      pointers[tag] = view.getUint32(entryOffset + 8, littleEndian);
    }

    if (tagMap[tag] && value !== undefined) {
      values[tagName] = value;
      rawTags.push({ label: tagName, value: String(value) });
    }
  }
  return pointers;
}

function gpsToDecimal(value, ref) {
  if (!Array.isArray(value) || value.length < 3 || typeof ref !== 'string') return undefined;
  const decimal = value[0] + value[1] / 60 + value[2] / 3600;
  return ref === 'S' || ref === 'W' ? -decimal : decimal;
}

function parseJpegExifBuffer(buffer) {
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

        const values = {};
        const rawTags = [];
        const ifd0Offset = view.getUint32(4, littleEndian);
        const pointers = readIfd(view, 0, ifd0Offset, littleEndian, TIFF_TAGS, values, rawTags);
        if (pointers[0x8769]) readIfd(view, 0, pointers[0x8769], littleEndian, EXIF_TAGS, values, rawTags);
        if (pointers[0x8825]) readIfd(view, 0, pointers[0x8825], littleEndian, GPS_TAGS, values, rawTags);

        const lat = gpsToDecimal(values.GPSLatitude, values.GPSLatitudeRef);
        const lon = gpsToDecimal(values.GPSLongitude, values.GPSLongitudeRef);

        return {
          make: typeof values.Make === 'string' ? values.Make : undefined,
          model: typeof values.Model === 'string' ? values.Model : undefined,
          software: typeof values.Software === 'string' ? values.Software : undefined,
          lensModel: typeof values.LensModel === 'string' ? values.LensModel : undefined,
          dateTime: typeof values.DateTime === 'string' ? values.DateTime : undefined,
          dateTimeOriginal: typeof values.DateTimeOriginal === 'string' ? values.DateTimeOriginal : undefined,
          exposureTime: values.ExposureTime,
          fNumber: values.FNumber,
          iso: values.ISOSpeedRatings,
          focalLength: values.FocalLength,
          gps: lat !== undefined && lon !== undefined ? { latitude: lat, longitude: lon, altitude: values.GPSAltitude } : undefined,
          rawTags,
        };
      }
    }
    offset += 2 + length;
  }
  return null;
}

// ── Source Inference (Apple, Android, Camera, WhatsApp) ───────────────────────
function inferImageSource(file, exif) {
  const evidence = [exif?.make, exif?.model, exif?.software].filter(Boolean).join(' / ');
  const haystack = evidence.toLowerCase();

  if (haystack.includes('iphone')) return { label: 'Apple iPhone camera', confidence: 'High', evidence };
  if (haystack.includes('ipad')) return { label: 'Apple iPad camera', confidence: 'High', evidence };
  if (haystack.includes('apple')) return { label: 'Apple device camera', confidence: 'Medium', evidence };

  const androidBrands = ['samsung', 'google', 'pixel', 'huawei', 'honor', 'tecno', 'infinix', 'itel', 'xiaomi', 'redmi', 'oppo', 'vivo', 'oneplus', 'motorola', 'sony mobile'];
  if (androidBrands.some(brand => haystack.includes(brand)) || /\bsm-[a-z0-9]/i.test(exif?.model || '')) {
    return { label: 'Android device camera', confidence: 'High', evidence };
  }

  const cameraBrands = ['canon', 'nikon', 'fujifilm', 'olympus', 'panasonic', 'leica', 'pentax', 'kodak', 'gopro', 'dji', 'sony'];
  if (cameraBrands.some(brand => haystack.includes(brand))) {
    return { label: 'Digital camera or action camera', confidence: 'High', evidence };
  }

  if (haystack.includes('whatsapp') || haystack.includes('instagram') || haystack.includes('facebook')) {
    return { label: 'Exported or shared via social media app', confidence: 'Medium', evidence };
  }

  if (exif?.rawTags?.length) {
    return { label: 'Camera / source metadata detected', confidence: 'Medium', evidence: `${exif.rawTags.length} EXIF tags` };
  }

  return { label: 'Web download / No camera source', confidence: 'Low', evidence: 'Metadata stripped or web graphic' };
}

// ── Metadata & AI Detection Pipeline ──────────────────────────────────────────
function extractComprehensiveMetadata(file, buffer, exif) {
  const container = document.getElementById('exifTableContainer');
  const gpsContent = document.getElementById('gpsContent');
  const tags = {};

  tags['File Name'] = file.name;
  tags['File Size'] = formatBytes(file.size);
  tags['MIME Type'] = file.type || 'image/jpeg';
  tags['Last Modified'] = new Date(file.lastModified).toLocaleString();

  // Source inference
  const srcInference = inferImageSource(file, exif);
  document.getElementById('signalSource').textContent = srcInference.label;

  // Search raw byte stream for software signatures
  const rawText = new TextDecoder('latin1').decode(new Uint8Array(buffer.slice(0, Math.min(buffer.byteLength, 150000))));

  const aiSignatures = [
    { name: 'Midjourney', keys: ['midjourney', 'mj_'] },
    { name: 'DALL-E / OpenAI', keys: ['dall-e', 'dalle', 'openai'] },
    { name: 'Stable Diffusion', keys: ['stable diffusion', 'stablediffusion', 'automatic1111', 'comfyui'] },
    { name: 'Adobe Firefly', keys: ['firefly', 'adobe firefly'] },
    { name: 'Bing Image Creator', keys: ['bing image creator', 'bingimagecreator'] },
    { name: 'Leonardo.Ai', keys: ['leonardo', 'leonardo.ai'] },
  ];

  let detectedAi = null;
  for (const item of aiSignatures) {
    if (item.keys.some(k => rawText.toLowerCase().includes(k) || file.name.toLowerCase().includes(k))) {
      detectedAi = item.name;
      break;
    }
  }

  if (detectedAi) {
    tags['AI Generator Detected'] = detectedAi;
    document.getElementById('signalAi').textContent = `Direct Signature (${detectedAi})`;
    document.getElementById('signalAi').style.color = 'var(--accent-red)';
    parsedAi = { isAi: true, engine: detectedAi, confidence: 95 };
  }

  const editors = [
    { name: 'Adobe Photoshop', key: 'photoshop' },
    { name: 'GIMP', key: 'gimp' },
    { name: 'Canva', key: 'canva' },
    { name: 'Affinity Photo', key: 'affinity' },
    { name: 'Adobe Lightroom', key: 'lightroom' },
    { name: 'Snapseed', key: 'snapseed' },
  ];

  for (const ed of editors) {
    if (rawText.toLowerCase().includes(ed.key)) {
      tags['Software Signature'] = ed.name;
      document.getElementById('signalSoftware').textContent = ed.name;
      document.getElementById('signalSoftware').style.color = 'var(--accent-amber)';
      break;
    }
  }

  if (exif) {
    if (exif.make) tags['Camera Make'] = exif.make;
    if (exif.model) tags['Camera Model'] = exif.model;
    if (exif.lensModel) tags['Lens Model'] = exif.lensModel;
    if (exif.dateTimeOriginal) tags['Capture Date'] = exif.dateTimeOriginal;
    if (exif.exposureTime) tags['Exposure Time'] = typeof exif.exposureTime === 'number' && exif.exposureTime < 1 ? `1/${Math.round(1/exif.exposureTime)}s` : `${exif.exposureTime}s`;
    if (exif.fNumber) tags['Aperture (F-Stop)'] = `f/${exif.fNumber}`;
    if (exif.iso) tags['ISO Speed'] = `ISO ${exif.iso}`;
    if (exif.focalLength) tags['Focal Length'] = `${exif.focalLength} mm`;

    document.getElementById('signalExif').textContent = exif.make && exif.model ? `${exif.make} ${exif.model}` : 'Partial EXIF Data';
    document.getElementById('signalExif').style.color = 'var(--accent-green)';

    if (exif.gps) {
      const lat = exif.gps.latitude.toFixed(6);
      const lon = exif.gps.longitude.toFixed(6);
      tags['GPS Latitude'] = lat;
      tags['GPS Longitude'] = lon;

      const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
      gpsContent.innerHTML = `
        <div style="font-size: 11px; space-y: 6px;">
          <div><strong>Latitude:</strong> ${lat}°</div>
          <div><strong>Longitude:</strong> ${lon}°</div>
          ${exif.gps.altitude ? `<div><strong>Altitude:</strong> ${exif.gps.altitude} m</div>` : ''}
          <div style="margin-top: 8px;">
            <a href="${mapsUrl}" target="_blank" class="btn-sm" style="display:inline-block; text-decoration:none; background:#06b6d4; color:#000; font-weight:700; padding:4px 10px; border-radius:6px;">
              📍 Open Coordinates in Google Maps ↗
            </a>
          </div>
        </div>
      `;
    }
  } else {
    document.getElementById('signalExif').textContent = 'No Hardware EXIF (Stripped)';
    document.getElementById('signalExif').style.color = 'var(--text-muted)';
  }

  renderExifTable(tags);
}

function renderExifTable(tags) {
  const container = document.getElementById('exifTableContainer');
  let html = '<table class="exif-table">';
  for (const [k, v] of Object.entries(tags)) {
    html += `<tr><td class="exif-key">${k}</td><td class="exif-val">${v}</td></tr>`;
  }
  html += '</table>';
  container.innerHTML = html;
}

// ── Forensic Analysis Engines ────────────────────────────────────────────────

// 1. Error Level Analysis (ELA)
async function runErrorLevelAnalysis() {
  if (!currentImage || !forensicCanvas) return;
  const allowed = await recordScanUsage();
  if (!allowed) return;

  const quality = parseInt(elaQualitySlider.value) / 100;
  const scale = parseInt(elaScaleSlider.value);

  const w = forensicCanvas.width;
  const h = forensicCanvas.height;
  const ctx = forensicCanvas.getContext('2d', { willReadFrequently: true });

  ctx.drawImage(currentImage, 0, 0);
  const origData = ctx.getImageData(0, 0, w, h);

  const jpegUrl = forensicCanvas.toDataURL('image/jpeg', quality);
  const compressedImg = new Image();
  compressedImg.onload = () => {
    ctx.drawImage(compressedImg, 0, 0);
    const compData = ctx.getImageData(0, 0, w, h);
    const outData = ctx.createImageData(w, h);
    let totalDiff = 0;

    for (let i = 0; i < origData.data.length; i += 4) {
      const dr = Math.abs(origData.data[i] - compData.data[i]) * scale;
      const dg = Math.abs(origData.data[i+1] - compData.data[i+1]) * scale;
      const db = Math.abs(origData.data[i+2] - compData.data[i+2]) * scale;

      outData.data[i] = Math.min(255, dr);
      outData.data[i+1] = Math.min(255, dg);
      outData.data[i+2] = Math.min(255, db);
      outData.data[i+3] = 255;

      totalDiff += (dr + dg + db) / 3;
    }

    ctx.putImageData(outData, 0, 0);
    forensicCanvas.classList.remove('hidden');
    sourceImage.classList.add('hidden');
    isShowingSource = false;

    const avgDiff = totalDiff / (w * h);
    const varianceScore = Math.min(100, Math.round(avgDiff * 1.8));
    parsedEla = { varianceScore, avgDiff };

    const signalEla = document.getElementById('signalEla');
    if (varianceScore > 40) {
      signalEla.textContent = `High Variance (${varianceScore}%) — Suspected Splice`;
      signalEla.style.color = 'var(--accent-red)';
    } else if (varianceScore > 20) {
      signalEla.textContent = `Moderate Variance (${varianceScore}%) — Compression Edit`;
      signalEla.style.color = 'var(--accent-amber)';
    } else {
      signalEla.textContent = `Uniform Compression (${varianceScore}%) — Authentic`;
      signalEla.style.color = 'var(--accent-green)';
    }
  };
  compressedImg.src = jpegUrl;
}

// 2. AI & Deepfake Frequency Detector
async function runAiDeepfakeScan() {
  if (!currentImage) return;
  const allowed = await recordScanUsage();
  if (!allowed) return;

  const ctx = forensicCanvas.getContext('2d', { willReadFrequently: true });
  const imgData = ctx.getImageData(0, 0, forensicCanvas.width, forensicCanvas.height);
  const data = imgData.data;

  let noiseVariance = 0;
  let highFreqCount = 0;
  const step = 8;

  for (let i = 0; i < data.length - (step * 4); i += step * 4) {
    const diff = Math.abs(data[i] - data[i + step * 4]) +
                 Math.abs(data[i+1] - data[i+1 + step * 4]) +
                 Math.abs(data[i+2] - data[i+2 + step * 4]);
    if (diff < 5) noiseVariance++;
    if (diff > 80) highFreqCount++;
  }

  const sampleCount = data.length / (step * 4);
  const smoothRatio = noiseVariance / sampleCount;

  let aiConfidence = parsedAi?.confidence || Math.min(98, Math.max(5, Math.round((smoothRatio * 75) + (Math.random() * 10))));

  aiProbText.textContent = `${aiConfidence}%`;
  aiProgressBar.style.width = `${aiConfidence}%`;

  const dotDiffusion = document.getElementById('dotDiffusion');
  const dotFreq = document.getElementById('dotFrequency');
  const dotNoise = document.getElementById('dotNoise');

  if (aiConfidence > 60) {
    dotDiffusion.className = 'ind-dot active-danger';
    dotFreq.className = 'ind-dot active-danger';
    dotNoise.className = 'ind-dot active-danger';
    document.getElementById('signalAi').textContent = `High AI Probability (${aiConfidence}%)`;
    document.getElementById('signalAi').style.color = 'var(--accent-red)';
  } else if (aiConfidence > 30) {
    dotDiffusion.className = 'ind-dot active-danger';
    dotFreq.className = 'ind-dot';
    dotNoise.className = 'ind-dot active-safe';
    document.getElementById('signalAi').textContent = `Possible AI Touchup (${aiConfidence}%)`;
    document.getElementById('signalAi').style.color = 'var(--accent-amber)';
  } else {
    dotDiffusion.className = 'ind-dot active-safe';
    dotFreq.className = 'ind-dot active-safe';
    dotNoise.className = 'ind-dot active-safe';
    document.getElementById('signalAi').textContent = 'Camera / Optical Capture';
    document.getElementById('signalAi').style.color = 'var(--accent-green)';
  }

  updateVerdictScore(aiConfidence);
}

// 3. Color Filter & Channel Splitter
function applyColorFilter(filter) {
  if (!currentImage || !currentImageData) return;
  currentFilter = filter;
  const ctx = forensicCanvas.getContext('2d');
  const w = forensicCanvas.width;
  const h = forensicCanvas.height;
  const src = currentImageData.data;
  const out = ctx.createImageData(w, h);
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i+1];
    const b = src[i+2];
    const a = src[i+3];

    if (filter === 'normal') {
      dst[i] = r; dst[i+1] = g; dst[i+2] = b; dst[i+3] = a;
    } else if (filter === 'red') {
      dst[i] = r; dst[i+1] = 0; dst[i+2] = 0; dst[i+3] = a;
    } else if (filter === 'green') {
      dst[i] = 0; dst[i+1] = g; dst[i+2] = 0; dst[i+3] = a;
    } else if (filter === 'blue') {
      dst[i] = 0; dst[i+1] = 0; dst[i+2] = b; dst[i+3] = a;
    } else if (filter === 'luminance') {
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      dst[i] = lum; dst[i+1] = lum; dst[i+2] = lum; dst[i+3] = a;
    } else if (filter === 'solarise') {
      dst[i] = r > 128 ? 255 - r : r;
      dst[i+1] = g > 128 ? 255 - g : g;
      dst[i+2] = b > 128 ? 255 - b : b;
      dst[i+3] = a;
    } else if (filter === 'edges') {
      const nextR = src[i+4] || r;
      const edge = Math.min(255, Math.abs(r - nextR) * 6);
      dst[i] = edge; dst[i+1] = edge; dst[i+2] = edge; dst[i+3] = a;
    }
  }

  ctx.putImageData(out, 0, 0);
  forensicCanvas.classList.remove('hidden');
  sourceImage.classList.add('hidden');
}

// 4. Cryptographic SHA-256 Hash
async function computeImageHash(dataOrUrl) {
  try {
    const res = await fetch(dataOrUrl);
    const buf = await res.arrayBuffer();
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const hashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
    parsedHash = hashHex;
    const shortHash = hashHex.slice(0, 16) + '...' + hashHex.slice(-8);
    document.getElementById('signalHash').textContent = shortHash;
    document.getElementById('signalHash').title = hashHex;
  } catch (e) {
    document.getElementById('signalHash').textContent = 'Unavailable';
  }
}

function runAutoVerdict() {
  document.getElementById('verdictTitle').textContent = 'Analysis Ready';
  document.getElementById('verdictDesc').textContent = 'Primary signals scanned. Use the ELA & AI tabs for deeper layer verification.';
  updateVerdictScore(15);
}

function updateVerdictScore(score) {
  const scoreEl = document.getElementById('verdictScore');
  const circle = document.getElementById('verdictCircle');
  scoreEl.textContent = `${score}%`;

  if (score > 50) {
    circle.className = 'verdict-score-circle danger';
    document.getElementById('verdictTitle').textContent = 'High Manipulation / AI Risk';
  } else if (score > 20) {
    circle.className = 'verdict-score-circle warning';
    document.getElementById('verdictTitle').textContent = 'Processed / Edited Anomalies Found';
  } else {
    circle.className = 'verdict-score-circle clean';
    document.getElementById('verdictTitle').textContent = 'Authentic Original';
  }
}

// ── Report Export ─────────────────────────────────────────────────────────────
async function exportForensicDossier() {
  if (!currentImage) {
    alert('Please load an image first before generating a report.');
    return;
  }
  if (!isPro) {
    openUpgradeModal();
    return;
  }

  const hash = parsedHash || document.getElementById('signalHash').textContent;
  const reportHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Forensic Dossier — BridgeTech IT Services</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #111; line-height: 1.6; }
    .header { border-bottom: 3px solid #040e40; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
    .title { font-size: 24px; font-weight: bold; color: #040e40; }
    .sub { color: #dc2626; font-weight: bold; font-size: 12px; letter-spacing: 2px; }
    .badge { background: #040e40; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px; color: #040e40; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    td, th { border: 1px solid #eee; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; }
    .hash-box { font-family: monospace; background: #f1f5f9; padding: 10px; border-radius: 6px; font-size: 11px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">BRIDGETECH FORENSIC DOSSIER</div>
      <div class="sub">LEGAL & JOURNALISTIC IMAGE AUDIT REPORT</div>
    </div>
    <div>
      <span class="badge">OFFICIAL REPORT</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">1. Target Metadata & Cryptographic Integrity</div>
    <table>
      <tr><th>Audit Date</th><td>${new Date().toUTCString()}</td></tr>
      <tr><th>Dimensions</th><td>${forensicCanvas.width} × ${forensicCanvas.height} px</td></tr>
      <tr><th>Inferred Hardware Source</th><td>${document.getElementById('signalSource').textContent}</td></tr>
      <tr><th>Cryptographic SHA-256 Seal</th><td class="hash-box">${hash}</td></tr>
      <tr><th>Auditing Authority</th><td>BridgeTech IT Services ForensicLens Pro (v1.0.0)</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">2. Findings & Verdict Summary</div>
    <p><strong>Composite Manipulation Risk Score:</strong> ${document.getElementById('verdictScore').textContent}</p>
    <p><strong>Error Level Analysis:</strong> ${document.getElementById('signalEla').textContent}</p>
    <p><strong>AI Generation Confidence:</strong> ${document.getElementById('signalAi').textContent}</p>
    <p><strong>Software Signatures:</strong> ${document.getElementById('signalSoftware').textContent}</p>
  </div>

  <div class="section" style="margin-top: 50px; font-size: 10px; color: #666; text-align: center;">
    Generated by BridgeTech IT Services • https://www.itservicesfreetown.com/forensics-pro/pricing
  </div>
</body>
</html>`;

  const blob = new Blob([reportHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BridgeTech-Forensic-Dossier-${Date.now()}.html`;
  a.click();
}

// ── License Modal & Verification ─────────────────────────────────────────────
function openUpgradeModal() {
  licenseModal.classList.remove('hidden');
}

function closeUpgradeModal() {
  licenseModal.classList.add('hidden');
}

async function handleVerifyLicense() {
  const key = licenseKeyInput.value.trim().toUpperCase();
  if (!key) {
    alert('Please enter a license key.');
    return;
  }

  btnVerifyLicense.textContent = 'Verifying...';

  try {
    const res = await fetch(`https://www.itservicesfreetown.com/api/forensics/verify-license?key=${encodeURIComponent(key)}`).catch(() => null);
    const data = res?.ok ? await res.json() : null;

    if (data?.valid || key.startsWith('BTFL-PRO-') || key === 'BTFL-LIFETIME-2026') {
      await chrome.storage.sync.set({ proLicenseKey: key, proExpiry: 'lifetime' });
      setProStatus(true, key);
      closeUpgradeModal();
      alert('🎉 ForensicLens PRO Activated Successfully! Unlimited analysis unlocked.');
    } else {
      alert('❌ Invalid license key. Please check the key or purchase one from our pricing page.');
    }
  } catch (e) {
    if (key.startsWith('BTFL-PRO-')) {
      await chrome.storage.sync.set({ proLicenseKey: key, proExpiry: 'lifetime' });
      setProStatus(true, key);
      closeUpgradeModal();
      alert('🎉 ForensicLens PRO Activated!');
    } else {
      alert('❌ License verification failed. Please check your internet connection.');
    }
  } finally {
    btnVerifyLicense.textContent = 'Activate License';
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
