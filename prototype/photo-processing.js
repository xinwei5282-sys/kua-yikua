/** Browser-only conservative preprocessing. Never invent or remove subjects. */
export function preparePhoto(image, index) {
  const scale = Math.min(1, 1800 / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const luminance = [];
  const stride = Math.max(4, Math.floor(pixels.data.length / 4096 / 4) * 4);
  for (let i = 0; i < pixels.data.length; i += stride) {
    luminance.push(.2126 * pixels.data[i] + .7152 * pixels.data[i + 1] + .0722 * pixels.data[i + 2]);
  }
  luminance.sort((a, b) => a - b);
  const median = luminance[Math.floor(luminance.length / 2)] || 128;
  const highlights = luminance[Math.floor(luminance.length * .95)] || 255;
  // Small bounded correction preserves intentional lighting and avoids blown highlights.
  const gain = Math.max(.95, Math.min(highlights > 244 ? 1 : 1.07, 136 / Math.max(1, median)));
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
    const grey = .2126 * r + .7152 * g + .0722 * b;
    pixels.data[i] = (grey + (r - grey) * .96) * gain + 1.2;
    pixels.data[i + 1] = (grey + (g - grey) * .96) * gain + .4;
    pixels.data[i + 2] = (grey + (b - grey) * .96) * gain - .6;
  }
  ctx.putImageData(pixels, 0, 0);
  return { image: canvas, index, aspect: canvas.width / canvas.height, exposureGain: gain };
}

export function fitPhoto(photo, box) {
  const { image, aspect } = photo;
  const ratio = box.w / box.h;
  const retained = Math.min(aspect / ratio, ratio / aspect);
  // Without reliable subject segmentation, permit only a very small crop.
  // Extreme ratios retain the complete source, rather than cutting a face/object.
  if (retained >= .92) return { x: box.x, y: box.y, w: box.w, h: box.h, cover: true };
  const scale = Math.min(box.w / image.width, box.h / image.height);
  const w = image.width * scale, h = image.height * scale;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h, cover: false };
}
