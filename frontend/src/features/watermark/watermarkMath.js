/**
 * Calculates a precise bounding box of the rendered image to restrict dragging.
 * @param {HTMLImageElement | null} img
 * @param {HTMLElement | null} box
 * @returns {{left:number, top:number, width:number, height:number, scale:number}}
 */
export function calculateImageRect(img, box) {
  if (!img || !box) return { left: 0, top: 0, width: 1, height: 1, scale: 1 };

  const cw = box.clientWidth || 1;
  const ch = box.clientHeight || 1;
  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;

  const scale = Math.min(cw / iw, ch / ih);
  const width = Math.max(1, iw * scale);
  const height = Math.max(1, ih * scale);
  const left = (cw - width) / 2;
  const top = (ch - height) / 2;

  return { left, top, width, height, scale };
}

/**
 * Loads an image element from a URL.
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = url;
  });
}

/**
 * Keeps a keyboard-moved watermark inside the same bounds used for dragging.
 * @param {{x:number, y:number}} position
 * @param {{left:number, right:number, top:number, bottom:number}} bounds
 * @returns {{x:number, y:number}}
 */
export function constrainOverlayPosition(position, bounds) {
  return {
    x: Math.max(bounds.left, Math.min(bounds.right, position.x)),
    y: Math.max(bounds.top, Math.min(bounds.bottom, position.y)),
  };
}
