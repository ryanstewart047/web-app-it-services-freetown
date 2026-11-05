export type PlatformKey = 'windows' | 'mac' | 'linux';

export interface DeviceDetectorDownloadAsset {
  id: string;
  fileName: string;
  href: string;
  label: string;
  description: string;
  size: string;
  featured?: boolean;
}

export const DEVICE_DETECTOR_REPO_OWNER = 'ryanstewart047';
export const DEVICE_DETECTOR_REPO_NAME = 'web-app-it-services-freetown';
export const GITHUB_REPOSITORY_URL = `https://github.com/${DEVICE_DETECTOR_REPO_OWNER}/${DEVICE_DETECTOR_REPO_NAME}`;
export const GITHUB_RELEASES_URL = `${GITHUB_REPOSITORY_URL}/releases`;
export const CURRENT_RELEASE_VERSION = '1.4.0';
const WINDOWS_RELEASE_TAG = 'v1.1.0';
const MAC_RELEASE_TAG = 'v1.4.0';

export const downloadAssets: Record<PlatformKey, DeviceDetectorDownloadAsset[]> = {
  windows: [
    {
      id: 'windows-installer',
      fileName: 'IT.Services.Device.Detector.Setup.1.1.0.exe',
      href: `${GITHUB_RELEASES_URL}/download/${WINDOWS_RELEASE_TAG}/IT.Services.Device.Detector.Setup.1.1.0.exe`,
      label: 'Windows Installer',
      description: 'Recommended - Full installation with shortcuts',
      size: '73.4 MB',
      featured: true,
    },
    {
      id: 'windows-portable',
      fileName: 'IT.Services.Device.Detector.1.1.0.exe',
      href: `${GITHUB_RELEASES_URL}/download/${WINDOWS_RELEASE_TAG}/IT.Services.Device.Detector.1.1.0.exe`,
      label: 'Windows Portable',
      description: 'No installation required - Run anywhere',
      size: '73.1 MB',
    },
  ],
  mac: [
    {
      id: 'mac-zip',
      fileName: 'BridgeTech.Device.Detector-1.4.0-arm64-mac.zip',
      href: `${GITHUB_RELEASES_URL}/download/${MAC_RELEASE_TAG}/BridgeTech.Device.Detector-1.4.0-arm64-mac.zip`,
      label: 'macOS App Download',
      description: 'Apple Silicon (M-series) - extract and move to Applications',
      size: '52 MB',
      featured: true,
    },
  ],
  linux: [],
};

export function getTrackedDownloadAssets(): DeviceDetectorDownloadAsset[] {
  return Object.values(downloadAssets).flat();
}
