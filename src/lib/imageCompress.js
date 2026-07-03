// Client-side image compression for receipt photos.
// A raw phone photo is easily 3-8 MB — far too heavy to ship to the scan-receipt
// Edge Function as base64. We downscale to a max side (~1600px), re-encode as
// JPEG at ~0.7 quality, and return the bare base64 (no `data:image/...;base64,`
// prefix) so it drops straight into the Gemini vision request.
//
// @param {File|Blob} file — the picked image
// @param {Object}    [opts]
// @param {number}    [opts.maxSide=1600] — longest edge after downscale (px)
// @param {number}    [opts.quality=0.7]  — JPEG quality (0..1)
// @returns {Promise<{ base64: string, mimeType: string }>}
export async function compressImageToBase64(file, { maxSide = 1600, quality = 0.7 } = {}) {
  const dataUrl = await readAsDataURL(file)
  const img = await loadImage(dataUrl)

  // Scale the longest side down to maxSide, keeping aspect ratio. Never upscale.
  const longest = Math.max(img.width, img.height)
  const scale = longest > maxSide ? maxSide / longest : 1
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas-unsupported')
  ctx.drawImage(img, 0, 0, w, h)

  const jpegDataUrl = canvas.toDataURL('image/jpeg', quality)
  // Strip the `data:image/jpeg;base64,` prefix — the Edge Function wants raw b64.
  const base64 = jpegDataUrl.slice(jpegDataUrl.indexOf(',') + 1)
  return { base64, mimeType: 'image/jpeg' }
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('read-failed'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('decode-failed'))
    img.src = src
  })
}
