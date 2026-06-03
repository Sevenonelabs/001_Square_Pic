import './style.css';

// ─── Types ──────────────────────────────────────────────────────

interface ImageState {
  img: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
}

interface ViewportState {
  containerW: number;
  containerH: number;
  zoom: number;
  panX: number;
  panY: number;
  minZoom: number;
  maxZoom: number;
}

interface CropState {
  x: number;
  y: number;
  w: number;
  h: number;
  ratio: number | null;
}

type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type FormatId = 'jpeg' | 'png' | 'webp' | 'avif';
type DragMode = 'pan' | 'move' | HandleId;

interface DragState {
  mode: DragMode;
  startMX: number;
  startMY: number;
  startPanX: number;
  startPanY: number;
  startCrop: { x: number; y: number; w: number; h: number } | null;
  anchorX: number;
  anchorY: number;
  moved: boolean;
}

// ─── State ──────────────────────────────────────────────────────

let imageState: ImageState | null = null;
let viewport: ViewportState;
let crop: CropState | null = null;
let drag: DragState | null = null;

// Export settings
let exportFormat: FormatId = 'jpeg';
let exportQuality = 90;
let bgColor = '#ffffff';
let showBgPicker = true;

// ─── DOM refs ───────────────────────────────────────────────────

let dropZone: HTMLElement;
let fileInput: HTMLInputElement;
let selectBtn: HTMLElement;
let workspace: HTMLElement;
let viewportEl: HTMLElement;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let cropOverlay: HTMLElement;
let cropRegion: HTMLElement;
let cropGrid: HTMLElement;
let zoomDisplay: HTMLElement;
let origDimsDisplay: HTMLElement;
let cropDimsDisplay: HTMLElement;
let exportDimsDisplay: HTMLElement;
let fileSizeDisplay: HTMLElement;
let uploadNewBtn: HTMLButtonElement;
let exportBtn: HTMLButtonElement;
let exportMenu: HTMLElement;
let confirmExportBtn: HTMLButtonElement;
let qualitySlider: HTMLInputElement;
let qualityVal: HTMLElement;
let fmtHint: HTMLElement;
let qualitySection: HTMLElement;
let bgPickerSection: HTMLElement;
let bgColorInput: HTMLInputElement;
let formatTabBtns: NodeListOf<HTMLButtonElement>;
let ratioBtns: NodeListOf<HTMLButtonElement>;
let zoomInBtn: HTMLButtonElement;
let zoomOutBtn: HTMLButtonElement;
let zoomSlider: HTMLInputElement;
let zoomPct: HTMLElement;
let bottomSheet: HTMLElement;
let closeSheetBtn: HTMLButtonElement;
let sheetTitle: HTMLElement;
let sheetContent: HTMLElement;

// ─── Coordinate transforms ─────────────────────────────────────

function imageToDisplayX(ix: number): number {
  return ix * viewport.zoom + viewport.panX;
}
function imageToDisplayY(iy: number): number {
  return iy * viewport.zoom + viewport.panY;
}
function imageToDisplayW(iw: number): number {
  return iw * viewport.zoom;
}
function imageToDisplayH(ih: number): number {
  return ih * viewport.zoom;
}

function displayToImageX(dx: number): number {
  return (dx - viewport.panX) / viewport.zoom;
}
function displayToImageY(dy: number): number {
  return (dy - viewport.panY) / viewport.zoom;
}

function clampImageX(ix: number): number {
  if (!imageState) return ix;
  return Math.max(0, Math.min(imageState.naturalWidth, ix));
}
function clampImageY(iy: number): number {
  if (!imageState) return iy;
  return Math.max(0, Math.min(imageState.naturalHeight, iy));
}

// ─── Viewport helpers ───────────────────────────────────────────

function computeFitZoom(): number {
  if (!imageState) return 1;
  const iw = imageState.naturalWidth;
  const ih = imageState.naturalHeight;
  const pad = 20;
  const cw = viewport.containerW - pad * 2;
  const ch = viewport.containerH - pad * 2;
  return Math.min(cw / iw, ch / ih);
}

function getMaxZoom(): number {
  return 20;
}

function clampZoom(z: number): number {
  return Math.max(viewport.minZoom, Math.min(viewport.maxZoom, z));
}

function centerPan(): { panX: number; panY: number } {
  if (!imageState) return { panX: 0, panY: 0 };
  const dispW = imageState.naturalWidth * viewport.zoom;
  const dispH = imageState.naturalHeight * viewport.zoom;
  return {
    panX: (viewport.containerW - dispW) / 2,
    panY: (viewport.containerH - dispH) / 2,
  };
}

function clampPan(): { panX: number; panY: number } {
  if (!imageState) return { panX: viewport.panX, panY: viewport.panY };
  const dispW = imageState.naturalWidth * viewport.zoom;
  const dispH = imageState.naturalHeight * viewport.zoom;
  const margin = 0.3;
  const maxPanX = viewport.containerW * margin;
  const minPanX = -(dispW - viewport.containerW * (1 - margin));
  const maxPanY = viewport.containerH * margin;
  const minPanY = -(dispH - viewport.containerH * (1 - margin));
  return {
    panX: Math.max(minPanX, Math.min(maxPanX, viewport.panX)),
    panY: Math.max(minPanY, Math.min(maxPanY, viewport.panY)),
  };
}

// ─── Zoom ───────────────────────────────────────────────────────

function setZoom(newZoom: number, cx?: number, cy?: number) {
  const oldZoom = viewport.zoom;
  newZoom = clampZoom(newZoom);
  if (cx === undefined || cy === undefined) {
    cx = viewport.containerW / 2;
    cy = viewport.containerH / 2;
  }
  const ix = displayToImageX(cx);
  const iy = displayToImageY(cy);
  viewport.zoom = newZoom;
  viewport.panX = cx - ix * viewport.zoom;
  viewport.panY = cy - iy * viewport.zoom;
  updateZoomDisplay();
  render();
}

function zoomIn() {
  const cx = viewport.containerW / 2;
  const cy = viewport.containerH / 2;
  setZoom(viewport.zoom * 1.3, cx, cy);
}

function zoomOut() {
  const cx = viewport.containerW / 2;
  const cy = viewport.containerH / 2;
  setZoom(viewport.zoom / 1.3, cx, cy);
}

function fitToScreen() {
  viewport.zoom = computeFitZoom();
  const cp = centerPan();
  viewport.panX = cp.panX;
  viewport.panY = cp.panY;
  updateZoomDisplay();
  render();
}

// ─── Crop state management ──────────────────────────────────────

function initCrop() {
  if (!imageState) return;
  const iw = imageState.naturalWidth;
  const ih = imageState.naturalHeight;
  crop = { x: 0, y: 0, w: iw, h: ih, ratio: null };
}

function applyRatioIfSet() {
  if (!crop || !imageState || crop.ratio === null) return;
  const r = crop.ratio;
  let cw = crop.w;
  let ch = crop.h;
  if (cw / ch > r) {
    ch = cw / r;
  } else {
    cw = ch * r;
  }
  const iw = imageState.naturalWidth;
  const ih = imageState.naturalHeight;
  if (cw > iw) { cw = iw; ch = cw / r; }
  if (ch > ih) { ch = ih; cw = ch * r; }
  const cx2 = crop.x + crop.w;
  const cy2 = crop.y + crop.h;
  crop.x = clampImageX(crop.x + (crop.w - cw) / 2);
  crop.y = clampImageY(crop.y + (crop.h - ch) / 2);
  crop.w = Math.min(cw, iw - crop.x);
  crop.h = Math.min(ch, ih - crop.y);
}

function clampCrop() {
  if (!crop || !imageState) return;
  const iw = imageState.naturalWidth;
  const ih = imageState.naturalHeight;
  if (crop.x < 0) { crop.w += crop.x; crop.x = 0; }
  if (crop.y < 0) { crop.h += crop.y; crop.y = 0; }
  if (crop.x + crop.w > iw) crop.w = iw - crop.x;
  if (crop.y + crop.h > ih) crop.h = ih - crop.y;
  crop.w = Math.max(4, crop.w);
  crop.h = Math.max(4, crop.h);
}

// ─── Rendering ──────────────────────────────────────────────────

function render() {
  if (!imageState || !crop) return;
  const w = viewport.containerW;
  const h = viewport.containerH;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.clearRect(0, 0, w, h);

  const img = imageState.img;
  const iw = imageState.naturalWidth;
  const ih = imageState.naturalHeight;
  const dispW = iw * viewport.zoom;
  const dispH = ih * viewport.zoom;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, viewport.panX, viewport.panY, dispW, dispH);

  renderCropOverlay();
  updateCropDisplay();
  updateExportDims();
  estimateFileSize();
}

function renderCropOverlay() {
  if (!crop || !imageState) {
    cropOverlay.style.display = 'none';
    return;
  }
  cropOverlay.style.display = 'block';

  const dx = imageToDisplayX(crop.x);
  const dy = imageToDisplayY(crop.y);
  const dw = imageToDisplayW(crop.w);
  const dh = imageToDisplayH(crop.h);

  cropRegion.style.left = `${dx}px`;
  cropRegion.style.top = `${dy}px`;
  cropRegion.style.width = `${dw}px`;
  cropRegion.style.height = `${dh}px`;
}



// ─── Crop overlay HTML rendering ────────────────────────────────

function updateCropDisplay() {
  if (!crop || !imageState) {
    cropDimsDisplay.textContent = '-- × --';
    return;
  }
  cropDimsDisplay.textContent = `${Math.round(crop.w)} × ${Math.round(crop.h)} px`;
}

function updateExportDims() {
  if (!crop || !imageState) {
    exportDimsDisplay.textContent = '-- × --';
    document.getElementById('cropExportDims2')!.textContent = '-- × --';
    return;
  }
  const txt = `${Math.round(crop.w)} × ${Math.round(crop.h)} px`;
  exportDimsDisplay.textContent = txt;
  document.getElementById('cropExportDims2')!.textContent = txt;
}

function updateZoomDisplay() {
  const pct = Math.round(viewport.zoom * 100);
  zoomPct.textContent = `${pct}%`;
  zoomSlider.value = String(pct);
}

// ─── File size estimate ─────────────────────────────────────────

let sizeTimer: ReturnType<typeof setTimeout>;

function estimateFileSize() {
  if (!crop || !imageState) {
    fileSizeDisplay.textContent = '--';
    document.getElementById('cropFileSize2')!.textContent = '--';
    return;
  }
  const cw = Math.round(crop.w);
  const ch = Math.round(crop.h);
  const approxBytes = cw * ch * 4;
  let text: string;
  if (approxBytes > 1048576) {
    text = `${(approxBytes / 1048576).toFixed(1)} MB`;
  } else {
    text = `${(approxBytes / 1024).toFixed(0)} KB`;
  }
  fileSizeDisplay.textContent = `~${text}`;
  document.getElementById('cropFileSize2')!.textContent = `~${text}`;
}

// ─── Drag handlers ──────────────────────────────────────────────

function getViewportPos(e: MouseEvent | Touch): { x: number; y: number } {
  const rect = viewportEl.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function onPointerDown(e: MouseEvent | TouchEvent) {
  if (!imageState || !crop) return;
  const pos = getViewportPos(e instanceof MouseEvent ? e : e.touches[0]);
  const mx = pos.x;
  const my = pos.y;

  // Check if on a crop handle
  const target = e.target as HTMLElement;
  const handle = target.closest('.crop-handle');
  if (handle) {
    const id = (handle as HTMLElement).dataset.handle as HandleId;
    startDrag(id, mx, my);
    return;
  }

  // Check if inside crop region
  const dx = imageToDisplayX(crop.x);
  const dy = imageToDisplayY(crop.y);
  const dw = imageToDisplayW(crop.w);
  const dh = imageToDisplayH(crop.h);
  if (mx >= dx && mx <= dx + dw && my >= dy && my <= dy + dh) {
    startDrag('move', mx, my);
    return;
  }

  // Otherwise pan
  startDrag('pan', mx, my);
}

function startDrag(mode: DragMode, mx: number, my: number) {
  drag = {
    mode,
    startMX: mx,
    startMY: my,
    startPanX: viewport.panX,
    startPanY: viewport.panY,
    startCrop: crop ? { x: crop.x, y: crop.y, w: crop.w, h: crop.h } : null,
    anchorX: 0,
    anchorY: 0,
    moved: false,
  };
  if (mode !== 'pan' && mode !== 'move' && crop) {
    const anchorOffsets: Record<HandleId, { ax: number; ay: number }> = {
      nw: { ax: crop.x + crop.w, ay: crop.y + crop.h },
      n: { ax: crop.x + crop.w / 2, ay: crop.y + crop.h },
      ne: { ax: crop.x, ay: crop.y + crop.h },
      e: { ax: crop.x, ay: crop.y + crop.h / 2 },
      se: { ax: crop.x, ay: crop.y },
      s: { ax: crop.x + crop.w / 2, ay: crop.y },
      sw: { ax: crop.x + crop.w, ay: crop.y },
      w: { ax: crop.x + crop.w, ay: crop.y + crop.h / 2 },
    };
    drag.anchorX = anchorOffsets[mode].ax;
    drag.anchorY = anchorOffsets[mode].ay;
  }
  viewportEl.style.cursor = mode === 'pan' ? 'grabbing' : mode === 'move' ? 'move' : 'nwse-resize';
}

function onPointerMove(e: MouseEvent | TouchEvent) {
  if (!drag || !crop || !imageState) return;
  const pos = getViewportPos(e instanceof MouseEvent ? e : e.touches[0]);
  const mx = pos.x;
  const my = pos.y;
  if (!drag.moved) {
    const d = Math.abs(mx - drag.startMX) + Math.abs(my - drag.startMY);
    if (d < 3) return;
    drag.moved = true;
  }

  if (drag.mode === 'pan') {
    const dx = mx - drag.startMX;
    const dy = my - drag.startMY;
    viewport.panX = drag.startPanX + dx;
    viewport.panY = drag.startPanY + dy;
    const clamped = clampPan();
    viewport.panX = clamped.panX;
    viewport.panY = clamped.panY;
    render();
    return;
  }

  if (drag.mode === 'move') {
    const ddx = mx - drag.startMX;
    const ddy = my - drag.startMY;
    const movedX = ddx / viewport.zoom;
    const movedY = ddy / viewport.zoom;
    const sc = drag.startCrop!;
    crop.x = clampImageX(sc.x + movedX);
    crop.y = clampImageY(sc.y + movedY);
    if (crop.x + crop.w > imageState.naturalWidth) crop.x = imageState.naturalWidth - crop.w;
    if (crop.y + crop.h > imageState.naturalHeight) crop.y = imageState.naturalHeight - crop.h;
    render();
    return;
  }

  // Resize via handle
  const ix = displayToImageX(mx);
  const iy = displayToImageY(my);
  const sc = drag.startCrop!;
  const ax = drag.anchorX;
  const ay = drag.anchorY;
  let newX = sc.x;
  let newY = sc.y;
  let newW = sc.w;
  let newH = sc.h;
  const r = crop.ratio;

  function applyCorner(ix: number, iy: number, ax: number, ay: number) {
    let rawW = ix - ax;
    let rawH = iy - ay;
    if (r !== null) {
      if (Math.abs(rawW) < Math.abs(rawH * r)) {
        rawH = rawW / r;
      } else {
        rawW = rawH * r;
      }
    }
    const x1 = Math.min(ax, ax + rawW);
    const y1 = Math.min(ay, ay + rawH);
    const x2 = Math.max(ax, ax + rawW);
    const y2 = Math.max(ay, ay + rawH);
    return {
      x: clampImageX(x1),
      y: clampImageY(y1),
      w: Math.min(x2, imageState!.naturalWidth) - clampImageX(x1),
      h: Math.min(y2, imageState!.naturalHeight) - clampImageY(y1),
    };
  }

  switch (drag.mode) {
    case 'se': {
      const r2 = applyCorner(ix, iy, ax, ay);
      newX = r2.x; newY = r2.y; newW = r2.w; newH = r2.h;
      break;
    }
    case 'ne': {
      const r2 = applyCorner(ix, iy, ax, ay);
      newX = r2.x; newY = r2.y; newW = r2.w; newH = r2.h;
      break;
    }
    case 'sw': {
      const r2 = applyCorner(ix, iy, ax, ay);
      newX = r2.x; newY = r2.y; newW = r2.w; newH = r2.h;
      break;
    }
    case 'nw': {
      const r2 = applyCorner(ix, iy, ax, ay);
      newX = r2.x; newY = r2.y; newW = r2.w; newH = r2.h;
      break;
    }
    case 'e': {
      newW = clampImageX(ix) - crop.x;
      if (r !== null) {
        newH = newW / r;
        if (crop.y + newH > imageState.naturalHeight) {
          newH = imageState.naturalHeight - crop.y;
          newW = newH * r;
        }
      }
      break;
    }
    case 'w': {
      const right = crop.x + crop.w;
      newX = clampImageX(ix);
      newW = right - newX;
      if (r !== null) {
        newH = newW / r;
        if (crop.y + newH > imageState.naturalHeight) {
          newH = imageState.naturalHeight - crop.y;
          newW = newH * r;
          newX = right - newW;
        }
      }
      break;
    }
    case 's': {
      newH = clampImageY(iy) - crop.y;
      if (r !== null) {
        newW = newH * r;
        if (crop.x + newW > imageState.naturalWidth) {
          newW = imageState.naturalWidth - crop.x;
          newH = newW / r;
        }
      }
      break;
    }
    case 'n': {
      const bottom = crop.y + crop.h;
      newY = clampImageY(iy);
      newH = bottom - newY;
      if (r !== null) {
        newW = newH * r;
        if (crop.x + newW > imageState.naturalWidth) {
          newW = imageState.naturalWidth - crop.x;
          newH = newW / r;
          newY = bottom - newH;
        }
      }
      break;
    }
  }

  newW = Math.max(4, newW);
  newH = Math.max(4, newH);
  crop.x = clampImageX(newX);
  crop.y = clampImageY(newY);
  crop.w = Math.min(newW, imageState.naturalWidth - crop.x);
  crop.h = Math.min(newH, imageState.naturalHeight - crop.y);
  render();
}

function onPointerUp() {
  if (!drag) return;
  viewportEl.style.cursor = '';
  if (drag.mode === 'pan' || drag.mode === 'move') {
    const clamped = clampPan();
    viewport.panX = clamped.panX;
    viewport.panY = clamped.panY;
  }
  drag = null;
}

function onWheel(e: WheelEvent) {
  e.preventDefault();
  if (!imageState) return;
  const rect = viewportEl.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
  setZoom(viewport.zoom * factor, cx, cy);
}

let touchDist = 0;
let touchZoom = 1;

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    touchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    touchZoom = viewport.zoom;
  } else if (e.touches.length === 1) {
    onPointerDown(e);
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2 && touchDist > 0) {
    e.preventDefault();
    const newDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const scale = newDist / touchDist;
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    const rect = viewportEl.getBoundingClientRect();
    setZoom(touchZoom * scale, cx - rect.left, cy - rect.top);
  } else if (e.touches.length === 1) {
    onPointerMove(e);
  }
}

function onTouchEnd(e: TouchEvent) {
  touchDist = 0;
  if (e.touches.length === 0) {
    onPointerUp();
  }
}

// ─── Image loading ──────────────────────────────────────────────

function loadImage(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }
  if (file.size > 30 * 1024 * 1024) {
    alert('File is too large. Please upload an image under 30 MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      imageState = {
        img,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      };
      origDimsDisplay.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
      dropZone.style.display = 'none';
      workspace.style.display = 'block';
      // Measure viewport now that it's visible
      const rect = viewportEl.getBoundingClientRect();
      viewport.containerW = Math.round(rect.width);
      viewport.containerH = Math.round(rect.height);
      viewport.zoom = computeFitZoom();
      const cp = centerPan();
      viewport.panX = cp.panX;
      viewport.panY = cp.panY;
      initCrop();
      enableControls();
      updateZoomDisplay();
      render();
    };
    img.src = e.target!.result as string;
  };
  reader.readAsDataURL(file);
}

function enableControls() {
  zoomInBtn.disabled = false;
  zoomOutBtn.disabled = false;
  zoomSlider.disabled = false;
  exportBtn.disabled = false;
}

// ─── Format switch ──────────────────────────────────────────────

function updateFormatUI() {
  const isLossy = exportFormat === 'jpeg';
  qualitySection.style.display = isLossy ? 'flex' : 'none';
  bgPickerSection.style.display = isLossy ? 'flex' : 'none';
  const hints: Record<FormatId, string> = {
    jpeg: 'Lossy · Smallest file · Best for photos',
    png: 'Lossless · Supports transparency · Larger file',
    webp: 'Lossy/Alpha · Great quality · Modern browsers',
    avif: 'Lossy/Alpha · Best compression · Latest AVIF',
  };
  fmtHint.textContent = hints[exportFormat];
}

// ─── Export ─────────────────────────────────────────────────────

function doExport() {
  if (!imageState || !crop) return;
  const cw = Math.round(crop.w);
  const ch = Math.round(crop.h);
  const oc = document.createElement('canvas');
  oc.width = cw;
  oc.height = ch;
  const octx = oc.getContext('2d')!;
  if (exportFormat === 'jpeg') {
    octx.fillStyle = bgColor;
    octx.fillRect(0, 0, cw, ch);
  }
  octx.drawImage(
    imageState.img,
    crop.x, crop.y, crop.w, crop.h,
    0, 0, cw, ch
  );
  const mime = `image/${exportFormat}`;
  const quality = parseFloat(qualitySlider.value) / 100;
  try {
    oc.toBlob((blob) => {
      if (!blob) { alert('Export failed.'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `cropped-image.${exportFormat}`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      exportMenu.classList.remove('show');
    }, mime, quality);
  } catch {
    alert('Export failed. The image may be too large.');
  }
}

// ─── Controls reset ─────────────────────────────────────────────

function resetTool() {
  imageState = null;
  crop = null;
  drag = null;
  dropZone.style.display = 'flex';
  workspace.style.display = 'none';
  canvas.width = 0;
  canvas.height = 0;
  ctx.clearRect(0, 0, 0, 0);
  cropOverlay.style.display = 'none';
  origDimsDisplay.textContent = '-- × --';
  cropDimsDisplay.textContent = '-- × --';
  exportDimsDisplay.textContent = '-- × --';
  fileSizeDisplay.textContent = '--';
  zoomPct.textContent = '--';
  zoomSlider.value = '100';
  zoomInBtn.disabled = true;
  zoomOutBtn.disabled = true;
  zoomSlider.disabled = true;
  exportBtn.disabled = true;
  viewport.zoom = 1;
  viewport.panX = 0;
  viewport.panY = 0;
}

// ─── Init ───────────────────────────────────────────────────────

function init() {
  dropZone = document.getElementById('cropperDropZone')!;
  fileInput = document.getElementById('cropperFileInput') as HTMLInputElement;
  selectBtn = document.getElementById('cropperSelectBtn') as HTMLElement;
  workspace = document.getElementById('cropperWorkspace')!;
  viewportEl = document.getElementById('cropperViewport')!;
  canvas = document.getElementById('cropperCanvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d')!;
  cropOverlay = document.getElementById('cropOverlay')!;
  cropRegion = document.getElementById('cropRegion')!;
  cropGrid = document.getElementById('cropGrid')!;
  zoomDisplay = document.getElementById('cropZoomDisplay')!;
  zoomPct = document.getElementById('cropZoomPct')!;
  zoomSlider = document.getElementById('cropZoomSlider') as HTMLInputElement;
  zoomInBtn = document.getElementById('cropZoomIn') as HTMLButtonElement;
  zoomOutBtn = document.getElementById('cropZoomOut') as HTMLButtonElement;
  origDimsDisplay = document.getElementById('cropOrigDims')!;
  cropDimsDisplay = document.getElementById('cropCropDims')!;
  exportDimsDisplay = document.getElementById('cropExportDims')!;
  fileSizeDisplay = document.getElementById('cropFileSize')!;
  uploadNewBtn = document.getElementById('cropUploadNew') as HTMLButtonElement;
  exportBtn = document.getElementById('cropExportBtn') as HTMLButtonElement;
  exportMenu = document.getElementById('cropExportMenu')!;
  confirmExportBtn = document.getElementById('cropConfirmExport') as HTMLButtonElement;
  qualitySlider = document.getElementById('cropQuality') as HTMLInputElement;
  qualityVal = document.getElementById('cropQualityVal')!;
  fmtHint = document.getElementById('cropFmtHint')!;
  qualitySection = document.getElementById('cropQualitySection')!;
  bgPickerSection = document.getElementById('cropBgPicker')!;
  bgColorInput = document.getElementById('cropBgColor') as HTMLInputElement;
  formatTabBtns = document.querySelectorAll('#cropFormatTabs .format-tab');
  ratioBtns = document.querySelectorAll('#cropRatioBtns .ratio-btn');
  bottomSheet = document.getElementById('bottomSheet')!;
  closeSheetBtn = document.getElementById('closeSheetBtn') as HTMLButtonElement;
  sheetTitle = document.getElementById('sheetTitle')!;
  sheetContent = document.getElementById('sheetContent')!;

  viewport = {
    containerW: 0,
    containerH: 0,
    zoom: 1,
    panX: 0,
    panY: 0,
    minZoom: 0.1,
    maxZoom: 20,
  };

  // Observe container size — always track dimensions
  const ro = new ResizeObserver(() => {
    const rect = viewportEl.getBoundingClientRect();
    viewport.containerW = Math.round(rect.width);
    viewport.containerH = Math.round(rect.height);
    if (imageState) {
      viewport.minZoom = computeFitZoom() * 0.5;
      canvas.width = viewport.containerW;
      canvas.height = viewport.containerH;
      render();
    }
  });
  ro.observe(viewportEl);

  // Upload — label element handles this natively via for='cropperFileInput'
  fileInput.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) loadImage(file);
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer?.files[0];
    if (file) loadImage(file);
  });

  // Pointer events on viewport
  viewportEl.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  viewportEl.addEventListener('wheel', onWheel, { passive: false });
  viewportEl.addEventListener('touchstart', onTouchStart, { passive: true });
  viewportEl.addEventListener('touchmove', onTouchMove, { passive: false });
  viewportEl.addEventListener('touchend', onTouchEnd);
  viewportEl.addEventListener('touchcancel', onTouchEnd);

  // Zoom controls
  zoomInBtn.addEventListener('click', zoomIn);
  zoomOutBtn.addEventListener('click', zoomOut);
  zoomSlider.addEventListener('input', () => {
    const pct = parseFloat(zoomSlider.value);
    setZoom(pct / 100, viewport.containerW / 2, viewport.containerH / 2);
  });

  // Aspect ratio presets
  ratioBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      ratioBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const r = btn.dataset.ratio;
      if (!crop || !imageState) return;
      if (r === 'free') {
        crop.ratio = null;
        const iw = imageState.naturalWidth;
        const ih = imageState.naturalHeight;
        crop.x = 0; crop.y = 0; crop.w = iw; crop.h = ih;
        render();
        return;
      }
      const parts = r!.split(':');
      crop.ratio = parseFloat(parts[0]) / parseFloat(parts[1]);
      applyRatioIfSet();
      clampCrop();
      render();
    });
  });

  // Format tabs
  formatTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      formatTabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      exportFormat = btn.dataset.fmt as FormatId;
      updateFormatUI();
      estimateFileSize();
    });
  });

  qualitySlider.addEventListener('input', () => {
    qualityVal.textContent = `${qualitySlider.value}%`;
    estimateFileSize();
  });

  bgColorInput.addEventListener('input', () => {
    bgColor = bgColorInput.value;
  });

  // Export
  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!exportBtn.contains(e.target as Node) && !exportMenu.contains(e.target as Node)) {
      exportMenu.classList.remove('show');
    }
  });
  confirmExportBtn.addEventListener('click', doExport);

  // Upload new
  uploadNewBtn.addEventListener('click', resetTool);

  // Bottom sheet for content pages
  const sheetTriggers = document.querySelectorAll('.sheet-trigger');
  sheetTriggers.forEach((trigger) => {
    trigger.addEventListener('click', async (e) => {
      e.preventDefault();
      const anchor = trigger as HTMLAnchorElement;
      const url = anchor.href;
      const title = anchor.innerText;
      sheetTitle.innerText = title;
      sheetContent.innerHTML = '<p style="text-align:center;padding:2rem;">Loading...</p>';
      bottomSheet.classList.add('open');
      let fetchUrl = url;
      try {
        const path = new URL(url).pathname;
        if (!path.endsWith('.html') && !path.includes('.') && !path.endsWith('/')) {
          fetchUrl += '.html';
        }
      } catch {
        if (!fetchUrl.endsWith('.html') && !fetchUrl.includes('.') && !fetchUrl.endsWith('/')) {
          fetchUrl += '.html';
        }
      }
      try {
        const resp = await fetch(fetchUrl);
        const html = await resp.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const cs = doc.querySelector('.content-section');
        if (cs) {
          const h1 = cs.querySelector('h1');
          if (h1) h1.style.display = 'none';
          cs.querySelectorAll('*').forEach((el) => {
            ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur'].forEach((a) => el.removeAttribute(a));
          });
          cs.querySelectorAll('script').forEach((s) => s.remove());
          sheetContent.innerHTML = '';
          sheetContent.appendChild(cs);
        } else {
          sheetContent.innerHTML = '<p style="text-align:center;">Content not found.</p>';
        }
      } catch {
        sheetContent.innerHTML = '<p style="text-align:center;">Error loading content.</p>';
      }
    });
  });
  closeSheetBtn.addEventListener('click', () => bottomSheet.classList.remove('open'));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bottomSheet.classList.contains('open')) {
      bottomSheet.classList.remove('open');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
