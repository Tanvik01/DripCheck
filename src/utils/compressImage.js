/**
 * compressImage.js
 * Client-side image compression using Canvas API.
 * Resizes image to max 1200px on longest side,
 * then encodes as JPEG with quality 0.82 (~1MB cap).
 */

const MAX_SIDE = 1200;
const JPEG_QUALITY = 0.82;

/**
 * @param {File} file — the raw File object from input/drop
 * @returns {Promise<string>} base64 data URL (data:image/jpeg;base64,...)
 */
export async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Scale down if needed
        if (width > MAX_SIDE || height > MAX_SIDE) {
          if (width > height) {
            height = Math.round((height * MAX_SIDE) / width);
            width = MAX_SIDE;
          } else {
            width = Math.round((width * MAX_SIDE) / height);
            height = MAX_SIDE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate that a file is an image type we can handle.
 */
export function isValidImageFile(file) {
  return file.type.startsWith('image/');
}
