// UploadZone.jsx — Exact match of the upload screen HTML design

import { useRef, useState, useCallback } from 'react';
import { compressImage, isValidImageFile } from '../utils/compressImage';

const MAX_IMAGES = 6;
const MIN_IMAGES = 2;

export default function UploadZone({ images, onImagesChange, onError }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    async (files) => {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter(isValidImageFile);
      const rejected = fileArray.length - imageFiles.length;

      if (rejected > 0) {
        onError(`Only images allowed, bestie 💅 (${rejected} file${rejected > 1 ? 's' : ''} skipped)`);
      }
      if (imageFiles.length === 0) return;

      const remaining = MAX_IMAGES - images.length;
      const toProcess = imageFiles.slice(0, remaining);

      if (imageFiles.length > remaining) {
        onError(`Max ${MAX_IMAGES} items — keeping first ${remaining} new one${remaining !== 1 ? 's' : ''}.`);
      }

      const compressed = await Promise.all(
        toProcess.map(async (file) => ({
          id: `${Date.now()}-${Math.random()}`,
          dataUrl: await compressImage(file),
          name: file.name,
        }))
      );

      onImagesChange([...images, ...compressed]);
    },
    [images, onImagesChange, onError]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleFileInput = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const removeImage = (id, e) => {
    e.stopPropagation();
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const hasImages = images.length > 0;
  const isFull = images.length >= MAX_IMAGES;

  return (
    <section className="w-full mt-stack-md relative">
      <div
        className={`vibe-border bg-surface-container p-4 rounded-lg flex flex-col items-center justify-center min-h-[320px] cursor-pointer transition-all active:scale-95 group ${isDragging ? 'bg-surface-container-high' : ''}`}
        onClick={() => !isFull && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        role="button"
        tabIndex={0}
        aria-label="Upload clothing photos"
        onKeyDown={(e) => e.key === 'Enter' && !isFull && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          aria-label="Upload images"
        />

        {!hasImages ? (
          /* ── Empty state: matches the HTML design exactly ── */
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Camera button circle with lime shadow */}
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center shadow-[6px_6px_0px_0px_#c3f400]">
              <span
                className="material-symbols-outlined text-on-primary-container text-4xl select-none"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                add_a_photo
              </span>
            </div>

            <div>
              <p className="font-headline-lg-mobile text-2xl text-secondary mb-1 font-black uppercase italic">
                DROP THE DRIP
              </p>
              <p className="font-label-xl text-label-xl text-on-surface-variant tracking-widest uppercase">
                TAP TO UPLOAD OR DRAG IMAGE
              </p>
            </div>
          </div>
        ) : (
          /* ── Thumbnail grid ── */
          <div className="w-full">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative rounded-DEFAULT overflow-hidden border-2 border-outline-variant aspect-[3/4] bg-surface-container-high animate-pop-in"
                  style={{ animationDelay: `${idx * 0.06}s`, opacity: 0 }}
                >
                  <img
                    src={img.dataUrl}
                    alt={`Clothing item ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Index badge */}
                  <div className="absolute top-1.5 left-1.5 bg-background/80 backdrop-blur-sm text-secondary-container font-label-xl text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    #{idx + 1}
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={(e) => removeImage(img.id, e)}
                    aria-label={`Remove item ${idx + 1}`}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-error-container text-on-error-container border border-black flex items-center justify-center text-[10px] font-black hover:scale-110 transition-transform"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add more */}
            {!isFull && (
              <button
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="w-full py-2 border-2 border-dashed border-outline-variant rounded-DEFAULT text-on-surface-variant font-label-xl text-label-xl uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
              >
                + Add more ({images.length}/{MAX_IMAGES})
              </button>
            )}
          </div>
        )}

        {/* Magic wand corner button */}
        <div className="absolute bottom-6 right-6 w-12 h-12 bg-tertiary-container rounded-full flex items-center justify-center border-2 border-black rotate-12 pointer-events-none">
          <span className="material-symbols-outlined text-on-tertiary-container select-none">
            auto_fix_high
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {hasImages && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(images.length / MAX_IMAGES) * 100}%`,
                background: images.length < MIN_IMAGES ? '#ffb4ab' : '#c3f400',
              }}
            />
          </div>
          <span
            className="font-label-xl text-label-xl uppercase tracking-wider"
            style={{ color: images.length < MIN_IMAGES ? '#ffb4ab' : '#a4899d', fontSize: '10px' }}
          >
            {images.length < MIN_IMAGES
              ? `Need ${MIN_IMAGES - images.length} more`
              : `${images.length} items ready`}
          </span>
        </div>
      )}
    </section>
  );
}
