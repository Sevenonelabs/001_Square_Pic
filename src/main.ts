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

// ── Shared Layout Templates (single source of truth) ──────────────────────

function getPageTitle(): string {
  const explicit = document.body.getAttribute('data-page-title');
  if (explicit) return explicit;
  const h1 = document.querySelector('h1');
  if (h1) return h1.textContent || 'SquarePic Square Image Tool';
  return 'Make Any Image <span class="lp-accent">Square Online for Free</span>';
}

function navbarHTML(pageTitle: string): string {
  return `
    <div class="header-left">
      <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle Tools Navigation">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <a href="/" class="logo" style="text-decoration:none;">SquarePic Square Image Tool</a>
    </div>
    <div class="header-center-title">${pageTitle}</div>
    <div class="header-right">
      <div class="header-nav">
        <div class="nav-trust-badges">
          <span class="badge-item"><span class="badge-check">✓</span> 100% Free</span>
          <span class="badge-item"><span class="badge-check">✓</span> No Watermarks</span>
          <span class="badge-item"><span class="badge-check">✓</span> Privacy-First</span>
        </div>
      </div>
      <div class="theme-picker" id="themePicker" aria-label="Choose accent color">
        <span class="theme-label">Theme</span>
        <button class="theme-dot" data-accent="#84cc16" data-glow="rgba(132,204,22,0.3)" style="background:#84cc16" title="Lime" aria-label="Lime theme"></button>
        <button class="theme-dot" data-accent="#10b981" data-glow="rgba(16,185,129,0.3)" style="background:#10b981" title="Emerald" aria-label="Emerald theme"></button>
        <button class="theme-dot active" data-accent="#06b6d4" data-glow="rgba(6,182,212,0.3)" style="background:#06b6d4" title="Cyan" aria-label="Cyan theme"></button>
        <button class="theme-dot" data-accent="#8b5cf6" data-glow="rgba(139,92,246,0.3)" style="background:#8b5cf6" title="Violet" aria-label="Violet theme"></button>
        <button class="theme-dot" data-accent="#f43f5e" data-glow="rgba(244,63,94,0.3)" style="background:#f43f5e" title="Rose" aria-label="Rose theme"></button>
        <button class="theme-dot" data-accent="#f59e0b" data-glow="rgba(245,158,11,0.3)" style="background:#f59e0b" title="Amber" aria-label="Amber theme"></button>
      </div>
    </div>
  `;
}

function sidebarHTML(): string {
  return `
    <div class="sidebar-trust-badges" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem;">
      <span class="badge-item" style="font-size: 0.72rem; padding: 0.35rem 0.6rem;"><span class="badge-check">✓</span> Free</span>
      <span class="badge-item" style="font-size: 0.72rem; padding: 0.35rem 0.6rem;"><span class="badge-check">✓</span> No Watermarks</span>
      <span class="badge-item" style="font-size: 0.72rem; padding: 0.35rem 0.6rem; white-space: normal;"><span class="badge-check">✓</span> Privacy-First Local Processing</span>
    </div>
    <div class="control-card">
      <h3>Core Tools</h3>
      <nav class="sidebar-nav">
        <a href="index" class="sidebar-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
          Free Square Image Tool
        </a>
        <a href="free-image-converter" class="sidebar-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          Free Image Converter
        </a>
        <a href="free-image-compressor" class="sidebar-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"></path><path d="M20 10h-6V4"></path><path d="M14 10l7-7"></path><path d="M10 14l-7 7"></path></svg>
          Free Image Compressor
        </a>
        <a href="free-image-resizer" class="sidebar-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          Free Image Resizer
        </a>
        <a href="free-photo-cropper" class="sidebar-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path></svg>
          Free Photo Cropper
        </a>
      </nav>
    </div>
  `;
}

function seoLinksBarHTML(): string {
  return `
    <div class="seo-category">
      <span class="seo-category-title">Core Tools</span>
      <div class="seo-category-links">
        <a href="index">Square Pic</a>
        <a href="free-square-image-tool">Square Image Tool</a>
        <a href="free-image-resizer">Image Resizer</a>
        <a href="free-photo-cropper">Photo Cropper</a>
        <a href="free-image-compressor">Image Compressor</a>
        <a href="free-resize-image-without-losing-quality">High Quality Resizer</a>
        <a href="free-online-photo-resizer">Free Photo Resizer</a>
        <a href="free-image-converter">Free Image Converter</a>
      </div>
    </div>
    <div class="seo-category">
      <span class="seo-category-title">Social Media Resizers</span>
      <div class="seo-category-links">
        <a href="free-instagram-photo-resizer">Instagram Resizer</a>
        <a href="free-instagram-story-resizer">IG Story Resizer</a>
        <a href="free-instagram-square-photo">IG Square Photo</a>
        <a href="free-instagram-reels-cover-maker">IG Reels Cover</a>
        <a href="free-facebook-post-image-resizer">FB Post Resizer</a>
        <a href="free-facebook-cover-photo-resizer">FB Cover Resizer</a>
        <a href="free-twitter-header-resizer">X Header Resizer</a>
        <a href="free-linkedin-banner-resizer">LinkedIn Banner Resizer</a>
        <a href="free-website-banner-resizer">Website Banner Resizer</a>
      </div>
    </div>
    <div class="seo-category">
      <span class="seo-category-title">Profile Picture Makers</span>
      <div class="seo-category-links">
        <a href="free-profile-picture-maker">Profile Pic Maker</a>
        <a href="free-facebook-profile-picture-maker">FB Profile Pic</a>
        <a href="free-tiktok-profile-picture-maker">TikTok Profile Pic</a>
        <a href="free-youtube-profile-picture-maker">YT Profile Pic</a>
        <a href="free-twitch-profile-picture-maker">Twitch Profile Pic</a>
        <a href="free-linkedin-profile-picture-maker">LinkedIn Profile Pic</a>
        <a href="free-whatsapp-dp-maker">WhatsApp DP Maker</a>
        <a href="free-passport-photo-maker">Passport Photo Maker</a>
      </div>
    </div>
    <div class="seo-category">
      <span class="seo-category-title">Creator Utilities</span>
      <div class="seo-category-links">
        <a href="free-youtube-thumbnail-resizer">YouTube Resizer</a>
        <a href="free-youtube-channel-art-resizer">YouTube Channel Art</a>
        <a href="free-twitch-banner-maker">Twitch Banner</a>
      </div>
    </div>
    <div class="seo-category">
      <span class="seo-category-title">Format Converters</span>
      <div class="seo-category-links">
        <a href="free-image-optimizer">Image Optimizer</a>
        <a href="free-image-converter">Free Image Converter</a>
        <a href="free-image-compressor">Image Compressor</a>
        <a href="free-jpg-to-png">JPG to PNG</a>
        <a href="free-png-to-jpg">PNG to JPG</a>
        <a href="free-webp-to-png">WebP to PNG</a>
      </div>
    </div>
  `;
}

function footerHTML(): string {
  return `
    <div class="footer-content">
      <div class="footer-brand">
        <span class="footer-logo">SquarePic Square Image Tool</span>
        <p class="footer-tagline">SquarePic Square Image Tool is a free online image editor and square photo maker for creating perfect posts without cropping. Fast, private, and watermark-free.</p>
      </div>
      <nav class="footer-nav">
        <a href="about" class="sheet-trigger">About</a>
        <a href="support" class="sheet-trigger">Support</a>
        <a href="faq" class="sheet-trigger">FAQ</a>
        <a href="privacy" class="sheet-trigger">Privacy</a>
        <a href="terms" class="sheet-trigger">Terms</a>
      </nav>
      <div class="footer-trust" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
        <div class="privacy-badge">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Secure Local Processing · No Cloud Uploads
        </div>
        <p style="font-size: 0.75rem; color: var(--text-muted); max-width: 300px; text-align: center; line-height: 1.4; margin: 0;">
          Your photos never leave your device. All editing is done securely in your web browser using HTML5 Canvas.
        </p>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; 2026 SquarePic Square Image Tool - Free online square image maker. Built for Creators with ❤️
    </div>
  `;
}

// ── Layout Injection ───────────────────────────────────────────────────────

function injectSharedLayout() {
  const pageTitle = getPageTitle();

  // 1. Navbar
  let header = document.querySelector('header');
  if (!header) {
    header = document.createElement('header');
    document.body.insertBefore(header, document.body.firstChild);
  }
  header.innerHTML = navbarHTML(pageTitle);

  // 2. Sidebar backdrop
  let backdrop = document.getElementById('sidebarBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    backdrop.id = 'sidebarBackdrop';
    header.parentNode?.insertBefore(backdrop, header.nextSibling);
  }

  // 3. Sidebar drawer
  let sidebar = document.querySelector('.sidebar-left');
  if (!sidebar) {
    sidebar = document.createElement('aside');
    sidebar.className = 'sidebar-left';
    backdrop.parentNode?.insertBefore(sidebar, backdrop.nextSibling);
  }
  sidebar.innerHTML = sidebarHTML();

  // 4. SEO links bar
  let seoLinksBar = document.querySelector('.seo-links-bar');
  if (!seoLinksBar) {
    seoLinksBar = document.createElement('section');
    seoLinksBar.className = 'seo-links-bar';
    document.body.appendChild(seoLinksBar);
  }
  seoLinksBar.innerHTML = seoLinksBarHTML();

  // 5. Footer
  let footer = document.querySelector('footer');
  if (!footer) {
    footer = document.createElement('footer');
    document.body.appendChild(footer);
  }
  footer.innerHTML = footerHTML();
}

function initGlobalLayout() {
  const isSubpage = !document.getElementById('mainCanvas');
  if (isSubpage) {
    document.body.classList.add('is-subpage');
  }

  injectSharedLayout();

  // Bind Sidebar Event Listeners (works on both editor and sub-pages!)
  const sidebarToggle = document.getElementById('sidebarToggle') as HTMLButtonElement;
  const sidebarLeft = document.querySelector('.sidebar-left') as HTMLElement;
  const sidebarBackdrop = document.getElementById('sidebarBackdrop') as HTMLElement;

  if (sidebarLeft && sidebarBackdrop) {
    function setSidebarState(open: boolean) {
      if (open) {
        sidebarLeft.classList.add('open');
        document.body.classList.add('sidebar-is-open');
        if (window.innerWidth <= 1150) sidebarBackdrop.classList.add('show');
      } else {
        sidebarLeft.classList.remove('open');
        document.body.classList.remove('sidebar-is-open');
        sidebarBackdrop.classList.remove('show');
      }
      try { localStorage.setItem('squarepic-sidebar-open', String(open)); } catch {}
    }

    // Restore saved sidebar state on page load
    const saved = localStorage.getItem('squarepic-sidebar-open');
    if (saved === 'true') {
      setSidebarState(true);
    }

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const isOpen = !sidebarLeft.classList.contains('open');
        setSidebarState(isOpen);
      });
    }

    sidebarBackdrop.addEventListener('click', () => {
      setSidebarState(false);
    });

    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Close sidebar on mobile after navigation; keep open on desktop
        if (window.innerWidth <= 1150) {
          setSidebarState(false);
        }
      });
    });
  }

  // 5. Dynamic Link Highlighting
  const currentPath = window.location.pathname.replace(/\/+$/, '');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const cleanHref = href.replace('.html', '');
    if (href && (
      currentPath.endsWith('/' + cleanHref) ||
      currentPath.endsWith('/' + cleanHref + '/') ||
      (cleanHref === 'index' && (currentPath === '' || currentPath === '/'))
    )) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 6. Global Theme Switcher Binding
  const themeDots = document.querySelectorAll<HTMLButtonElement>('.theme-dot');
  
  function applyTheme(accent: string, glow: string, saveToDisk = true) {
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-glow', glow);
    
    // Guarded: only update slider fill if in editor
    const exportQuality = document.getElementById('exportQuality') as HTMLInputElement;
    if (exportQuality) {
      const min = parseInt(exportQuality.min);
      const max = parseInt(exportQuality.max);
      const val = parseInt(exportQuality.value);
      const pct = ((val - min) / (max - min)) * 100;
      exportQuality.style.background =
        `linear-gradient(to right, var(--accent) ${pct}%, rgba(255,255,255,0.12) ${pct}%)`;
    }
    
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
}

function initAll() {
  initGlobalLayout();
  if (document.getElementById('mainCanvas')) {
    initEditor();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

function initEditor() {

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
      mainCanvas.style.display = 'none';
      dropZone.style.display = 'flex';
      fileInput.value = '';
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
    selectSwatch(swatch as HTMLElement);
  });
  swatch.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectSwatch(swatch as HTMLElement);
    }
  });
});

function selectSwatch(swatch: HTMLElement) {
  colorSwatches.forEach(s => s.classList.remove('active'));
  swatch.classList.add('active');
  backgroundColor = swatch.getAttribute('data-color')!;
  customColor.value = backgroundColor;
  render();
}

customColor.addEventListener('input', () => {
  backgroundColor = customColor.value;
  colorSwatches.forEach(s => s.classList.remove('active'));
  render();
});
uploadNewBtn.addEventListener('click', () => {
  currentImage = null;
  dropZone.style.display = 'flex';
  mainCanvas.style.display = 'none';
  mainCanvas.style.borderRadius = '0'; // clear any leftover radius from previous image
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
    confirmExportBtn.innerHTML = '<span style="opacity:0.7;">Saving…</span>';
    confirmExportBtn.style.opacity = '0.8';

    setTimeout(() => {
      const format  = selectedFormat;
      const quality = parseFloat(exportQuality.value) / 100;
      const mime    = `image/${format}`;

      try {
        const dataUrl = mainCanvas.toDataURL(mime, quality);
        const link = document.createElement('a');
        link.download = `squarepic-photo.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Export failed:', err);
        alert('Could not export the image. The image may be too large or the format is not supported.');
      }

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
    ctx.arcTo(size, 0, size, radiusPx, radiusPx);
    ctx.arcTo(size, size, size - radiusPx, size, radiusPx);
    ctx.arcTo(0, size, 0, size - radiusPx, radiusPx);
    ctx.arcTo(0, 0, radiusPx, 0, radiusPx);
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

    // Build the fetch URL: append .html if it is a clean URL
    let fetchUrl = url;
    try {
      const path = new URL(url).pathname;
      if (!path.endsWith('.html') && !path.includes('.') && !path.endsWith('/')) {
        fetchUrl = fetchUrl + '.html';
      }
    } catch {
      if (!fetchUrl.endsWith('.html') && !fetchUrl.includes('.') && !fetchUrl.endsWith('/')) {
        fetchUrl = fetchUrl + '.html';
      }
    }

    try {
      const response = await fetch(fetchUrl);
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




}
