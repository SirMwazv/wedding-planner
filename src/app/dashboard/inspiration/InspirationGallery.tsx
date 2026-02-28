'use client';

import { useState, useRef } from 'react';
import { uploadInspirationPhoto, deleteInspirationPhoto } from '@/lib/actions/inspiration';
import type { InspirationPhoto } from '@/lib/actions/inspiration';

interface Props {
    photos: InspirationPhoto[];
}

export default function InspirationGallery({ photos }: Props) {
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [previewPhoto, setPreviewPhoto] = useState<InspirationPhoto | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleUpload(formData: FormData) {
        setUploading(true);
        setError(null);
        const result = await uploadInspirationPhoto(formData);
        if (result?.error) {
            setError(result.error);
        } else {
            setShowUpload(false);
            window.location.reload();
        }
        setUploading(false);
    }

    async function handleDelete(id: string) {
        setDeletingId(id);
        const result = await deleteInspirationPhoto(id);
        if (result?.error) {
            alert(result.error);
            setDeletingId(null);
        } else {
            window.location.reload();
        }
    }

    return (
        <>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2>Inspiration</h2>
                    <p>Your playground for wedding ideas — collect photos, mood boards &amp; visual inspiration</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
                        📸 Upload Photo
                    </button>
                </div>
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}>
                    <div className="modal-content">
                        <h3>Upload Inspiration Photo</h3>
                        {error && <div className="auth-error">{error}</div>}
                        <form action={handleUpload}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="insp-file">Photo</label>
                                <input
                                    ref={fileInputRef}
                                    id="insp-file"
                                    name="file"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="form-input"
                                    required
                                />
                                <span className="form-hint">JPEG, PNG, WebP or GIF — max 10MB</span>
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="insp-caption">Caption (optional)</label>
                                <input
                                    id="insp-caption"
                                    name="caption"
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Table decor idea, Bridal bouquet inspo..."
                                />
                            </div>
                            <div className="flex gap-sm">
                                <button type="submit" className="btn btn-primary" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Gallery Grid */}
            {photos.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📸</div>
                        <h3>No inspiration photos yet</h3>
                        <p>Upload photos to create a mood board for your wedding ideas — venues, flowers, decor, outfits &amp; more</p>
                        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>Upload Your First Photo</button>
                    </div>
                </div>
            ) : (
                <div className="inspiration-grid">
                    {photos.map((photo) => (
                        <div key={photo.id} className="inspiration-card" onClick={() => setPreviewPhoto(photo)}>
                            <div className="inspiration-image-wrapper">
                                <img
                                    src={photo.file_url}
                                    alt={photo.caption || 'Inspiration photo'}
                                    className="inspiration-image"
                                    loading="lazy"
                                />
                                <div className="inspiration-overlay">
                                    <button
                                        className="inspiration-delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete this photo?')) handleDelete(photo.id);
                                        }}
                                        disabled={deletingId === photo.id}
                                        title="Delete photo"
                                    >
                                        {deletingId === photo.id ? '...' : '🗑️'}
                                    </button>
                                </div>
                            </div>
                            {photo.caption && (
                                <div className="inspiration-caption">{photo.caption}</div>
                            )}
                            <div className="inspiration-date">
                                {new Date(photo.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Preview */}
            {previewPhoto && (
                <div className="modal-overlay" onClick={() => setPreviewPhoto(null)} style={{ background: 'rgba(0,0,0,0.85)' }}>
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img
                            src={previewPhoto.file_url}
                            alt={previewPhoto.caption || 'Inspiration photo'}
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 'var(--radius-lg)', objectFit: 'contain' }}
                        />
                        {previewPhoto.caption && (
                            <div style={{ color: 'white', marginTop: 'var(--space-md)', fontSize: 'var(--text-lg)', fontWeight: 500, textAlign: 'center' }}>
                                {previewPhoto.caption}
                            </div>
                        )}
                        <button
                            className="btn btn-ghost"
                            onClick={() => setPreviewPhoto(null)}
                            style={{ position: 'absolute', top: '-40px', right: '0', color: 'white', fontSize: '24px' }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
