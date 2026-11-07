import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  X,
  UploadCloud,
  Loader2
} from 'lucide-react';
import { 
  getAllProperties, 
  createProperty, 
  updateProperty, 
  togglePublishStatus, 
  toggleFeaturedStatus, 
  deleteProperty 
} from '../services/adminPropertyService';
import {
  uploadPropertyImage,
  validateImageFile,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  deletePropertyImageByUrl,
} from '../../services/storageService.js';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const EMPTY_PROPERTY_FORM = {
  title: '',
  subTitle: '',
  description: '',
  area: 'OMR',
  location: 'Siruseri, OMR, Chennai',
  areaSqFt: 1500,
  priceLakhs: 55,
  dimensions: '30 ft x 50 ft',
  facing: 'East Facing',
  approval: 'CMDA & DTCP Approved',
  approvalNo: 'CMDA/2026/REG',
  roadWidth: '30 Feet Blacktop Road',
  pattaStatus: 'Clear Ownership Patta',
  waterSource: 'Sweet Potable Ground Water',
  images: [],
  published: true,
  featured: false,
};

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all | published | draft

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PROPERTY_FORM);
  const [imageUploads, setImageUploads] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete dialog state
  const [deletingProperty, setDeletingProperty] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const syncFormImages = (nextImages) => {
    const normalizedUrls = nextImages.filter((img) => img.url).map((img) => img.url);
    setFormData((current) => ({
      ...current,
      images: normalizedUrls,
      image: normalizedUrls[0] || current.image || '',
    }));
  };

  const setPrimaryImage = (imageId) => {
    const next = imageUploads.map((image) => ({
      ...image,
      isPrimary: image.id === imageId,
    }));
    setImageUploads(next);
    syncFormImages(next);
  };

  const removeImage = async (imageId) => {
    const imageToRemove = imageUploads.find((image) => image.id === imageId);
    if (imageToRemove && !imageToRemove.isNew && imageToRemove.url && editingProperty?.id && !imageToRemove.url.startsWith('blob:')) {
      try {
        await deletePropertyImageByUrl(imageToRemove.url, editingProperty.id);
      } catch (err) {
        console.warn('[Properties] Image cleanup warning:', err.message);
      }
    }

    const next = imageUploads
      .filter((image) => image.id !== imageId)
      .map((image, index) => ({
        ...image,
        isPrimary: index === 0,
      }));

    setImageUploads(next);
    syncFormImages(next);
  };

  const handleSelectedFiles = (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return;

    const validFiles = [];
    for (const file of files) {
      try {
        validateImageFile(file);
        validFiles.push(file);
      } catch (error) {
        setUploadMessage({ type: 'error', text: error.message });
      }
    }

    if (!validFiles.length) {
      return;
    }

    const newEntries = validFiles.map((file, index) => ({
      id: `${Date.now()}-${Math.random()}-${index}`,
      url: URL.createObjectURL(file),
      fileName: file.name,
      file,
      isNew: true,
      isPrimary: imageUploads.length === 0 && index === 0,
      status: 'queued',
    }));

    const next = [...imageUploads, ...newEntries];
    const ensuredPrimary = next.some((image) => image.isPrimary)
      ? next
      : next.map((image, index) => ({ ...image, isPrimary: index === 0 }));

    setImageUploads(ensuredPrimary);
    syncFormImages(ensuredPrimary);
    setUploadMessage({ type: 'success', text: `${validFiles.length} image${validFiles.length > 1 ? 's' : ''} added to the upload list.` });
  };

  const uploadAllNewImages = async (propertyId) => {
    const pendingUploads = imageUploads.filter((image) => image.isNew && image.file);
    if (!pendingUploads.length) {
      return [];
    }

    setIsUploadingImages(true);
    setUploadMessage({ type: 'info', text: 'Uploading property images to Cloudinary...' });

    try {
      const uploaded = await Promise.all(
        pendingUploads.map((image, index) =>
          uploadPropertyImage(image.file, propertyId, ({ fileName, progress }) => {
            setImageUploads((current) =>
              current.map((entry) =>
                entry.id === image.id
                  ? { ...entry, status: progress >= 100 ? 'uploaded' : 'uploading', progress }
                  : entry
              )
            );
            setUploadMessage({
              type: 'info',
              text: `Uploading ${fileName || `image ${index + 1}`} (${Math.round(progress)}%)`,
            });
          })
        )
      );

      return uploaded.map((result) => result.downloadUrl).filter(Boolean);
    } catch (error) {
      console.error('[Properties] Image upload failed:', error);
      setUploadMessage({
        type: 'error',
        text: `Image upload failed: ${error.message || 'Unable to upload one or more images. The listing will still be saved without them.'}`,
      });
      return [];
    } finally {
      setIsUploadingImages(false);
    }
  };

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProperties();
      setProperties(data);
    } catch (err) {
      console.error('Error fetching admin properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProperty(null);
    setFormData(EMPTY_PROPERTY_FORM);
    setImageUploads([]);
    setUploadMessage({ type: '', text: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prop) => {
    setEditingProperty(prop);
    const existingImages = Array.isArray(prop.images) && prop.images.length > 0
      ? prop.images
      : (prop.image ? [prop.image] : []);

    const normalized = existingImages.map((url, index) => ({
      id: `existing-${prop.id}-${index}`,
      url,
      fileName: url.split('/').pop() || `property-${index + 1}.jpg`,
      isPrimary: index === 0,
      isNew: false,
    }));

    setImageUploads(normalized);
    setFormData({
      title: prop.title || '',
      subTitle: prop.subTitle || '',
      description: prop.description || '',
      area: prop.area || 'OMR',
      location: prop.location || '',
      areaSqFt: prop.areaSqFt || 1200,
      priceLakhs: prop.priceLakhs || 0,
      dimensions: prop.dimensions || '30 ft x 40 ft',
      facing: prop.facing || 'East Facing',
      approval: prop.approval || 'CMDA Approved',
      approvalNo: prop.approvalNo || '',
      roadWidth: prop.roadWidth || '30 Feet Road',
      pattaStatus: prop.pattaStatus || 'Clear Single Ownership Patta',
      waterSource: prop.waterSource || 'Sweet Potable Water',
      images: existingImages,
      published: Boolean(prop.published),
      featured: Boolean(prop.featured),
    });
    setUploadMessage({ type: '', text: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const existingImageUrls = imageUploads.filter((image) => !image.isNew).map((image) => image.url).filter(Boolean);

      let propertyId = editingProperty?.id || null;
      if (!propertyId) {
        const createdProperty = await createProperty({
          ...formData,
          images: [],
          image: '',
          imageUrls: [],
          published: Boolean(formData.published),
          featured: Boolean(formData.featured),
        });
        propertyId = createdProperty.id;
      }

      const uploadedUrls = await uploadAllNewImages(propertyId);
      const finalImageUrls = [...existingImageUrls, ...uploadedUrls].filter(Boolean);
      const primaryImage = imageUploads.find((image) => image.isPrimary)?.url || finalImageUrls[0] || '';
      const propertyPayload = {
        ...formData,
        images: finalImageUrls,
        image: primaryImage,
        imageUrls: finalImageUrls,
        published: Boolean(formData.published),
        featured: Boolean(formData.featured),
      };

      if (editingProperty) {
        await updateProperty(editingProperty.id, propertyPayload);
      } else {
        await updateProperty(propertyId, propertyPayload);
      }

      await fetchProperties();
      setIsModalOpen(false);
      setImageUploads([]);
      setUploadMessage({
        type: 'success',
        text: finalImageUrls.length
          ? 'Property saved successfully with uploaded images.'
          : 'Property saved successfully without images. You can add them later from the edit modal.',
      });
    } catch (err) {
      const message = err?.message || 'Failed to save property listing.';
      setFormError(message);
      setUploadMessage({ type: 'error', text: message });
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  };

  const handleTogglePublish = async (prop) => {
    try {
      await togglePublishStatus(prop.id, prop.published);
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, published: !p.published } : p))
      );
    } catch (err) {
      alert(`Could not toggle status: ${err.message}`);
    }
  };

  const handleToggleFeatured = async (prop) => {
    try {
      await toggleFeaturedStatus(prop.id, prop.featured);
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, featured: !p.featured } : p))
      );
    } catch (err) {
      alert(`Could not toggle featured: ${err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProperty) return;
    setIsDeleting(true);
    try {
      await deleteProperty(deletingProperty.id, deletingProperty.title);
      setProperties((prev) => prev.filter((p) => p.id !== deletingProperty.id));
      setDeletingProperty(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter properties
  const displayedProperties = properties.filter((p) => {
    if (filterStatus === 'published') return p.published === true;
    if (filterStatus === 'draft') return p.published !== true;
    return true;
  });

  const columns = [
    {
      key: 'title',
      header: 'Property Details',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'}
            alt=""
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0 max-w-xs sm:max-w-sm">
            <p className="font-bold text-slate-900 truncate">{row.title}</p>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              {row.location}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'area',
      header: 'Corridor',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700 text-xs">
          {row.area}
        </span>
      ),
    },
    {
      key: 'priceLakhs',
      header: 'Pricing',
      render: (row) => (
        <div>
          <p className="font-extrabold text-slate-900">₹{row.priceLakhs} Lakhs</p>
          <p className="text-[10px] text-slate-400">₹{row.pricePerSqFt}/sq.ft</p>
        </div>
      ),
    },
    {
      key: 'approval',
      header: 'Approvals',
      render: (row) => (
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
          {row.approval}
        </span>
      ),
    },
    {
      key: 'published',
      header: 'Status',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={row.published ? 'published' : 'draft'} />
          {row.featured && <StatusBadge status="featured" />}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Toggle Publish */}
          <button
            onClick={() => handleTogglePublish(row)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              row.published
                ? 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                : 'text-slate-400 hover:bg-slate-100 border-slate-200'
            }`}
            title={row.published ? 'Unpublish Listing' : 'Publish Listing'}
          >
            {row.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Toggle Featured */}
          <button
            onClick={() => handleToggleFeatured(row)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              row.featured
                ? 'text-amber-500 hover:bg-amber-50 border-amber-200'
                : 'text-slate-300 hover:bg-slate-100 border-slate-200'
            }`}
            title={row.featured ? 'Remove from Featured' : 'Mark as Featured'}
          >
            <Star className={`w-4 h-4 ${row.featured ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>

          {/* Edit */}
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer"
            title="Edit Property"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => setDeletingProperty(row)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
            title="Delete Property"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Property Listings ({properties.length})
          </h2>
          <p className="text-xs text-slate-500">
            Create, inspect, publish, edit, and organize Chennai residential plot listings.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-3" />
          <span>Add New Plot</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={displayedProperties}
        isLoading={isLoading}
        searchPlaceholder="Search by title, location, area, or approval..."
        searchKeys={['title', 'location', 'area', 'approval', 'approvalNo']}
        filterComponent={
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({properties.length})
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'published'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'draft'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drafts
            </button>
          </div>
        }
      />

      {/* Add / Edit Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingProperty ? 'Edit Property Listing' : 'Create New Property Listing'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Saves directly to Firestore <span className="text-indigo-400">properties</span> collection
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Property Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Emerald Crest – Gated Villa Plot near SIPCOT"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chennai Corridor *</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:bg-white"
                  >
                    <option value="OMR">OMR IT Corridor</option>
                    <option value="ECR">ECR Coastal Avenue</option>
                    <option value="Siruseri">Siruseri / SIPCOT</option>
                    <option value="Guduvanchery">Guduvanchery / GST Road</option>
                    <option value="Porur">Porur / Metro Corridor</option>
                    <option value="Kelambakkam">Kelambakkam</option>
                    <option value="Tambaram">Tambaram West</option>
                    <option value="Poonamallee">Poonamallee High Road</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exact Location String</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Siruseri, OMR, Chennai"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Area (Sq.Ft) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={formData.areaSqFt}
                    onChange={(e) => setFormData({ ...formData, areaSqFt: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price in Lakhs (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="1"
                    value={formData.priceLakhs}
                    onChange={(e) => setFormData({ ...formData, priceLakhs: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Legal Approvals</label>
                  <input
                    type="text"
                    value={formData.approval}
                    onChange={(e) => setFormData({ ...formData, approval: e.target.value })}
                    placeholder="CMDA & DTCP Approved"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approval Number</label>
                  <input
                    type="text"
                    value={formData.approvalNo}
                    onChange={(e) => setFormData({ ...formData, approvalNo: e.target.value })}
                    placeholder="CMDA/PPD/LO No. 34/2026"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facing</label>
                  <input
                    type="text"
                    value={formData.facing}
                    onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                    placeholder="East Facing"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dimensions & Road Width</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="30 ft x 50 ft"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Property Images</label>
                  <div
                    className={`rounded-2xl border-2 border-dashed p-4 transition-all ${
                      isDraggingFiles
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsDraggingFiles(true);
                    }}
                    onDragLeave={() => setIsDraggingFiles(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDraggingFiles(false);
                      handleSelectedFiles(event.dataTransfer.files);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-slate-700">
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold">Upload JPG, JPEG, PNG or WEBP images</span>
                      </div>
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-500">
                        <Plus className="w-3.5 h-3.5" />
                        Upload Images
                        <input
                          type="file"
                          accept={ALLOWED_MIME_TYPES.join(',')}
                          multiple
                          className="hidden"
                          onChange={(event) => handleSelectedFiles(event.target.files)}
                        />
                      </label>
                    </div>

                    <div className="mt-3 text-[11px] text-slate-500">
                      Maximum file size: {(MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB
                    </div>

                    {uploadMessage.text && (
                      <div
                        className={`mt-3 rounded-xl border px-3 py-2 text-[11px] ${
                          uploadMessage.type === 'error'
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : uploadMessage.type === 'success'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-blue-200 bg-blue-50 text-blue-700'
                        }`}
                      >
                        {uploadMessage.text}
                      </div>
                    )}

                    {imageUploads.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {imageUploads.map((image) => (
                          <div key={image.id} className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <img
                              src={image.url}
                              alt={image.fileName || 'Property'}
                              className={`h-24 w-full object-cover ${image.isPrimary ? 'ring-2 ring-indigo-500' : ''}`}
                            />

                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-slate-900/80 to-transparent px-2 py-1.5">
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(image.id)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                  image.isPrimary ? 'bg-indigo-500 text-white' : 'bg-white/80 text-slate-700'
                                }`}
                              >
                                {image.isPrimary ? 'Primary' : 'Set as primary'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="rounded-full bg-white/80 p-1 text-slate-700 hover:bg-rose-100 hover:text-rose-600"
                                title="Remove image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isUploadingImages && (
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-700">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading images to Cloudinary...
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details about road width, drinking water, nearby landmark..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-6 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publish to Public Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mark as Featured</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingProperty ? 'Save Changes' : 'Create Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingProperty)}
        onClose={() => setDeletingProperty(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Property Listing"
        message={`Are you sure you want to delete "${deletingProperty?.title}"? This will permanently remove the record from Cloud Firestore.`}
        confirmLabel="Delete Permanently"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

