import './style.css';

interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  src: string; // Object URL for thumbnail
  imgElement: HTMLImageElement | null;
  targetFormat: 'jpeg' | 'png' | 'webp' | 'bmp' | 'gif' | 'ico';
  quality: number; // 0.1 to 1.0
  status: 'ready' | 'converting' | 'done' | 'error';
  convertedBlob: Blob | null;
  settingsOpen: boolean;
}

// State
let filesList: FileItem[] = [];
let bulkTargetFormat: FileItem['targetFormat'] = 'webp';

// Popover state
let activePopoverItem: { id: 'bulk' | string; element: HTMLElement } | null = null;

// DOM Elements
let dropZone: HTMLElement | null = null;
let selectFilesBtn: HTMLButtonElement | null = null;
let fileInput: HTMLInputElement | null = null;
let workspace: HTMLElement | null = null;
let filesCountBadge: HTMLElement | null = null;
let addMoreBtn: HTMLButtonElement | null = null;
let bulkFormatBtn: HTMLButtonElement | null = null;
let bulkFormatLabel: HTMLElement | null = null;
let filesListContainer: HTMLElement | null = null;
let clearAllBtn: HTMLButtonElement | null = null;
let convertAllBtn: HTMLButtonElement | null = null;
let downloadAllBtn: HTMLButtonElement | null = null;
let popoverContainer: HTMLElement | null = null;

// Initialize on DOM load
function initConverter() {
  initElements();
  setupEvents();
  updateWorkspaceUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConverter);
} else {
  initConverter();
}

// Initialize elements
function initElements() {
  dropZone = document.getElementById('converter-drop-zone');
  selectFilesBtn = document.getElementById('select-files-btn') as HTMLButtonElement;
  fileInput = document.getElementById('converter-file-input') as HTMLInputElement;
  workspace = document.getElementById('converter-workspace');
  filesCountBadge = document.getElementById('files-count-badge');
  addMoreBtn = document.getElementById('add-more-btn') as HTMLButtonElement;
  bulkFormatBtn = document.getElementById('bulk-format-btn') as HTMLButtonElement;
  bulkFormatLabel = document.getElementById('bulk-format-label');
  filesListContainer = document.getElementById('converter-files-list');
  clearAllBtn = document.getElementById('clear-all-btn') as HTMLButtonElement;
  convertAllBtn = document.getElementById('convert-all-btn') as HTMLButtonElement;
  downloadAllBtn = document.getElementById('download-all-btn') as HTMLButtonElement;

  // Create global popover container if it doesn't exist
  if (!document.getElementById('format-popover')) {
    popoverContainer = document.createElement('div');
    popoverContainer.id = 'format-popover';
    popoverContainer.className = 'format-popover';
    popoverContainer.style.display = 'none';
    document.body.appendChild(popoverContainer);
  } else {
    popoverContainer = document.getElementById('format-popover');
  }
}

// Setup Event Listeners
function setupEvents() {
  if (selectFilesBtn && fileInput) {
    selectFilesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput!.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
    fileInput.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (dropZone) {
    dropZone.addEventListener('click', () => {
      fileInput?.click();
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone!.classList.add('drag-over');
      // Glow border on drag over
      dropZone!.style.borderColor = 'var(--accent)';
      dropZone!.style.background = 'var(--surface-mid)';
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone!.classList.remove('drag-over');
      dropZone!.style.borderColor = 'var(--border-color)';
      dropZone!.style.background = 'rgba(0,0,0,0.15)';
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone!.classList.remove('drag-over');
      dropZone!.style.borderColor = 'var(--border-color)';
      dropZone!.style.background = 'rgba(0,0,0,0.15)';
      
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    });
  }

  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => {
      fileInput?.click();
    });
  }

  if (bulkFormatBtn) {
    bulkFormatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFormatPopover('bulk', bulkFormatBtn!);
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllFiles);
  }

  if (convertAllBtn) {
    convertAllBtn.addEventListener('click', convertAllFiles);
  }

  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', downloadAllFiles);
  }

  // Click outside to close popover
  document.addEventListener('click', (e) => {
    if (popoverContainer && popoverContainer.style.display !== 'none') {
      const target = e.target as HTMLElement;
      if (!popoverContainer.contains(target) && 
          (!activePopoverItem || !activePopoverItem.element.contains(target))) {
        closePopover();
      }
    }
  });

  // Handle window resize to reposition active popover
  window.addEventListener('resize', () => {
    if (popoverContainer && popoverContainer.style.display !== 'none' && activePopoverItem) {
      positionPopover(activePopoverItem.element);
    }
  });
}

// Handle file selection change
function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    processFiles(files);
  }
}

// Process files loaded
function processFiles(files: FileList) {
  let validFilesAdded = false;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith('image/')) {
      alert(`"${file.name}" is not a valid image file.`);
      continue;
    }

    // Limit single file to 30MB to prevent browser crash
    if (file.size > 30 * 1024 * 1024) {
      alert(`"${file.name}" is too large. Max size is 30MB.`);
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
      targetFormat: bulkTargetFormat,
      quality: 0.9,
      status: 'ready',
      convertedBlob: null,
      settingsOpen: false
    };

    // Preload image in memory for fast local processing
    const img = new Image();
    img.onload = () => {
      fileItem.imgElement = img;
    };
    img.src = src;

    filesList.push(fileItem);
    validFilesAdded = true;
  }

  if (validFilesAdded) {
    updateWorkspaceUI();
  }

  // Clear input value to allow uploading same file again
  if (fileInput) fileInput.value = '';
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

// Truncate middle of string
function truncateMiddle(str: string, maxLength = 28) {
  if (str.length <= maxLength) return str;
  const mid = Math.floor(maxLength / 2) - 1;
  return str.substring(0, mid) + '...' + str.substring(str.length - mid);
}

// Update workspace view and counter
function updateWorkspaceUI() {
  const toolContainer = document.getElementById('converter-tool');
  const dropZoneTitle = document.getElementById('drop-zone-title');

  // Always keep the side-by-side app workspace layout active on desktop!
  if (toolContainer) toolContainer.classList.add('has-files');
  if (workspace) workspace.style.display = 'block';
  if (dropZone) dropZone.style.display = 'flex';
  if (dropZoneTitle) dropZoneTitle.textContent = 'Drag & Drop More';
  
  if (filesCountBadge) {
    filesCountBadge.textContent = `${filesList.length} file${filesList.length > 1 ? 's' : ''}`;
  }

  renderFilesList();
  updateBottomActionsBar();
}

// Render list of added files
function renderFilesList() {
  const container = filesListContainer;
  if (!container) return;
  container.innerHTML = '';

  if (filesList.length === 0) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 180px; border: 1px dashed var(--border-soft); border-radius: var(--radius-lg); background: rgba(255,255,255,0.01); color: var(--text-muted); gap: 0.5rem; text-align: center; padding: 1.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.6; color: var(--accent);"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">No images selected yet</div>
        <p style="margin: 0; font-size: 0.75rem; max-width: 280px; line-height: 1.4; color: var(--text-muted);">Add files by clicking Choose Photos or dropping them in the zone on the right!</p>
      </div>
    `;
    return;
  }

  filesList.forEach(item => {
    const row = document.createElement('div');
    row.className = 'file-row';
    row.dataset.id = item.id;

    // Determine status text/classes
    let statusClass = 'ready';
    let statusLabel = 'Ready';
    if (item.status === 'converting') {
      statusClass = 'converting';
      statusLabel = 'Converting';
    } else if (item.status === 'done') {
      statusClass = 'done';
      statusLabel = 'Ready to Download';
    } else if (item.status === 'error') {
      statusClass = 'error';
      statusLabel = 'Error';
    }

    row.innerHTML = `
      <div class="file-row-main" style="display: flex; align-items: center; width: 100%; gap: 0.8rem; flex-wrap: nowrap;">
        <img src="${item.src}" class="file-row-thumb" alt="Thumbnail">
        
        <div class="file-row-info" style="flex: 1; min-width: 0;">
          <div class="file-row-name" title="${item.name}">${truncateMiddle(item.name)}</div>
          <div class="file-row-meta">
            <span>${formatBytes(item.size)}</span>
            <span class="status-badge ${statusClass}">${statusLabel}</span>
          </div>
        </div>

        <div class="file-row-actions" style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
          <!-- Target format select -->
          <div class="file-row-format-selector">
            <button class="file-row-format-btn" data-id="${item.id}">
              <span>${item.targetFormat.toUpperCase()}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-left: 2px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>

          <!-- Gear Settings Button -->
          <button class="file-row-action-btn gear-btn" data-id="${item.id}" title="Format Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>

          <!-- Download Action -->
          ${item.status === 'done' ? `
            <button class="file-row-action-btn download-btn" data-id="${item.id}" title="Download Converted Image" style="color: var(--accent); background: var(--accent-glow);">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          ` : ''}

          <!-- Remove Action -->
          <button class="file-row-action-btn remove-btn" data-id="${item.id}" title="Remove File">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Settings Panel (Hidden unless open) -->
      <div class="file-settings-panel" style="display: ${item.settingsOpen ? 'flex' : 'none'}; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">Conversion Quality</span>
          <span class="row-quality-val" style="font-size: 0.75rem; color: var(--accent); font-weight: 700;">${Math.round(item.quality * 100)}%</span>
        </div>
        <input type="range" class="row-quality-slider" data-id="${item.id}" min="10" max="100" value="${Math.round(item.quality * 100)}" style="height: 2px;">
      </div>
    `;

    // Hook format button click
    const formatBtn = row.querySelector('.file-row-format-btn') as HTMLElement;
    formatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFormatPopover(item.id, formatBtn);
    });

    // Hook settings panel gear button
    const gearBtn = row.querySelector('.gear-btn') as HTMLElement;
    gearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFileSettings(item.id);
    });

    // Hook slider value change
    const slider = row.querySelector('.row-quality-slider') as HTMLInputElement;
    const qualityVal = row.querySelector('.row-quality-val') as HTMLElement;
    slider.addEventListener('input', () => {
      const q = parseInt(slider.value) / 100;
      item.quality = q;
      qualityVal.textContent = `${slider.value}%`;
      
      // Update est size if JPEG/WebP is completed
      if (item.status === 'done') {
        item.status = 'ready'; // set back to ready to trigger convert again
        renderFilesList();
      }
    });

    // Hook individual download button
    if (item.status === 'done') {
      const dBtn = row.querySelector('.download-btn') as HTMLElement;
      dBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadSingleItem(item);
      });
    }

    // Hook remove button
    const rBtn = row.querySelector('.remove-btn') as HTMLElement;
    rBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFileItem(item.id);
    });

    container.appendChild(row);
  });
}

// Toggle drawer for settings quality
function toggleFileSettings(itemId: string) {
  const item = filesList.find(f => f.id === itemId);
  if (item) {
    item.settingsOpen = !item.settingsOpen;
    renderFilesList();
  }
}

// Remove single file item
function removeFileItem(itemId: string) {
  const index = filesList.findIndex(f => f.id === itemId);
  if (index !== -1) {
    // Revoke object URL
    URL.revokeObjectURL(filesList[index].src);
    filesList.splice(index, 1);
    updateWorkspaceUI();
  }
}

// Clear all files
function clearAllFiles() {
  filesList.forEach(item => URL.revokeObjectURL(item.src));
  filesList = [];
  closePopover();
  updateWorkspaceUI();
}

// Update bottom conversion CTA states
function updateBottomActionsBar() {
  if (!convertAllBtn || !downloadAllBtn || !clearAllBtn) return;

  if (filesList.length === 0) {
    convertAllBtn.style.display = 'flex';
    downloadAllBtn.style.display = 'none';
    convertAllBtn.querySelector('span')!.textContent = 'Convert Files';
    convertAllBtn.disabled = true;
    convertAllBtn.style.opacity = '0.5';
    convertAllBtn.style.cursor = 'not-allowed';
    
    clearAllBtn.disabled = true;
    clearAllBtn.style.opacity = '0.5';
    clearAllBtn.style.cursor = 'not-allowed';
    return;
  }

  // Restore active states if files are present
  convertAllBtn.disabled = false;
  convertAllBtn.style.opacity = '1';
  convertAllBtn.style.cursor = 'pointer';
  clearAllBtn.disabled = false;
  clearAllBtn.style.opacity = '1';
  clearAllBtn.style.cursor = 'pointer';

  const allDone = filesList.every(f => f.status === 'done');

  if (allDone) {
    convertAllBtn.style.display = 'none';
    downloadAllBtn.style.display = 'flex';
    downloadAllBtn.textContent = `Download All (${filesList.length} files)`;
  } else {
    convertAllBtn.style.display = 'flex';
    downloadAllBtn.style.display = 'none';
    
    const countToConvert = filesList.filter(f => f.status !== 'done').length;
    convertAllBtn.querySelector('span')!.textContent = `Convert ${countToConvert} File${countToConvert > 1 ? 's' : ''}`;
  }
}

// Convert all files locally
async function convertAllFiles() {
  if (filesList.length === 0) return;

  convertAllBtn!.disabled = true;
  convertAllBtn!.querySelector('span')!.textContent = 'Converting...';
  convertAllBtn!.style.opacity = '0.7';

  for (let i = 0; i < filesList.length; i++) {
    const item = filesList[i];
    if (item.status === 'done') continue;

    item.status = 'converting';
    renderFilesList();

    try {
      // Ensure image element is loaded
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

      const blob = await convertLocalCanvas(item.imgElement!, item.targetFormat, item.quality);
      item.convertedBlob = blob;
      item.status = 'done';
    } catch (err) {
      console.error(err);
      item.status = 'error';
    }

    renderFilesList();
  }

  convertAllBtn!.disabled = false;
  convertAllBtn!.style.opacity = '1';
  updateBottomActionsBar();
}

// Perform client side local HTML5 Canvas conversion
function convertLocalCanvas(
  img: HTMLImageElement,
  format: FileItem['targetFormat'],
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('2D context fail'));
      return;
    }

    // Handle transparency for JPEG conversions by painting a white background
    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    let mime = 'image/jpeg';
    if (format === 'png') mime = 'image/png';
    else if (format === 'webp') mime = 'image/webp';
    else if (format === 'bmp') mime = 'image/bmp';
    else if (format === 'gif') mime = 'image/gif';
    else if (format === 'ico') mime = 'image/x-icon';

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas Blob creation failed'));
      }
    }, mime, format === 'png' ? undefined : quality);
  });
}

// Download single item
function downloadSingleItem(item: FileItem) {
  if (!item.convertedBlob) return;

  const ext = item.targetFormat === 'jpeg' ? 'jpg' : item.targetFormat;
  const cleanName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
  const fileName = `${cleanName}.${ext}`;

  const link = document.createElement('a');
  link.download = fileName;
  link.href = URL.createObjectURL(item.convertedBlob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke object URL after timeout to clean up memory
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// Download all items sequentially
function downloadAllFiles() {
  filesList.forEach((item, index) => {
    if (item.status === 'done' && item.convertedBlob) {
      // Use staggered timeouts to prevent download blocking in browsers
      setTimeout(() => {
        downloadSingleItem(item);
      }, index * 250);
    }
  });
}

// Open/Toggle format dropdown menu
function toggleFormatPopover(id: 'bulk' | string, triggerElement: HTMLElement) {
  if (popoverContainer && popoverContainer.style.display !== 'none' && activePopoverItem && activePopoverItem.id === id) {
    closePopover();
    return;
  }

  activePopoverItem = { id, element: triggerElement };
  renderPopoverContent(id);
  
  if (popoverContainer) {
    popoverContainer.style.display = 'flex';
    positionPopover(triggerElement);
  }
}

// Position custom format select overlay relative to anchor button clicked
function positionPopover(trigger: HTMLElement) {
  if (!popoverContainer) return;

  const rect = trigger.getBoundingClientRect();
  const popoverWidth = 320;
  const popoverHeight = 248; // standard calculated height

  // Calculate coordinates
  let left = rect.left + window.scrollX;
  let top = rect.bottom + window.scrollY + 6;

  // Make sure popover stays inside screen boundary
  if (left + popoverWidth > window.innerWidth) {
    left = window.innerWidth - popoverWidth - 16;
  }
  if (left < 16) {
    left = 16;
  }

  if (top + popoverHeight > window.innerHeight + window.scrollY) {
    // Show above button if there is no room below
    top = rect.top + window.scrollY - popoverHeight - 6;
  }

  popoverContainer.style.left = `${left}px`;
  popoverContainer.style.top = `${top}px`;
}

// Close format popover
function closePopover() {
  if (popoverContainer) {
    popoverContainer.style.display = 'none';
  }
  activePopoverItem = null;
}

// Render popover structure
function renderPopoverContent(id: 'bulk' | string) {
  if (!popoverContainer) return;

  // Check current selection
  let currentSelection: FileItem['targetFormat'] = 'jpeg';
  if (id === 'bulk') {
    currentSelection = bulkTargetFormat;
  } else {
    const item = filesList.find(f => f.id === id);
    if (item) currentSelection = item.targetFormat;
  }

  popoverContainer.innerHTML = `
    <!-- Search Bar -->
    <div style="padding: 0.65rem 0.75rem; border-bottom: 1px solid var(--border-soft); display: flex; gap: 0.5rem; align-items: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--text-muted); opacity: 0.7;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" id="format-search" placeholder="Search Format" style="background: transparent; border: none; outline: none; color: var(--text-main); font-size: 0.8rem; width: 100%;">
    </div>

    <!-- Dropdown Body -->
    <div class="popover-body">
      <!-- Left Category Sidebar -->
      <div class="popover-left">
        <button class="popover-cat-btn active">
          <span>Image</span>
          <span style="color: var(--accent); font-weight: 800;">•</span>
        </button>
      </div>

      <!-- Right Formats Grid -->
      <div class="popover-right">
        <div class="formats-grid" id="formats-grid-el">
          <button class="format-btn ${currentSelection === 'webp' ? 'active' : ''}" data-fmt="webp">WebP</button>
          <button class="format-btn ${currentSelection === 'png' ? 'active' : ''}" data-fmt="png">PNG</button>
          <button class="format-btn ${currentSelection === 'jpeg' ? 'active' : ''}" data-fmt="jpeg">JPEG</button>
          <button class="format-btn ${currentSelection === 'bmp' ? 'active' : ''}" data-fmt="bmp">BMP</button>
          <button class="format-btn ${currentSelection === 'gif' ? 'active' : ''}" data-fmt="gif">GIF</button>
          <button class="format-btn ${currentSelection === 'ico' ? 'active' : ''}" data-fmt="ico">ICO</button>
        </div>
      </div>
    </div>
  `;

  // Search logic
  const searchInput = popoverContainer.querySelector('#format-search') as HTMLInputElement;
  const grid = popoverContainer.querySelector('#formats-grid-el') as HTMLElement;
  
  if (searchInput && grid) {
    searchInput.focus();
    searchInput.addEventListener('input', () => {
      const val = searchInput.value.toLowerCase().trim();
      const buttons = grid.querySelectorAll('.format-btn');
      
      buttons.forEach(btn => {
        const text = btn.textContent!.toLowerCase();
        const el = btn as HTMLElement;
        if (text.includes(val)) {
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      });
    });
  }

  // Hook button selection click events
  const formatButtons = popoverContainer.querySelectorAll('.format-btn');
  formatButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fmt = btn.getAttribute('data-fmt') as FileItem['targetFormat'];
      selectFormatFor(id, fmt);
      closePopover();
    });
  });
}

// Apply selected format to either specific file or all files
function selectFormatFor(id: 'bulk' | string, format: FileItem['targetFormat']) {
  if (id === 'bulk') {
    bulkTargetFormat = format;
    if (bulkFormatLabel) {
      bulkFormatLabel.textContent = format.toUpperCase();
    }
    
    // Apply to all files currently in the workspace
    filesList.forEach(item => {
      // only reset completed format if they change target format
      if (item.targetFormat !== format) {
        item.targetFormat = format;
        if (item.status === 'done') {
          item.status = 'ready';
          item.convertedBlob = null;
        }
      }
    });
  } else {
    const item = filesList.find(f => f.id === id);
    if (item && item.targetFormat !== format) {
      item.targetFormat = format;
      if (item.status === 'done') {
        item.status = 'ready';
        item.convertedBlob = null;
      }
    }
  }

  updateWorkspaceUI();
}
