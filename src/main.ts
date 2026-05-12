import './style.css'

// ── Theme Restore (runs on every page, including sub-pages) ───────────────
const _savedTheme = localStorage.getItem('squarepic-theme');
if (_savedTheme) {
  try {
    const { accent, glow } = JSON.parse(_savedTheme);
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-glow', glow);
  } catch { /* ignore invalid data */ }
}

// Guard: Only run editor logic if the editor DOM exists (sub-pages don't have it)
if (!document.getElementById('mainCanvas')) {
  throw new Error('__SUBPAGE__');
}

// Elements
const dropZone = document.getElementById('dropZone') as HTMLElement;
const uploadBtn = document.getElementById('uploadBtn') as HTMLButtonElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement;
const ctxOrNull = mainCanvas.getContext('2d');
if (!ctxOrNull) throw new Error('Canvas 2D context is unavailable in this browser.');
const ctx = ctxOrNull;

const modeButtons = document.querySelectorAll('.mode-btn');
const blurSlider = document.getElementById('blurSlider') as HTMLInputElement;
const blurValText = document.getElementById('blurVal') as HTMLElement;
const paddingSlider = document.getElementById('paddingSlider') as HTMLInputElement;
const paddingValText = document.getElementById('paddingVal') as HTMLElement;
const scaleSlider = document.getElementById('scaleSlider') as HTMLInputElement;
const scaleValText = document.getElementById('scaleVal') as HTMLElement;
const radiusSlider = document.getElementById('radiusSlider') as HTMLInputElement;
const radiusValText = document.getElementById('radiusVal') as HTMLElement;
const blurControls = document.getElementById('blurControls') as HTMLElement;
const solidControls = document.getElementById('solidControls') as HTMLElement;
const colorSwatches = document.querySelectorAll('.color-swatch');
const customColor = document.getElementById('customColor') as HTMLInputElement;
const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;
const uploadNewBtn = document.getElementById('uploadNewBtn') as HTMLButtonElement;
const masterResetBtn = document.getElementById('masterResetBtn') as HTMLButtonElement;
const individualResets = document.querySelectorAll('.action-reset-btn');

// State
let currentImage: HTMLImageElement | null = null;
let mode: 'blur' | 'solid' | 'crop' = 'blur';
let blurAmount = 20;
let paddingPercent = 10;
let imageScale = 100;
let cornerRadius = 0;
let backgroundColor = '#F0F5FA';

// Initialize
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFile);
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer?.files[0];
  if (file) {
    processFile(file);
  } else {
    alert('No image detected. Please drop an image file.');
  }
});

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) processFile(file);
}

const MAX_FILE_SIZE_MB = 20;

function processFile(file: File) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Invalid file type. Please upload an image (JPEG, PNG, WebP, etc.).');
    return;
  }
  // Validate file size
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    alert(`File is too large. Please upload an image under ${MAX_FILE_SIZE_MB} MB.`);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      dropZone.style.display = 'none';
      mainCanvas.style.display = 'block';
      render();
    };
    img.onerror = () => {
      alert('Could not load the image. The file may be corrupted.');
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

// Controls
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.getAttribute('data-mode') as 'blur' | 'solid' | 'crop';
    
    blurControls.style.display = mode === 'blur' ? 'block' : 'none';
    solidControls.style.display = mode === 'solid' ? 'block' : 'none';
    
    render();
  });
});

blurSlider.addEventListener('input', () => {
  blurAmount = parseInt(blurSlider.value);
  blurValText.innerText = `${blurAmount}px`;
  render();
});

paddingSlider.addEventListener('input', () => {
  paddingPercent = parseInt(paddingSlider.value);
  paddingValText.innerText = `${paddingPercent}%`;
  render();
});

scaleSlider.addEventListener('input', () => {
  imageScale = parseInt(scaleSlider.value);
  scaleValText.innerText = `${imageScale}%`;
  render();
});

radiusSlider.addEventListener('input', () => {
  cornerRadius = parseInt(radiusSlider.value);
  radiusValText.innerText = `${cornerRadius}px`;
  render();
});

colorSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    colorSwatches.forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    backgroundColor = swatch.getAttribute('data-color')!;
    customColor.value = backgroundColor;
    render();
  });
});

customColor.addEventListener('input', () => {
  backgroundColor = customColor.value;
  colorSwatches.forEach(s => s.classList.remove('active'));
  render();
});
uploadNewBtn.addEventListener('click', () => {
  currentImage = null;
  dropZone.style.display = 'flex';
  mainCanvas.style.display = 'none';
  fileInput.value = '';
});

// Individual Resets
individualResets.forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.getAttribute('data-reset');
    if (type === 'blur') {
      blurAmount = 20;
      blurSlider.value = '20';
      blurValText.innerText = '20px';
    } else if (type === 'padding') {
      paddingPercent = 10;
      paddingSlider.value = '10';
      paddingValText.innerText = '10%';
    } else if (type === 'scale') {
      imageScale = 100;
      scaleSlider.value = '100';
      scaleValText.innerText = '100%';
    } else if (type === 'radius') {
      cornerRadius = 0;
      radiusSlider.value = '0';
      radiusValText.innerText = '0px';
    }
    render();
  });
});

// Master Reset
masterResetBtn.addEventListener('click', () => {
  // Reset values
  blurAmount = 20;
  paddingPercent = 10;
  imageScale = 100;
  cornerRadius = 0;
  mode = 'blur';
  backgroundColor = '#F0F5FA';

  // Update UI elements
  blurSlider.value = '20';
  blurValText.innerText = '20px';
  paddingSlider.value = '10';
  paddingValText.innerText = '10%';
  scaleSlider.value = '100';
  scaleValText.innerText = '100%';
  radiusSlider.value = '0';
  radiusValText.innerText = '0px';

  modeButtons.forEach(b => {
    b.classList.remove('active');
    if (b.getAttribute('data-mode') === 'blur') b.classList.add('active');
  });

  blurControls.style.display = 'block';
  solidControls.style.display = 'none';

  colorSwatches.forEach(s => {
    s.classList.remove('active');
    if (s.getAttribute('data-color') === '#F0F5FA') s.classList.add('active');
  });
  customColor.value = '#F0F5FA';

  render();
});


const exportMenu    = document.getElementById('exportMenu')      as HTMLElement;
const confirmExportBtn = document.getElementById('confirmExportBtn') as HTMLButtonElement;
const exportQuality = document.getElementById('exportQuality')   as HTMLInputElement;
const exportQualityVal = document.getElementById('exportQualityVal') as HTMLSpanElement;
const exportSizeEst = document.getElementById('exportSizeEst')   as HTMLElement;
const exportDimensions = document.getElementById('exportDimensions') as HTMLElement;
const qualitySection = document.getElementById('qualitySection') as HTMLElement;
const fmtHint       = document.getElementById('fmtHint')         as HTMLElement;
const formatTabBtns = document.querySelectorAll<HTMLButtonElement>('.format-tab');

// Format state (replaces the old <select>)
let selectedFormat: 'png' | 'jpeg' | 'webp' = 'jpeg';

const FORMAT_HINTS: Record<string, string> = {
  png:  'Lossless · Largest file · Best for graphics',
  jpeg: 'Lossy · Smallest size · Best for photos',
  webp: 'Lossy · Great quality · Modern browsers',
};

// Format tab clicks
formatTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    formatTabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedFormat = btn.getAttribute('data-fmt') as 'png' | 'jpeg' | 'webp';

    // PNG is lossless - hide quality slider
    qualitySection.style.display = selectedFormat === 'png' ? 'none' : 'flex';
    fmtHint.textContent = FORMAT_HINTS[selectedFormat];

    updateEstimatedSize();
  });
});

// Update slider filled track
function updateSliderFill() {
  const min = parseInt(exportQuality.min);
  const max = parseInt(exportQuality.max);
  const val = parseInt(exportQuality.value);
  const pct = ((val - min) / (max - min)) * 100;
  exportQuality.style.background =
    `linear-gradient(to right, var(--accent) ${pct}%, rgba(255,255,255,0.12) ${pct}%)`;
}

// Size estimate with color coding
let sizeDebounceTimer: ReturnType<typeof setTimeout>;
function updateEstimatedSize() {
  if (!currentImage) {
    exportSizeEst.textContent = '--';
    exportSizeEst.className = 'ep-info-val ep-size-val';
    return;
  }

  // Show dimensions immediately (no async needed)
  exportDimensions.textContent = `${mainCanvas.width} × ${mainCanvas.height} px`;

  // Debounce the toBlob call so fast slider drags don't stack
  clearTimeout(sizeDebounceTimer);
  exportSizeEst.textContent = '…';
  sizeDebounceTimer = setTimeout(() => {
    const format  = selectedFormat;
    const quality = parseFloat(exportQuality.value) / 100;
    const mime    = `image/${format}`;

    mainCanvas.toBlob((blob) => {
      if (!blob) return;
      const kb  = blob.size / 1024;
      let text: string;
      let sizeClass: string;

      if (kb > 1024) {
        const mb = kb / 1024;
        text = `${mb.toFixed(2)} MB`;
        sizeClass = mb > 3 ? 'size-large' : 'size-medium';
      } else {
        text = `${kb.toFixed(1)} KB`;
        sizeClass = kb > 500 ? 'size-medium' : 'size-small';
      }

      exportSizeEst.textContent = text;
      exportSizeEst.className = `ep-info-val ep-size-val ${sizeClass}`;
    }, mime, quality);
  }, 120);
}

exportQuality.addEventListener('input', () => {
  exportQualityVal.textContent = `${exportQuality.value}%`;
  updateSliderFill();
  updateEstimatedSize();
});

// Initialise slider fill on load
updateSliderFill();

downloadBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  exportMenu.classList.toggle('show');
  if (exportMenu.classList.contains('show')) {
    updateEstimatedSize();
  }
});

document.addEventListener('click', (e) => {
  if (!downloadBtn.contains(e.target as Node) && !exportMenu.contains(e.target as Node)) {
    exportMenu.classList.remove('show');
  }
});

confirmExportBtn.addEventListener('click', () => {
  if (!currentImage) return;

  // Brief button feedback
  confirmExportBtn.textContent = 'Saving…';
  confirmExportBtn.style.opacity = '0.8';

  setTimeout(() => {
    const format  = selectedFormat;
    const quality = parseFloat(exportQuality.value) / 100;
    const mime    = `image/${format}`;

    const link = document.createElement('a');
    link.download = `squarepic-photo.${format}`;
    link.href = mainCanvas.toDataURL(mime, quality);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    exportMenu.classList.remove('show');

    // Restore button text
    confirmExportBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Save Image`;
    confirmExportBtn.style.opacity = '1';
  }, 80);
});

// Rendering Logic
function render() {
  if (!currentImage) return;

  const size = Math.max(currentImage.width, currentImage.height);
  mainCanvas.width = size;
  mainCanvas.height = size;

  // Apply rounded corners - both preview (CSS) and export (clip path) use the same formula:
  // cornerRadius 0-100 maps to 0-50% of canvas size (50% = perfect circle)
  const radiusPx = (cornerRadius / 100) * (size / 2);
  mainCanvas.style.borderRadius = cornerRadius > 0 ? `${(cornerRadius / 100) * 50}%` : '0';

  ctx.clearRect(0, 0, size, size);

  // Clip the entire canvas to a rounded rectangle (for the exported image)
  if (radiusPx > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(radiusPx, 0);
    ctx.lineTo(size - radiusPx, 0);
    ctx.quadraticCurveTo(size, 0, size, radiusPx);
    ctx.lineTo(size, size - radiusPx);
    ctx.quadraticCurveTo(size, size, size - radiusPx, size);
    ctx.lineTo(radiusPx, size);
    ctx.quadraticCurveTo(0, size, 0, size - radiusPx);
    ctx.lineTo(0, radiusPx);
    ctx.quadraticCurveTo(0, 0, radiusPx, 0);
    ctx.closePath();
    ctx.clip();
  }

  if (mode === 'blur') {
    // Background Blur
    ctx.filter = `blur(${blurAmount}px)`;
    const bgScale = size / Math.min(currentImage.width, currentImage.height);
    const bgW = currentImage.width * bgScale;
    const bgH = currentImage.height * bgScale;
    ctx.drawImage(currentImage, (size - bgW) / 2, (size - bgH) / 2, bgW, bgH);
    ctx.filter = 'none';
    
    // Overlay to darken
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, size, size);
  } else if (mode === 'solid') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
  } else if (mode === 'crop') {
    // Center Crop
    const sourceSize = Math.min(currentImage.width, currentImage.height);
    const sx = (currentImage.width - sourceSize) / 2;
    const sy = (currentImage.height - sourceSize) / 2;
    
    const cropScale = (imageScale / 100);
    const drawSize = size * cropScale;
    const offset = (size - drawSize) / 2;

    ctx.drawImage(currentImage, sx, sy, sourceSize, sourceSize, offset, offset, drawSize, drawSize);
    if (radiusPx > 0) ctx.restore();
    return;
  }

  // Draw Main Image (no rounding on image itself)
  const iw = currentImage.width;
  const ih = currentImage.height;
  const aspect = iw / ih;

  let dw, dh;
  if (aspect > 1) {
    dw = size;
    dh = size / aspect;
  } else {
    dh = size;
    dw = size * aspect;
  }

  // Apply padding
  const paddingPx = (size * paddingPercent) / 100;
  const paddedSize = size - (paddingPx * 2);
  const paddingScale = paddedSize / size;
  
  dw *= paddingScale;
  dh *= paddingScale;

  // Apply user scale
  const userScaleFactor = imageScale / 100;
  dw *= userScaleFactor;
  dh *= userScaleFactor;

  // Center it
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;

  ctx.drawImage(currentImage, 0, 0, iw, ih, dx, dy, dw, dh);

  if (radiusPx > 0) ctx.restore();
}

// Bottom Sheet Logic
const bottomSheet = document.getElementById('bottomSheet') as HTMLElement;
const closeSheetBtn = document.getElementById('closeSheetBtn') as HTMLButtonElement;
const sheetTitle = document.getElementById('sheetTitle') as HTMLElement;
const sheetContent = document.getElementById('sheetContent') as HTMLElement;
const sheetTriggers = document.querySelectorAll('.sheet-trigger');

// Close sheet on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && bottomSheet.classList.contains('open')) {
    bottomSheet.classList.remove('open');
  }
});

sheetTriggers.forEach(trigger => {
  trigger.addEventListener('click', async (e) => {
    e.preventDefault();
    const anchor = trigger as HTMLAnchorElement;
    const url = anchor.href;
    const title = anchor.innerText;
    
    sheetTitle.innerText = title;
    sheetContent.innerHTML = '<p style="text-align:center; padding: 2rem;">Loading...</p>';
    bottomSheet.classList.add('open');

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const contentSection = doc.querySelector('.content-section');
      if (contentSection) {
        // Hide duplicate title inside the content since we show it in the header
        const h1 = contentSection.querySelector('h1');
        if (h1) h1.style.display = 'none';

        // Sanitize: strip inline event handlers from all fetched nodes
        contentSection.querySelectorAll('*').forEach(el => {
          ['onclick','onerror','onload','onmouseover','onfocus','onblur'].forEach(attr => {
            el.removeAttribute(attr);
          });
        });
        // Remove any <script> tags that may have come from the fetched page
        contentSection.querySelectorAll('script').forEach(s => s.remove());

        sheetContent.innerHTML = '';
        sheetContent.appendChild(contentSection);
      } else {
        sheetContent.innerHTML = '<p style="text-align:center;">Content not found.</p>';
      }
    } catch (err) {
      sheetContent.innerHTML = '<p style="text-align:center;">Error loading content.</p>';
    }
  });
});

closeSheetBtn.addEventListener('click', () => {
  bottomSheet.classList.remove('open');
});

// ── Theme Switcher ────────────────────────────────────────────────────────
const themeDots = document.querySelectorAll<HTMLButtonElement>('.theme-dot');

function applyTheme(accent: string, glow: string, saveToDisk = true) {
  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--accent-glow', glow);
  // Re-paint the quality slider fill with the new accent
  updateSliderFill();
  if (saveToDisk) {
    try { localStorage.setItem('squarepic-theme', JSON.stringify({ accent, glow })); } catch {}
  }
}

themeDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const accent = dot.getAttribute('data-accent')!;
    const glow   = dot.getAttribute('data-glow')!;

    themeDots.forEach(d => d.classList.remove('active', 'switching'));
    dot.classList.add('active', 'switching');
    dot.addEventListener('animationend', () => dot.classList.remove('switching'), { once: true });

    applyTheme(accent, glow);
  });
});

// Mark the correct dot as active on load (based on saved theme)
if (_savedTheme) {
  try {
    const { accent } = JSON.parse(_savedTheme);
    themeDots.forEach(d => {
      d.classList.toggle('active', d.getAttribute('data-accent') === accent);
    });
  } catch {}
}

// Landing Page CTA smooth scroll
['heroScrollBtn', 'finalScrollBtn'].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const toolSection = document.getElementById('tool-section');
      if (toolSection) {
        toolSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});

// Also for the header CTA
document.querySelector('.header-link-cta')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('tool-section')?.scrollIntoView({ behavior: 'smooth' });
});
