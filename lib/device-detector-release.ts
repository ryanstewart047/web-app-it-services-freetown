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
export const GITHUB_LATEST_DOWNLOAD_URL = `${GITHUB_RELEASES_URL}/latest/download`;
export const CURRENT_RELEASE_VERSION = '1.1.0';

export const downloadAssets: Record<PlatformKey, DeviceDetectorDownloadAsset[]> = {
  windows: [
    {
      id: 'windows-installer',
      fileName: `IT.Services.Device.Detector.Setup.${CURRENT_RELEASE_VERSION}.exe`,
      href: `${GITHUB_LATEST_DOWNLOAD_URL}/IT.Services.Device.Detector.Setup.${CURRENT_RELEASE_VERSION}.exe`,
      label: 'Windows Installer',
      description: 'Recommended - Full installation with shortcuts',
      size: '73.4 MB',
      featured: true,
    },
    {
      id: 'windows-portable',
      fileName: `IT.Services.Device.Detector.${CURRENT_RELEASE_VERSION}.exe`,
      href: `${GITHUB_LATEST_DOWNLOAD_URL}/IT.Services.Device.Detector.${CURRENT_RELEASE_VERSION}.exe`,
      label: 'Windows Portable',
      description: 'No installation required - Run anywhere',
      size: '73.1 MB',
    },
  ],
  mac: [],
  linux: [],
};

export function getTrackedDownloadAssets(): DeviceDetectorDownloadAsset[] {
  return Object.values(downloadAssets).flat();
}
