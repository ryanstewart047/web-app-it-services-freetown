'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Download, ArrowLeft, CheckCircle, XCircle, FileSpreadsheet, AlertTriangle, Loader2, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useAdminSession } from '../../../../src/hooks/useAdminSession';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BulkProduct {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  categoryId: string;
  stock: string;
  status: string;
  condition: string;
  sku: string;
  brand: string;
  featured: boolean;
  images: string[];
}

interface UploadResult {
  total: number;
  successCount: number;
  failedCount: number;
  success: { id: string; name: string; slug: string }[];
  failed: { row: number; name: string; error: string }[];
}

const EMPTY_PRODUCT: BulkProduct = {
  name: '',
  description: '',
  price: '',
  comparePrice: '',
  categoryId: '',
  stock: '0',
  status: 'active',
  condition: 'new',
  sku: '',
  brand: '',
  featured: false,
  images: [''],
};

export default function BulkUploadPage() {
  const { showIdleWarning, getRemainingTime } = useAdminSession({
    idleTimeout: 5 * 60 * 1000,
    warningTime: 30 * 1000,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<BulkProduct[]>([{ ...EMPTY_PRODUCT }]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'form' | 'csv'>('form');
  const [csvText, setCsvText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const updateProduct = (index: number, field: keyof BulkProduct, value: any) => {
    setProducts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateImage = (productIndex: number, imageIndex: number, value: string) => {
    setProducts(prev => {
      const updated = [...prev];
      const images = [...updated[productIndex].images];
      images[imageIndex] = value;
      updated[productIndex] = { ...updated[productIndex], images };
      return updated;
    });
  };

  const addImageField = (productIndex: number) => {
    setProducts(prev => {
      const updated = [...prev];
      updated[productIndex] = {
        ...updated[productIndex],
        images: [...updated[productIndex].images, ''],
      };
      return updated;
    });
  };

  const removeImageField = (productIndex: number, imageIndex: number) => {
    setProducts(prev => {
      const updated = [...prev];
      const images = updated[productIndex].images.filter((_, i) => i !== imageIndex);
      updated[productIndex] = { ...updated[productIndex], images: images.length ? images : [''] };
      return updated;
    });
  };

  const addRow = () => {
    setProducts(prev => [...prev, { ...EMPTY_PRODUCT, images: [''] }]);
  };

  const removeRow = (index: number) => {
    if (products.length === 1) return;
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const duplicateRow = (index: number) => {
    setProducts(prev => {
      const dup = { ...prev[index], images: [...prev[index].images] };
      const updated = [...prev];
      updated.splice(index + 1, 0, dup);
      return updated;
    });
  };

  const generateCSVTemplate = () => {
    const headers = 'name,description,price,comparePrice,categoryId,stock,status,condition,sku,brand,featured,imageUrl1,imageUrl2,imageUrl3';
    const categoryList = categories.map(c => `# ${c.name}: ${c.id}`).join('\n');
    const example = `"Example Product","A great product description",29.99,39.99,${categories[0]?.id || 'CATEGORY_ID'},10,active,new,SKU001,BrandName,false,https://example.com/img1.jpg,https://example.com/img2.jpg,`;
    const template = `${categoryList}\n${headers}\n${example}`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_bulk_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): BulkProduct[] => {
    const lines = text.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const parsed: BulkProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const images: string[] = [];
      headers.forEach((h, idx) => {
        if (h.startsWith('imageurl') && values[idx]) {
          images.push(values[idx]);
        }
      });

      const get = (key: string) => {
        const idx = headers.indexOf(key);
        return idx >= 0 ? values[idx] || '' : '';
      };

      parsed.push({
        name: get('name'),
        description: get('description'),
        price: get('price'),
        comparePrice: get('compareprice'),
        categoryId: get('categoryid'),
        stock: get('stock') || '0',
        status: get('status') || 'active',
        condition: get('condition') || 'new',
        sku: get('sku'),
        brand: get('brand'),
        featured: get('featured') === 'true',
        images: images.length ? images : [''],
      });
    }
    return parsed;
  };

  const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        setProducts(parsed);
        setMode('form');
      } else {
        setError('Could not parse CSV file. Make sure it has the correct format.');
      }
    };
    reader.readAsText(file);
  };

  const handleCSVPaste = () => {
    const parsed = parseCSV(csvText);
    if (parsed.length > 0) {
      setProducts(parsed);
      setMode('form');
      setError(null);
    } else {
      setError('Could not parse CSV. Check the format and try again.');
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    setResult(null);

    const validProducts = products.filter(p => p.name && p.description && p.price && p.categoryId);

    if (validProducts.length === 0) {
      setError('No valid products to upload. Each product needs at least: name, description, price, and category.');
      setUploading(false);
      return;
    }

    try {
      const payload = validProducts.map(p => ({
        name: p.name,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice || null,
        categoryId: p.categoryId,
        stock: p.stock,
        status: p.status,
        condition: p.condition,
        sku: p.sku || null,
        brand: p.brand || null,
        featured: p.featured,
        images: p.images.filter(Boolean).map(url => ({ url, alt: p.name })),
      }));

      const res = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: payload }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
      } else {
        setResult(data);
        if (data.successCount > 0) {
          setProducts([{ ...EMPTY_PRODUCT, images: [''] }]);
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Idle Warning */}
      {showIdleWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-3 px-4 animate-pulse">
          ⚠️ Session expiring in {getRemainingTime()} seconds due to inactivity. Move your mouse to stay logged in.
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Products
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            <FileSpreadsheet className="w-8 h-8 inline mr-2 text-green-400" />
            Bulk Product Upload
          </h1>
        </div>

        {/* Mode Toggle & CSV Tools */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex rounded-lg overflow-hidden border border-white/20">
              <button
                onClick={() => setMode('form')}
                className={`px-5 py-2.5 text-sm font-medium transition-all ${mode === 'form' ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
              >
                Form Entry
              </button>
              <button
                onClick={() => setMode('csv')}
                className={`px-5 py-2.5 text-sm font-medium transition-all ${mode === 'csv' ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
              >
                CSV Import
              </button>
            </div>
            <button
              onClick={generateCSVTemplate}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-all text-sm border border-blue-500/20"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVFile}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg transition-all text-sm border border-purple-500/20"
            >
              <Upload className="w-4 h-4" />
              Upload CSV File
            </button>
          </div>
        </div>

        {/* CSV Mode */}
        {mode === 'csv' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">Paste CSV Data</h3>
            <p className="text-gray-400 text-sm mb-4">
              Format: <code className="bg-white/10 px-2 py-0.5 rounded text-green-400">name,description,price,comparePrice,categoryId,stock,status,condition,sku,brand,featured,imageUrl1,imageUrl2</code>
            </p>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste your CSV data here..."
              rows={10}
              className="w-full bg-gray-900/50 border border-white/10 rounded-lg p-4 text-white text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
            />
            <button
              onClick={handleCSVPaste}
              className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium"
            >
              Parse & Preview
            </button>
          </div>
        )}

        {/* Form Mode - Product Rows */}
        {mode === 'form' && (
          <div className="space-y-4 mb-6">
            {products.map((product, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative group"
              >
                {/* Row Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-green-400">Product #{idx + 1}</span>
                  <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => duplicateRow(idx)}
                      className="text-xs px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-all"
                    >
                      Duplicate
                    </button>
                    {products.length > 1 && (
                      <button
                        onClick={() => removeRow(idx)}
                        className="text-xs px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Name *</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Product name"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={(e) => updateProduct(idx, 'price', e.target.value)}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Compare Price */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Compare Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.comparePrice}
                      onChange={(e) => updateProduct(idx, 'comparePrice', e.target.value)}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Category *</label>
                    <select
                      value={product.categoryId}
                      onChange={(e) => updateProduct(idx, 'categoryId', e.target.value)}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Stock</label>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => updateProduct(idx, 'stock', e.target.value)}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Status</label>
                    <select
                      value={product.status}
                      onChange={(e) => updateProduct(idx, 'status', e.target.value)}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Condition</label>
                    <select
                      value={product.condition}
                      onChange={(e) => updateProduct(idx, 'condition', e.target.value)}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">SKU</label>
                    <input
                      type="text"
                      value={product.sku}
                      onChange={(e) => updateProduct(idx, 'sku', e.target.value)}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="SKU"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Brand</label>
                    <input
                      type="text"
                      value={product.brand}
                      onChange={(e) => updateProduct(idx, 'brand', e.target.value)}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Brand"
                    />
                  </div>

                  {/* Featured */}
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.featured}
                        onChange={(e) => updateProduct(idx, 'featured', e.target.checked)}
                        className="w-4 h-4 accent-green-500"
                      />
                      <span className="text-sm text-gray-300">Featured</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="text-xs text-gray-400 mb-1 block">Description *</label>
                  <textarea
                    value={product.description}
                    onChange={(e) => updateProduct(idx, 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                    placeholder="Product description..."
                  />
                </div>

                {/* Images */}
                <div className="mt-4">
                  <label className="text-xs text-gray-400 mb-1 block">
                    <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
                    Image URLs
                  </label>
                  <div className="space-y-2">
                    {product.images.map((img, imgIdx) => (
                      <div key={imgIdx} className="flex gap-2">
                        <input
                          type="url"
                          value={img}
                          onChange={(e) => updateImage(idx, imgIdx, e.target.value)}
                          className="flex-1 bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                        {product.images.length > 1 && (
                          <button
                            onClick={() => removeImageField(idx, imgIdx)}
                            className="px-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addImageField(idx)}
                      className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Image
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Row */}
            <button
              onClick={addRow}
              className="w-full py-4 border-2 border-dashed border-white/20 hover:border-green-500/50 rounded-xl text-gray-400 hover:text-green-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Another Product
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <div>
            <p className="text-gray-300 font-medium">{products.length} product(s) ready</p>
            <p className="text-gray-500 text-sm">
              {products.filter(p => p.name && p.description && p.price && p.categoryId).length} valid
            </p>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold text-lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload All Products
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-200">Upload Results</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-600/20 border border-blue-500/20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">{result.total}</p>
                <p className="text-gray-400 text-sm">Total</p>
              </div>
              <div className="bg-green-600/20 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{result.successCount}</p>
                <p className="text-gray-400 text-sm">Succeeded</p>
              </div>
              <div className="bg-red-600/20 border border-red-500/20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-400">{result.failedCount}</p>
                <p className="text-gray-400 text-sm">Failed</p>
              </div>
            </div>

            {/* Success List */}
            {result.success.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Successfully Created
                </h4>
                <div className="space-y-1">
                  {result.success.map((p, i) => (
                    <div key={i} className="text-sm text-gray-300 flex items-center gap-2 bg-green-600/10 rounded-lg px-3 py-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed List */}
            {result.failed.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Failed
                </h4>
                <div className="space-y-1">
                  {result.failed.map((f, i) => (
                    <div key={i} className="text-sm text-gray-300 bg-red-600/10 rounded-lg px-3 py-2">
                      <span className="text-red-400 font-medium">Row {f.row}:</span> {f.name} — <span className="text-gray-500">{f.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
