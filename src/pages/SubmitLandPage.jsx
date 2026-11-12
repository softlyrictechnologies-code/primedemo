import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ArrowRight, UploadCloud, Loader2, X, Copy } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { submitPropertyForReview } from '../services/sellerService';
import { usePublicSiteContent } from '../services/publicSiteContent';
import { validateImageFile, uploadSellerSubmissionImage, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../services/storageService';
import { validatePropertyTitle } from '../utils/propertyValidation.js';

const MAX_SELLER_IMAGES = 6;
const SUBMISSION_REFERENCE_KEY = 'primeHousingSubmissionReference';

export default function SubmitLandPage() {
  const siteContent = usePublicSiteContent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [form, setForm] = useState({
    title: '',
    location: '',
    propertyType: 'Residential Plot',
    areaSqFt: '',
    expectedPrice: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
    district: '',
    town: '',
    roadAccess: '',
    approvalDetails: '',
    additionalNotes: '',
    consent: false,
    description: '',
  });
  const [submissionReference, setSubmissionReference] = useState('');

  useEffect(() => {
    const savedReference = window.localStorage.getItem(SUBMISSION_REFERENCE_KEY);
    if (savedReference) {
      setSubmissionReference(savedReference);
      setSubmitted(true);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageSelection = (event) => {
    const incomingFiles = Array.from(event.target.files || []);
    if (!incomingFiles.length) return;

    const nextImages = [...selectedImages];
    for (const file of incomingFiles) {
      if (nextImages.length >= MAX_SELLER_IMAGES) {
        setToastMessage(`You can add up to ${MAX_SELLER_IMAGES} images only.`);
        break;
      }

      try {
        validateImageFile(file);
        nextImages.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          error: '',
        });
      } catch (error) {
        setToastMessage(error.message || 'One or more selected files are not valid images.');
      }
    }

    setSelectedImages(nextImages);
    event.target.value = '';
  };

  const removeSelectedImage = (imageId) => {
    setSelectedImages((prev) => {
      const target = prev.find((image) => image.id === imageId);
      if (target?.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((image) => image.id !== imageId);
    });
  };

  const handleCopyReference = async () => {
    if (!submissionReference) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(submissionReference);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = submissionReference;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setToastMessage('Submission reference copied to clipboard.');
    } catch (error) {
      setToastMessage('Unable to copy the submission reference.');
    }
  };

  const uploadImagesForSubmission = async (submissionId) => {
    if (!selectedImages.length) return [];

    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      for (const image of selectedImages) {
        const result = await uploadSellerSubmissionImage(image.file, submissionId, ({ progress, fileName }) => {
          setSelectedImages((prev) =>
            prev.map((item) =>
              item.id === image.id
                ? { ...item, progress: Math.min(100, Math.max(0, progress || 0)), error: '' }
                : item
            )
          );

          if (progress >= 100) {
            setToastMessage(`Uploaded ${fileName || 'image'} successfully.`);
          }
        });

        uploadedUrls.push(result.downloadUrl);
      }

      return uploadedUrls;
    } catch (error) {
      const message = error?.message || 'An image upload failed. Please try again.';
      setToastMessage(message);
      throw new Error(message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const titleError = validatePropertyTitle(form.title);
    if (titleError) {
      setToastMessage(titleError);
      return;
    }
    if (!form.consent) {
      setToastMessage('Please agree to be contacted about this property submission.');
      return;
    }
    setIsSubmitting(true);

    try {
      const submissionId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const uploadedUrls = await uploadImagesForSubmission(submissionId);
      const createdSubmission = await submitPropertyForReview({
        ...form,
        images: uploadedUrls,
        propertyType: form.propertyType,
        areaSqFt: form.areaSqFt,
        expectedPrice: form.expectedPrice,
      }, submissionId);

      setSubmitted(true);
      const nextReference = createdSubmission.id;
      setSubmissionReference(nextReference);
      window.localStorage.setItem(SUBMISSION_REFERENCE_KEY, nextReference);
      setToastMessage('Your property submission has been received and is pending admin review.');
      setForm({
        title: '',
        location: '',
        propertyType: 'Residential Plot',
        areaSqFt: '',
        expectedPrice: '',
        sellerName: '',
        sellerPhone: '',
        sellerEmail: '',
        district: '',
        town: '',
        roadAccess: '',
        approvalDetails: '',
        additionalNotes: '',
        consent: false,
        description: '',
      });
      selectedImages.forEach((image) => {
        if (image.preview?.startsWith('blob:')) URL.revokeObjectURL(image.preview);
      });
      setSelectedImages([]);
    } catch (error) {
      setToastMessage(error.message || 'We could not submit your property right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ph-site min-h-screen bg-slate-50 text-slate-900">
      <Header savedCount={0} compareCount={0} onOpenComparison={() => {}} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Landowner portal</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">{siteContent.submitTitle}</h1>
              <p className="mt-1 text-sm text-slate-600">{siteContent.submitDescription}</p>
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Property title</label>
                <input name="title" value={form.title} onChange={handleChange} maxLength={100} minLength={12} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Example: Residential plot in Siruseri OMR" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Location</label>
                <input name="location" value={form.location} onChange={handleChange} maxLength={160} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="OMR, Siruseri, or nearby area" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Property type</label>
                <select name="propertyType" value={form.propertyType} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white">
                  <option>Residential Plot</option>
                  <option>Commercial Plot</option>
                  <option>Farm Land</option>
                  <option>Villa Site</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Land area (sq.ft)</label>
                <input type="number" name="areaSqFt" min="1" max="100000000" step="1" value={form.areaSqFt} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="1500" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Expected selling price (₹)</label>
                <input type="number" name="expectedPrice" min="1" max="100000000000" step="1" value={form.expectedPrice} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="2500000" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Landowner name</label>
                <input name="sellerName" value={form.sellerName} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Your name" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Phone number</label>
                <input type="tel" name="sellerPhone" value={form.sellerPhone} onChange={handleChange} pattern="^(?:\+?91[ \-]?)?[6-9](?:[0-9][ \-]?){9}$" title="Enter a valid 10-digit Indian mobile number" maxLength={18} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="+91 98765 43210" required />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Email (optional)</label>
                <input type="email" name="sellerEmail" value={form.sellerEmail} onChange={handleChange} maxLength={160} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="you@example.com" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">District / town</label>
                <input name="district" value={form.district} onChange={handleChange} maxLength={100} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Chengalpattu" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Town / village</label>
                <input name="town" value={form.town} onChange={handleChange} maxLength={100} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Siruseri" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Road access information</label>
                <input name="roadAccess" value={form.roadAccess} onChange={handleChange} maxLength={500} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Road width and access details" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Approvals / documents (optional)</label>
                <input name="approvalDetails" value={form.approvalDetails} onChange={handleChange} maxLength={500} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Share only documents you currently hold" />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Property photos</label>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <UploadCloud className="h-4 w-4 text-emerald-600" />
                      <span>Upload up to {MAX_SELLER_IMAGES} images (JPG, PNG, WEBP, max {(MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB each)</span>
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">
                      Choose images
                      <input type="file" accept={ALLOWED_MIME_TYPES.join(',')} multiple className="hidden" onChange={handleImageSelection} />
                    </label>
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {selectedImages.map((image) => (
                        <div key={image.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          <img src={image.preview} alt="submission preview" className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(image.id)}
                            className="absolute right-2 top-2 rounded-full bg-slate-900/75 p-1 text-white hover:bg-slate-900"
                            aria-label="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="border-t border-slate-200 bg-slate-50 px-2 py-1">
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-emerald-600 transition-all"
                                style={{ width: `${image.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Property description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows="5" maxLength={2500} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Share access roads, location notes, nearby landmarks, and property details." required />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Additional notes (optional)</label>
                <textarea name="additionalNotes" value={form.additionalNotes} onChange={handleChange} rows="3" maxLength={1000} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white" placeholder="Anything else the review team should know" />
              </div>

              <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3">
                  <label className="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} required className="mt-1" /><span>I agree to be contacted about this property submission.</span></label>
                  <div className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Information remains private until admin approval.</div>
                </div>
                <button type="submit" disabled={isSubmitting || uploadingImages} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-70">
                  {isSubmitting || uploadingImages ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {uploadingImages ? 'Uploading images...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      Submit for review
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-4xl bg-emerald-50 border border-emerald-200 p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" />
              <h2 className="mt-4 text-2xl font-black text-slate-900">Submission received</h2>
              <p className="mt-2 text-sm text-slate-600">Your land listing has been stored privately and is awaiting admin review before it can be published.</p>
              <p className="mt-3 text-sm font-bold text-emerald-800">Submission reference: <span className="font-mono">{submissionReference}</span></p>
              <div className="mt-6 flex justify-center gap-3">
                <button type="button" onClick={handleCopyReference} className="inline-flex items-center gap-2 rounded-full border border-emerald-600 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
                  <Copy className="h-4 w-4" /> Copy reference
                </button>
                <Link to="/" className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">Return home</Link>
                <Link to="/properties" className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800">Browse listings</Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
