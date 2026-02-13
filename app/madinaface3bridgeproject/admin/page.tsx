'use client';

import { useState, useEffect, useCallback } from 'react';

interface ProjectPhoto {
  id: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

const ADMIN_KEY = 'madina2025bridge';

export default function BridgeProjectAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/donations/photos');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchPhotos();
  }, [authenticated, fetchPhotos]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (message: string, type = 'success') => setToast({ message, type });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_KEY) {
      setAuthenticated(true);
    } else {
      showToast('Invalid admin key', 'error');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      showToast('Please enter an image URL', 'error');
      return;
    }
    setUploading(true);
    try {
      const res = await fetch('/api/donations/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageUrl.trim(), caption: caption.trim(), adminKey: ADMIN_KEY }),
      });
      if (!res.ok) throw new Error('Upload failed');
      showToast('Photo added successfully!');
      setImageUrl('');
      setCaption('');
      setPreviewUrl('');
      fetchPhotos();
    } catch {
      showToast('Failed to add photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/donations/photos?id=${id}&adminKey=${ADMIN_KEY}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Photo deleted');
      setDeleteId(null);
      fetchPhotos();
    } catch {
      showToast('Failed to delete photo', 'error');
    }
  };

  const handleUrlBlur = () => {
    if (imageUrl.trim()) setPreviewUrl(imageUrl.trim());
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .admin-page {
          min-height: 100vh;
          background: #0a0f1a;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          color: #e2e8f0;
        }

        .admin-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .admin-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .admin-logo {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          color: #fff;
        }
        .admin-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f1f5f9;
        }
        .admin-subtitle {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 2px;
        }
        .admin-back {
          color: #64748b;
          text-decoration: none;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
        }
        .admin-back:hover { color: #94a3b8; }

        .admin-body {
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 20px 60px;
        }

        /* Login */
        .login-container {
          max-width: 400px;
          margin: 100px auto;
          padding: 0 20px;
        }
        .login-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px 30px;
          text-align: center;
        }
        .login-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #fff;
          margin: 0 auto 20px;
        }
        .login-title {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #f1f5f9;
        }
        .login-desc {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 24px;
        }

        /* Form Elements */
        .field-group {
          margin-bottom: 16px;
          text-align: left;
        }
        .field-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .field-input, .field-textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .field-input:focus, .field-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .field-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .btn-danger {
          padding: 8px 14px;
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }

        .btn-cancel {
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.06);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .btn-cancel:hover { background: rgba(255, 255, 255, 0.1); }

        /* Upload Section */
        .upload-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 28px 24px;
          margin-bottom: 32px;
        }
        .upload-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f1f5f9;
        }
        .upload-title i { color: #3b82f6; }
        .preview-box {
          margin-bottom: 16px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .preview-box img {
          width: 100%;
          max-height: 250px;
          object-fit: cover;
          display: block;
        }
        .preview-placeholder {
          padding: 40px;
          text-align: center;
          color: #475569;
        }
        .preview-placeholder i {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        /* Photos Grid */
        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f1f5f9;
        }
        .section-title i { color: #8b5cf6; }
        .photo-count {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
          margin-left: auto;
        }

        .photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        .photo-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .photo-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }
        .photo-card img {
          width: 100%;
          height: 160px;
          object-fit: cover;
          display: block;
        }
        .photo-card-body {
          padding: 14px 16px;
        }
        .photo-card-caption {
          font-size: 0.9rem;
          color: #e2e8f0;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .photo-card-date {
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 12px;
        }
        .photo-card-actions {
          display: flex;
          gap: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #475569;
        }
        .empty-state i {
          font-size: 3rem;
          margin-bottom: 16px;
          color: #334155;
        }
        .empty-state p {
          font-size: 1rem;
          margin: 0;
        }

        /* Delete Confirm */
        .delete-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .delete-box {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 28px 24px;
          max-width: 380px;
          width: 100%;
          text-align: center;
        }
        .delete-box-icon {
          width: 52px;
          height: 52px;
          background: rgba(239, 68, 68, 0.15);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: #f87171;
          font-size: 1.3rem;
        }
        .delete-box h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 8px;
          color: #f1f5f9;
        }
        .delete-box p {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0 0 24px;
        }
        .delete-box-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        /* Toast */
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 14px 20px;
          border-radius: 12px;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 500;
          z-index: 99999;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          animation: toastIn 0.3s ease;
        }
        .toast.success { background: linear-gradient(135deg, #059669, #10b981); }
        .toast.error { background: linear-gradient(135deg, #dc2626, #ef4444); }
        @keyframes toastIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 640px) {
          .admin-header { padding: 16px; }
          .admin-body { padding: 20px 14px 40px; }
          .upload-card { padding: 20px 16px; }
          .photos-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
          .photo-card img { height: 120px; }
          .login-box { padding: 30px 20px; }
        }
      `}</style>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      <div className="admin-page">
        {!authenticated ? (
          <div className="login-container">
            <div className="login-box">
              <div className="login-icon">
                <i className="fas fa-lock"></i>
              </div>
              <div className="login-title">Admin Access</div>
              <div className="login-desc">Enter the admin key to manage project photos</div>
              <form onSubmit={handleLogin}>
                <div className="field-group">
                  <label className="field-label">Admin Key</label>
                  <input
                    className="field-input"
                    type="password"
                    placeholder="Enter admin key"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    autoFocus
                  />
                </div>
                <button className="btn-primary" type="submit">
                  <i className="fas fa-sign-in-alt"></i>
                  Access Admin Panel
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="admin-header">
              <div className="admin-header-left">
                <div className="admin-logo">
                  <i className="fas fa-bridge-water"></i>
                </div>
                <div>
                  <div className="admin-title">Gallery Manager</div>
                  <div className="admin-subtitle">Madina Face 3 Bridge Project</div>
                </div>
              </div>
              <a href="/madinaface3bridgeproject" className="admin-back">
                <i className="fas fa-arrow-left"></i>
                Back to Project
              </a>
            </div>

            <div className="admin-body">
              {/* Upload Section */}
              <div className="upload-card">
                <div className="upload-title">
                  <i className="fas fa-cloud-upload-alt"></i>
                  Add New Photo
                </div>
                <form onSubmit={handleUpload}>
                  <div className="preview-box">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" onError={() => setPreviewUrl('')} />
                    ) : (
                      <div className="preview-placeholder">
                        <i className="fas fa-image"></i>
                        <p>Image preview will appear here</p>
                      </div>
                    )}
                  </div>
                  <div className="field-group">
                    <label className="field-label">Image URL</label>
                    <input
                      className="field-input"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onBlur={handleUrlBlur}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Caption (optional)</label>
                    <textarea
                      className="field-textarea"
                      placeholder="Describe this progress update..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    />
                  </div>
                  <button className="btn-primary" type="submit" disabled={uploading}>
                    {uploading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Adding...</>
                    ) : (
                      <><i className="fas fa-plus"></i> Add Photo to Gallery</>
                    )}
                  </button>
                </form>
              </div>

              {/* Existing Photos */}
              <div className="section-title">
                <i className="fas fa-images"></i>
                Gallery Photos
                <span className="photo-count">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
              </div>

              {loading ? (
                <div className="empty-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading photos...</p>
                </div>
              ) : photos.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-camera"></i>
                  <p>No photos yet. Add your first project progress photo above!</p>
                </div>
              ) : (
                <div className="photos-grid">
                  {photos.map((photo) => (
                    <div className="photo-card" key={photo.id}>
                      <img src={photo.imageUrl} alt={photo.caption || 'Project photo'} />
                      <div className="photo-card-body">
                        <div className="photo-card-caption">{photo.caption || 'No caption'}</div>
                        <div className="photo-card-date">
                          {new Date(photo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="photo-card-actions">
                          <button className="btn-danger" onClick={() => setDeleteId(photo.id)}>
                            <i className="fas fa-trash-alt"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Delete Confirmation */}
        {deleteId && (
          <div className="delete-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteId(null); }}>
            <div className="delete-box">
              <div className="delete-box-icon">
                <i className="fas fa-trash-alt"></i>
              </div>
              <h3>Delete Photo?</h3>
              <p>This action cannot be undone. The photo will be permanently removed from the gallery.</p>
              <div className="delete-box-actions">
                <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn-danger" onClick={() => handleDelete(deleteId)}>
                  <i className="fas fa-trash-alt"></i> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}
