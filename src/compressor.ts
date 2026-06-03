import './style.css';
import JSZip from 'jszip';

interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  src: string; // Object URL for preview
  imgElement: HTMLImageElement | null;
  status: 'ready' | 'compressing' | 'done' | 'error';
  compressedBlob: Blob | null;
  newSize: number | null;
}

// State
let filesList: FileItem[] = [];
let activeTab: 'slider' | 'size' = 'slider';
let sliderQuality = 60; // 5 to 95
let targetFormat: 'jpeg' | 'webp' = 'jpeg';
let targetSizeValue = 100;
let targetSizeUnit: 'KB' | 'MB' = 'KB';

// DOM Elements
let compressorTool: HTMLElement | null = null;
let dropZone: HTMLElement | null = null;
let fileInput: HTMLInputElement | null = null;
let workspace: HTMLElement | null = null;
let filesCountBadge: HTMLElement | null = null;
let addMoreBtn: HTMLButtonElement | null = null;
let filesListContainer: HTMLElement | null = null;

// Tab buttons
let tabSliderBtn: HTMLButtonElement | null = null;
let tabSizeBtn: HTMLButtonElement | null = null;
let panelSlider: HTMLElement | null = null;
let panelSize: HTMLElement | null = null;

// Control inputs
let qualitySlider: HTMLInputElement | null = null;
let sliderValueLabel: HTMLElement | null = null;
let targetSizeInput: HTMLInputElement | null = null;
let targetSizeUnitSelect: HTMLSelectElement | null = null;

// Control buttons
let compressBtn: HTMLButtonElement | null = null;
let deleteAllBtn: HTMLButtonElement | null = null;
let selectImagesBottomBtn: HTMLButtonElement | null = null;
let clearAllBottomBtn: HTMLButtonElement | null = null;
let downloadZipBtn: HTMLButtonElement | null = null;

// Initialize on DOM load
function initCompressor() {
  initElements();
  setupEvents();
  updateWorkspaceUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCompressor);
} else {
  initCompressor();
}

// Initialize DOM Elements
function initElements() {
  compressorTool = document.getElementById('compressor-tool');
  dropZone = document.getElementById('compressor-drop-zone');
  fileInput = document.getElementById('compressor-file-input') as HTMLInputElement;
  workspace = document.getElementById('compressor-workspace');
  filesCountBadge = document.getElementById('files-count-badge');
  addMoreBtn = document.getElementById('add-more-btn') as HTMLButtonElement;
  filesListContainer = document.getElementById('compressor-files-list');

  tabSliderBtn = document.getElementById('tab-slider') as HTMLButtonElement;
  tabSizeBtn = document.getElementById('tab-size') as HTMLButtonElement;
  panelSlider = document.getElementById('panel-slider');
  panelSize = document.getElementById('panel-size');

  qualitySlider = document.getElementById('quality-slider') as HTMLInputElement;
  sliderValueLabel = document.getElementById('slider-value-label');
  targetSizeInput = document.getElementById('target-size-input') as HTMLInputElement;
  targetSizeUnitSelect = document.getElementById('target-size-unit') as HTMLSelectElement;

  compressBtn = document.getElementById('compress-btn') as HTMLButtonElement;
  deleteAllBtn = document.getElementById('delete-all-btn') as HTMLButtonElement;
  
  selectImagesBottomBtn = document.getElementById('select-images-bottom-btn') as HTMLButtonElement;
  clearAllBottomBtn = document.getElementById('clear-all-bottom-btn') as HTMLButtonElement;
  downloadZipBtn = document.getElementById('download-zip-btn') as HTMLButtonElement;
}

// Setup Event Listeners
function setupEvents() {
  // Drag & Drop
  const dragTarget = compressorTool || dropZone;
  if (dragTarget && fileInput) {
    dragTarget.addEventListener('dragover', (e) => {
      e.preventDefault();
      dragTarget.classList.add('drag-over');
    });

    dragTarget.addEventListener('dragleave', () => {
      dragTarget.classList.remove('drag-over');
    });

    dragTarget.addEventListener('drop', (e) => {
      e.preventDefault();
      dragTarget.classList.remove('drag-over');
      
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        processFiles(files);
      }
      fileInput!.value = ''; // Reset
    });
  }

  // Sidebar controls
  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => fileInput?.click());
  }

  if (selectImagesBottomBtn) {
    selectImagesBottomBtn.addEventListener('click', () => fileInput?.click());
  }

  // Tabs switching
  if (tabSliderBtn && tabSizeBtn && panelSlider && panelSize) {
    tabSliderBtn.addEventListener('click', () => {
      activeTab = 'slider';
      tabSliderBtn!.classList.add('active');
      tabSizeBtn!.classList.remove('active');
      panelSlider!.style.display = 'block';
      panelSize!.style.display = 'none';
      resetFilesStatus();
    });

    tabSizeBtn.addEventListener('click', () => {
      activeTab = 'size';
      tabSliderBtn!.classList.remove('active');
      tabSizeBtn!.classList.add('active');
      panelSlider!.style.display = 'none';
      panelSize!.style.display = 'flex';
      resetFilesStatus();
    });
  }

  // Quality slider change
  if (qualitySlider) {
    qualitySlider.addEventListener('input', () => {
      sliderQuality = parseInt(qualitySlider!.value);
      if (sliderValueLabel) {
        sliderValueLabel.textContent = `${sliderQuality}%`;
      }
      resetFilesStatus();
    });
  }

  // Target format toggles (JPEG vs WebP)
  const formatToggles = document.querySelectorAll('.format-toggle-btn');
  formatToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      formatToggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      targetFormat = btn.getAttribute('data-fmt') as 'jpeg' | 'webp';
      resetFilesStatus();
    });
  });

  // Target size inputs
  if (targetSizeInput) {
    targetSizeInput.addEventListener('input', () => {
      targetSizeValue = parseFloat(targetSizeInput!.value) || 100;
      resetFilesStatus();
    });
  }

  if (targetSizeUnitSelect) {
    targetSizeUnitSelect.addEventListener('change', () => {
      targetSizeUnit = targetSizeUnitSelect!.value as 'KB' | 'MB';
      resetFilesStatus();
    });
  }

  // Preset pills
  const presets = document.querySelectorAll('.preset-pill');
  presets.forEach(pill => {
    pill.addEventListener('click', () => {
      presets.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      const val = parseInt(pill.getAttribute('data-val') || '100');
      const unit = pill.getAttribute('data-unit') as 'KB' | 'MB';
      
      targetSizeValue = val;
      targetSizeUnit = unit;
      
      if (targetSizeInput) targetSizeInput.value = val.toString();
      if (targetSizeUnitSelect) targetSizeUnitSelect.value = unit;
      
      resetFilesStatus();
    });
  });

  // Action Buttons
  if (compressBtn) {
    compressBtn.addEventListener('click', runAllCompression);
  }

  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', clearAllFiles);
  }

  if (clearAllBottomBtn) {
    clearAllBottomBtn.addEventListener('click', clearAllFiles);
  }

  if (downloadZipBtn) {
    downloadZipBtn.addEventListener('click', downloadZipArchive);
  }
}

// Reset files status back to ready if settings change
function resetFilesStatus() {
  filesList.forEach(item => {
    if (item.status === 'done' || item.status === 'error') {
      item.status = 'ready';
      item.compressedBlob = null;
      item.newSize = null;
    }
  });
  renderFilesList();
  updateBottomActions();
}

// Process added files
function processFiles(files: FileList) {
  let added = false;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith('image/')) {
      alert(`"${file.name}" is not a valid image file.`);
      continue;
    }
    if (file.size > 30 * 1024 * 1024) {
      alert(`"${file.name}" exceeds the 30MB limit.`);
      continue;
    }

    const id = Math.random().toString(36).substring(2, 11);
    const src = URL.createObjectURL(file);

    const fileItem: FileItem = {
      id,
      file,
      name: file.name,
      size: file.size,
      src,
      imgElement: null,
      status: 'ready',
      compressedBlob: null,
      newSize: null
    };

    const img = new Image();
    img.onload = () => {
      fileItem.imgElement = img;
    };
    img.src = src;

    filesList.push(fileItem);
    added = true;
  }

  if (added) {
    updateWorkspaceUI();
  }
}

// Format file size
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Truncate name
function truncateMiddle(str: string, maxLength = 16) {
  if (str.length <= maxLength) return str;
  const mid = Math.floor(maxLength / 2) - 1;
  return str.substring(0, mid) + '...' + str.substring(str.length - mid);
}

// Update primary workspace view
function updateWorkspaceUI() {
  if (workspace) workspace.style.display = 'block';
  if (dropZone) dropZone.style.display = 'none';

  if (filesCountBadge) {
    filesCountBadge.textContent = `${filesList.length} file${filesList.length !== 1 ? 's' : ''}`;
  }

  renderFilesList();
  updateBottomActions();
}

// Render files list grid
function renderFilesList() {
  const container = filesListContainer;
  if (!container) return;
  container.innerHTML = '';

  filesList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'compressor-file-card';
    card.dataset.id = item.id;

    // Compressed size string
    let newSizeText = '--';
    let reductionText = '';
    
    if (item.status === 'compressing') {
      newSizeText = 'Compressing...';
    } else if (item.status === 'done' && item.newSize !== null) {
      newSizeText = formatBytes(item.newSize);
      const saved = item.size > 0 ? ((item.size - item.newSize) / item.size) * 100 : 0;
      if (saved > 0) {
        reductionText = `<span style="color: #10b981; font-weight: 800; font-size: 0.72rem; margin-left: 0.4rem;">-${saved.toFixed(0)}%</span>`;
      }
    } else if (item.status === 'error') {
      newSizeText = '<span style="color: #f43f5e;">Failed</span>';
    }

    card.innerHTML = `
      <!-- Card Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.4rem;">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;" title="${item.name}">${truncateMiddle(item.name)}</span>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${formatBytes(item.size)}</span>
        <button class="remove-card-btn" data-id="${item.id}" style="background: rgba(0,0,0,0.6); border: none; color: var(--text-muted); border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition);">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Preview Image -->
      <div style="position: relative; width: 100%; aspect-ratio: 16/10; border-radius: var(--radius-md); overflow: hidden; background: #000; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
        <img src="${item.src}" style="width: 100%; height: 100%; object-fit: cover;" alt="SquarePic image compressor preview thumbnail">
        ${item.status === 'compressing' ? `
          <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;">
            <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width: 24px; height: 24px; color: var(--accent); animation: spin 1s linear infinite;"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style="opacity: 0.75;"></path></svg>
          </div>
        ` : ''}
      </div>

      <!-- File Size info -->
      <div style="font-size: 0.75rem; text-align: center; color: var(--text-muted); margin: 0.2rem 0;">
        New Size: <strong style="color: var(--text-main); font-weight: 700;">${newSizeText}</strong> ${reductionText}
      </div>

      <!-- Action Button -->
      <button class="download-card-btn btn-primary" data-id="${item.id}" ${item.status === 'done' ? '' : 'disabled'} style="width: 100%; padding: 0.4rem; font-size: 0.75rem; border-radius: var(--radius-sm); margin-top: auto; display: flex; align-items: center; justify-content: center; gap: 0.3rem; ${item.status === 'done' ? '' : 'opacity: 0.45; cursor: not-allowed; box-shadow: none;'}">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Download</span>
      </button>
    `;

    // Hook events
    const removeBtn = card.querySelector('.remove-card-btn') as HTMLElement;
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFileItem(item.id);
    });

    const downloadBtn = card.querySelector('.download-card-btn') as HTMLButtonElement;
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadSingleItem(item);
    });

    container.appendChild(card);
  });

  // Append "Add Images" card in grid
  const addCard = document.createElement('div');
  addCard.className = 'add-images-card';
  addCard.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--accent); opacity: 0.8;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
    <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">Add Images</div>
  `;
  addCard.addEventListener('click', () => fileInput?.click());
  container.appendChild(addCard);
}

// Remove file
function removeFileItem(id: string) {
  const index = filesList.findIndex(f => f.id === id);
  if (index !== -1) {
    URL.revokeObjectURL(filesList[index].src);
    filesList.splice(index, 1);
    updateWorkspaceUI();
  }
}

// Clear all files
function clearAllFiles() {
  filesList.forEach(f => URL.revokeObjectURL(f.src));
  filesList = [];
  updateWorkspaceUI();
}

// Update bottom action buttons state
function updateBottomActions() {
  if (!compressBtn || !deleteAllBtn || !clearAllBottomBtn || !downloadZipBtn) return;

  const anyDone = filesList.some(f => f.status === 'done');

  // Compress All Button
  if (filesList.length > 0) {
    compressBtn.disabled = false;
    compressBtn.style.opacity = '1';
    compressBtn.style.cursor = 'pointer';
    
    deleteAllBtn.disabled = false;
    deleteAllBtn.style.opacity = '1';
    deleteAllBtn.style.cursor = 'pointer';

    clearAllBottomBtn.disabled = false;
    clearAllBottomBtn.style.opacity = '1';
    clearAllBottomBtn.style.cursor = 'pointer';
  } else {
    compressBtn.disabled = true;
    compressBtn.style.opacity = '0.5';
    compressBtn.style.cursor = 'not-allowed';

    deleteAllBtn.disabled = true;
    deleteAllBtn.style.opacity = '0.5';
    deleteAllBtn.style.cursor = 'not-allowed';

    clearAllBottomBtn.disabled = true;
    clearAllBottomBtn.style.opacity = '0.5';
    clearAllBottomBtn.style.cursor = 'not-allowed';
  }

  // Download Zip Button
  if (anyDone) {
    downloadZipBtn.disabled = false;
    downloadZipBtn.style.display = 'flex';
  } else {
    downloadZipBtn.disabled = true;
    downloadZipBtn.style.display = 'none';
  }
}

// Staggered trigger for all compressions
async function runAllCompression() {
  if (filesList.length === 0) return;

  if (compressBtn) {
    compressBtn.disabled = true;
    compressBtn.querySelector('span')!.textContent = 'Compressing...';
    compressBtn.style.opacity = '0.7';
  }

  for (let i = 0; i < filesList.length; i++) {
    const item = filesList[i];
    if (item.status === 'done') continue;

    item.status = 'compressing';
    renderFilesList();

    try {
      // Ensure image element loaded
      if (!item.imgElement) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            item.imgElement = img;
            resolve();
          };
          img.src = item.src;
        });
      }

      // Draw image onto canvas
      const canvas = document.createElement('canvas');
      canvas.width = item.imgElement!.naturalWidth;
      canvas.height = item.imgElement!.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D context failed');

      // White background for jpeg/transparency
      const mime = activeTab === 'slider' 
        ? getOutputMimeType(item.file.type, 'jpeg')
        : (targetFormat === 'webp' ? 'image/webp' : 'image/jpeg');

      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(item.imgElement!, 0, 0);

      let compressedBlob: Blob;
      if (activeTab === 'slider') {
        const quality = sliderQuality / 100;
        compressedBlob = await getCanvasBlob(canvas, mime, quality);
      } else {
        const sizeInBytes = targetSizeValue * (targetSizeUnit === 'MB' ? 1024 * 1024 : 1024);
        compressedBlob = await compressToTargetSize(canvas, mime, sizeInBytes);
      }

      item.compressedBlob = compressedBlob;
      item.newSize = compressedBlob.size;
      item.status = 'done';
    } catch (err) {
      console.error(err);
      item.status = 'error';
    }

    renderFilesList();
  }

  if (compressBtn) {
    compressBtn.disabled = false;
    compressBtn.querySelector('span')!.textContent = 'Compress';
    compressBtn.style.opacity = '1';
  }
  updateBottomActions();
}

function getOutputMimeType(originalType: string, fallback: 'jpeg' | 'webp'): string {
  if (originalType === 'image/jpeg' || originalType === 'image/jpg') {
    return 'image/jpeg';
  }
  if (originalType === 'image/webp') {
    return 'image/webp';
  }
  return fallback === 'webp' ? 'image/webp' : 'image/jpeg';
}

function getCanvasBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, mimeType, quality);
  });
}

// Compress to Target Size using Binary Search quality & scaling down dimensions
async function compressToTargetSize(
  canvas: HTMLCanvasElement,
  mimeType: string,
  targetSizeInBytes: number,
  maxIterations = 8
): Promise<Blob> {
  let low = 0.01;
  let high = 1.0;
  let bestBlob: Blob | null = null;
  
  for (let i = 0; i < maxIterations; i++) {
    const quality = (low + high) / 2;
    const blob = await getCanvasBlob(canvas, mimeType, quality);
    if (blob.size <= targetSizeInBytes) {
      bestBlob = blob;
      low = quality; // Try higher quality
    } else {
      high = quality; // Need lower quality
    }
  }

  // If even lowest quality (0.01) is too large, scale down image dimensions!
  if (!bestBlob || bestBlob.size > targetSizeInBytes) {
    let scale = 0.95;
    const origWidth = canvas.width;
    const origHeight = canvas.height;
    
    while (scale > 0.05) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = Math.round(origWidth * scale);
      tempCanvas.height = Math.round(origHeight * scale);
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        if (mimeType === 'image/jpeg') {
          tempCtx.fillStyle = '#FFFFFF';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
        
        let scaleLow = 0.05;
        let scaleHigh = 0.95;
        let scaleBestBlob: Blob | null = null;
        
        for (let i = 0; i < 6; i++) {
          const quality = (scaleLow + scaleHigh) / 2;
          const blob = await getCanvasBlob(tempCanvas, mimeType, quality);
          if (blob.size <= targetSizeInBytes) {
            scaleBestBlob = blob;
            scaleLow = quality;
          } else {
            scaleHigh = quality;
          }
        }
        
        if (scaleBestBlob && scaleBestBlob.size <= targetSizeInBytes) {
          return scaleBestBlob;
        }
      }
      scale -= 0.1;
    }
  }
  
  return bestBlob || await getCanvasBlob(canvas, mimeType, 0.01);
}

// Download single compressed file
function downloadSingleItem(item: FileItem) {
  if (!item.compressedBlob) return;

  const ext = item.compressedBlob.type === 'image/webp' ? 'webp' : item.compressedBlob.type === 'image/png' ? 'png' : 'jpg';
  const cleanName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
  const fileName = `${cleanName}_compressed.${ext}`;

  const link = document.createElement('a');
  link.download = fileName;
  link.href = URL.createObjectURL(item.compressedBlob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// Generate ZIP file of all compressed files using JSZip
async function downloadZipArchive() {
  const completed = filesList.filter(f => f.status === 'done' && f.compressedBlob);
  if (completed.length === 0) return;

  if (downloadZipBtn) {
    downloadZipBtn.disabled = true;
    downloadZipBtn.querySelector('span')!.textContent = 'Creating ZIP...';
    downloadZipBtn.style.opacity = '0.7';
  }

  try {
    const zip = new JSZip();
    completed.forEach(item => {
      const ext = item.compressedBlob!.type === 'image/webp' ? 'webp' : 'jpg';
      const cleanName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      const fileName = `${cleanName}_compressed.${ext}`;
      zip.file(fileName, item.compressedBlob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.download = 'compressed_images.zip';
    link.href = URL.createObjectURL(content);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } catch (err) {
    console.error(err);
    alert('Failed to generate ZIP file.');
  }

  if (downloadZipBtn) {
    downloadZipBtn.disabled = false;
    downloadZipBtn.querySelector('span')!.textContent = 'Download Zip';
    downloadZipBtn.style.opacity = '1';
  }
}
