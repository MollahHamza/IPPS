const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MAX_DIMENSION = 1600;
const KEEP_ORIGINAL_BYTES = 400 * 1024;

const readAsDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the image file'));
    reader.readAsDataURL(blob);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This file could not be opened as an image'));
    img.src = src;
  });

// Shrinks photos in the browser before upload: max 1600px, JPEG ~82% quality.
// Small images and GIFs (which may be animated) are uploaded unchanged.
export async function prepareImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (JPEG, PNG, WebP or GIF).');
  if (file.size > MAX_INPUT_BYTES) throw new Error('This image is larger than 15MB. Please choose a smaller one.');

  const original = await readAsDataUrl(file);
  if (file.type === 'image/gif') {
    if (file.size > 3 * 1024 * 1024) throw new Error('GIFs must be smaller than 3MB.');
    return original;
  }

  const img = await loadImage(original);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  if (scale === 1 && file.size <= KEEP_ORIGINAL_BYTES && /image\/(jpeg|png|webp)/.test(file.type)) return original;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // transparent PNG areas become white instead of black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}
