'use client';

import { useState } from 'react';
import { BookingData } from '@/lib/unified-booking-storage';
// import { DashboardAnalytics } from '@/lib/dashboard-analytics';
import { 
  exportBookings, 
  // exportAnalytics, 
  downloadFile, 
  generateFilename, 
  getContentType,
  exportPresets,
  ExportOptions
} from '@/lib/data-export';

interface DataExportProps {
  bookings: BookingData[];
  analytics: any; // DashboardAnalytics;
}

export default function DataExport({ bookings, analytics }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'excel-csv'>('excel-csv');
  const [selectedPreset, setSelectedPreset] = useState<string>('complete');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [showCustomOptions, setShowCustomOptions] = useState(false);

  const handleQuickExport = async (type: 'bookings' | 'analytics', preset?: string) => {
    setIsExporting(true);

    try {
      let content: string | Blob;
      let filename: string;
      let contentType: string;

      if (type === 'analytics') {
        const analyticsFormat = selectedFormat === 'excel-csv' ? 'csv' : selectedFormat;
        // content = exportAnalytics(analytics, analyticsFormat);
        content = JSON.stringify(analytics, null, 2); // Temporary fallback
        filename = generateFilename('analytics', selectedFormat);
        contentType = getContentType(selectedFormat);
      } else {
        const options: ExportOptions = preset ? 
          { ...exportPresets[preset as keyof typeof exportPresets], format: selectedFormat } :
          {
            format: selectedFormat,
            includeFields: [],
            groupBy: 'none'
          };

        // Apply custom date range if set
        if (customDateRange.start && customDateRange.end) {
          options.dateRange = {
            start: new Date(customDateRange.start),
            end: new Date(customDateRange.end)
          };
        }

        content = exportBookings(bookings, options);
        filename = generateFilename(`bookings_${preset || 'export'}`, selectedFormat);
        contentType = getContentType(selectedFormat);
      }

      // Download the file
      downloadFile(content, filename, contentType);

      // Show success message (you could use a toast notification here)
      console.log(`✅ Successfully exported ${type} as ${selectedFormat.toUpperCase()}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCustomExport = async () => {
    setIsExporting(true);

    try {
      const options: ExportOptions = {
        format: selectedFormat,
        includeFields: [], // All fields for custom export
        groupBy: 'none'
      };

      // Apply custom date range if set
      if (customDateRange.start && customDateRange.end) {
        options.dateRange = {
          start: new Date(customDateRange.start),
          end: new Date(customDateRange.end)
        };
      }

      const content = exportBookings(bookings, options);
      const filename = generateFilename('custom_bookings', selectedFormat);
      const contentType = getContentType(selectedFormat);

      downloadFile(content, filename, contentType);
      console.log(`✅ Custom export completed`);
      
    } catch (error) {
      console.error('Custom export failed:', error);
      alert('Custom export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getContentType = (format: string): string => {
    switch (format) {
      case 'csv':
      case 'excel-csv':
        return 'text/csv;charset=utf-8';
      case 'json':
        return 'application/json;charset=utf-8';
      default:
        return 'text/plain;charset=utf-8';
    }
  };

  const presetDescriptions = {
    complete: 'All booking fields including customer info, device details, and status',
    financial: 'Revenue-focused data grouped by month for financial reporting',
    customer: 'Customer contact information and service history',
    service: 'Service performance data grouped by service type'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <i className="fas fa-download text-green-600 mr-2"></i>
          Data Export
        </h3>
        <div className="text-sm text-gray-500">
          {bookings.length} bookings available
        </div>
      </div>

      {/* Quick Export Options */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Quick Export</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Analytics Export */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h5 className="font-medium text-gray-900 flex items-center">
                  <i className="fas fa-chart-bar text-blue-600 mr-2"></i>
                  Analytics Report
                </h5>
                <p className="text-sm text-gray-600">Complete business analytics and insights</p>
              </div>
            </div>
            <button
              onClick={() => handleQuickExport('analytics')}
              disabled={isExporting}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-download mr-2"></i>
              )}
              Export Analytics
            </button>
          </div>

          {/* Preset Exports */}
          {Object.entries(presetDescriptions).map(([preset, description]) => (
            <div key={preset} className="border rounded-lg p-4 hover:border-green-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium text-gray-900 flex items-center">
                    <i className="fas fa-table text-green-600 mr-2"></i>
                    {preset.charAt(0).toUpperCase() + preset.slice(1)} Report
                  </h5>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
              <button
                onClick={() => handleQuickExport('bookings', preset)}
                disabled={isExporting}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-download mr-2"></i>
                )}
                Export {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Export Format</h4>
        <div className="flex space-x-4">
          {(['csv', 'json', 'excel-csv'] as const).map((format) => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFormat === format
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {format === 'excel-csv' ? 'EXCEL CSV' : format.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {selectedFormat === 'csv' && 'Standard CSV format for general use'}
          {selectedFormat === 'json' && 'Structured data format, good for developers'}
          {selectedFormat === 'excel-csv' && 'Excel-optimized CSV with proper encoding and formatting'}
        </p>
      </div>

      {/* Custom Export Options */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-semibold text-gray-900">Custom Export</h4>
          <button
            onClick={() => setShowCustomOptions(!showCustomOptions)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            {showCustomOptions ? 'Hide Options' : 'Show Options'}
          </button>
        </div>

        {showCustomOptions && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCustomExport}
              disabled={isExporting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-download mr-2"></i>
                  Export Custom Data
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Export Tips */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
          <i className="fas fa-info-circle mr-2"></i>
          Export Tips
        </h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Excel CSV files open directly in Excel with proper formatting</li>
          <li>• Standard CSV files work with most spreadsheet applications</li>
          <li>• JSON files are perfect for developers and data analysis</li>
          <li>• Use date ranges to export specific time periods</li>
          <li>• Analytics exports include all calculated metrics</li>
          <li>• All exports include proper UTF-8 encoding</li>
        </ul>
      </div>
    </div>
  );
}