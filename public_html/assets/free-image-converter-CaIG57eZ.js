import"./main-CHiSUCB-.js";var e=[],t=`webp`,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null,u=null,d=null,f=null,p=null,m=null,h=null;document.addEventListener(`DOMContentLoaded`,()=>{g(),_(),S()});function g(){r=document.getElementById(`converter-drop-zone`),i=document.getElementById(`select-files-btn`),a=document.getElementById(`converter-file-input`),o=document.getElementById(`converter-workspace`),s=document.getElementById(`files-count-badge`),c=document.getElementById(`add-more-btn`),l=document.getElementById(`bulk-format-btn`),u=document.getElementById(`bulk-format-label`),d=document.getElementById(`converter-files-list`),f=document.getElementById(`clear-all-btn`),p=document.getElementById(`convert-all-btn`),m=document.getElementById(`download-all-btn`),document.getElementById(`format-popover`)?h=document.getElementById(`format-popover`):(h=document.createElement(`div`),h.id=`format-popover`,h.className=`format-popover`,h.style.display=`none`,document.body.appendChild(h))}function _(){i&&a&&i.addEventListener(`click`,e=>{e.stopPropagation(),a.click()}),a&&a.addEventListener(`change`,v),r&&(r.addEventListener(`click`,()=>{a?.click()}),r.addEventListener(`dragover`,e=>{e.preventDefault(),r.classList.add(`drag-over`),r.style.borderColor=`var(--accent)`,r.style.background=`var(--surface-mid)`}),r.addEventListener(`dragleave`,()=>{r.classList.remove(`drag-over`),r.style.borderColor=`var(--border-color)`,r.style.background=`rgba(0,0,0,0.15)`}),r.addEventListener(`drop`,e=>{e.preventDefault(),r.classList.remove(`drag-over`),r.style.borderColor=`var(--border-color)`,r.style.background=`rgba(0,0,0,0.15)`;let t=e.dataTransfer?.files;t&&t.length>0&&y(t)})),c&&c.addEventListener(`click`,()=>{a?.click()}),l&&l.addEventListener(`click`,e=>{e.stopPropagation(),M(`bulk`,l)}),f&&f.addEventListener(`click`,E),p&&p.addEventListener(`click`,O),m&&m.addEventListener(`click`,j),document.addEventListener(`click`,e=>{if(h&&h.style.display!==`none`){let t=e.target;!h.contains(t)&&(!n||!n.element.contains(t))&&P()}}),window.addEventListener(`resize`,()=>{h&&h.style.display!==`none`&&n&&N(n.element)})}function v(e){let t=e.target.files;t&&t.length>0&&y(t)}function y(n){let r=!1;for(let i=0;i<n.length;i++){let a=n[i];if(!a.type.startsWith(`image/`)){alert(`"${a.name}" is not a valid image file.`);continue}if(a.size>30*1024*1024){alert(`"${a.name}" is too large. Max size is 30MB.`);continue}let o=Math.random().toString(36).substring(2,11),s=URL.createObjectURL(a),c={id:o,file:a,name:a.name,size:a.size,src:s,imgElement:null,targetFormat:t,quality:.9,status:`ready`,convertedBlob:null,settingsOpen:!1},l=new Image;l.onload=()=>{c.imgElement=l},l.src=s,e.push(c),r=!0}r&&S(),a&&(a.value=``)}function b(e,t=2){if(e===0)return`0 Bytes`;let n=1024,r=t<0?0:t,i=[`Bytes`,`KB`,`MB`,`GB`],a=Math.floor(Math.log(e)/Math.log(n));return parseFloat((e/n**+a).toFixed(r))+` `+i[a]}function x(e,t=28){if(e.length<=t)return e;let n=Math.floor(t/2)-1;return e.substring(0,n)+`...`+e.substring(e.length-n)}function S(){let t=document.getElementById(`converter-tool`),n=document.getElementById(`drop-zone-title`);t&&t.classList.add(`has-files`),o&&(o.style.display=`block`),r&&(r.style.display=`flex`),n&&(n.textContent=`Drag & Drop More`),s&&(s.textContent=`${e.length} file${e.length>1?`s`:``}`),C(),D()}function C(){let t=d;if(t){if(t.innerHTML=``,e.length===0){t.innerHTML=`
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 180px; border: 1px dashed var(--border-soft); border-radius: var(--radius-lg); background: rgba(255,255,255,0.01); color: var(--text-muted); gap: 0.5rem; text-align: center; padding: 1.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.6; color: var(--accent);"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">No images selected yet</div>
        <p style="margin: 0; font-size: 0.75rem; max-width: 280px; line-height: 1.4; color: var(--text-muted);">Add files by clicking Choose Photos or dropping them in the zone on the right!</p>
      </div>
    `;return}e.forEach(e=>{let n=document.createElement(`div`);n.className=`file-row`,n.dataset.id=e.id;let r=`ready`,i=`Ready`;e.status===`converting`?(r=`converting`,i=`Converting`):e.status===`done`?(r=`done`,i=`Ready to Download`):e.status===`error`&&(r=`error`,i=`Error`),n.innerHTML=`
      <div class="file-row-main" style="display: flex; align-items: center; width: 100%; gap: 0.8rem; flex-wrap: nowrap;">
        <img src="${e.src}" class="file-row-thumb" alt="Thumbnail">
        
        <div class="file-row-info" style="flex: 1; min-width: 0;">
          <div class="file-row-name" title="${e.name}">${x(e.name)}</div>
          <div class="file-row-meta">
            <span>${b(e.size)}</span>
            <span class="status-badge ${r}">${i}</span>
          </div>
        </div>

        <div class="file-row-actions" style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
          <!-- Target format select -->
          <div class="file-row-format-selector">
            <button class="file-row-format-btn" data-id="${e.id}">
              <span>${e.targetFormat.toUpperCase()}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-left: 2px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>

          <!-- Gear Settings Button -->
          <button class="file-row-action-btn gear-btn" data-id="${e.id}" title="Format Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>

          <!-- Download Action -->
          ${e.status===`done`?`
            <button class="file-row-action-btn download-btn" data-id="${e.id}" title="Download Converted Image" style="color: var(--accent); background: var(--accent-glow);">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          `:``}

          <!-- Remove Action -->
          <button class="file-row-action-btn remove-btn" data-id="${e.id}" title="Remove File">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Settings Panel (Hidden unless open) -->
      <div class="file-settings-panel" style="display: ${e.settingsOpen?`flex`:`none`}; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">Conversion Quality</span>
          <span class="row-quality-val" style="font-size: 0.75rem; color: var(--accent); font-weight: 700;">${Math.round(e.quality*100)}%</span>
        </div>
        <input type="range" class="row-quality-slider" data-id="${e.id}" min="10" max="100" value="${Math.round(e.quality*100)}" style="height: 2px;">
      </div>
    `;let a=n.querySelector(`.file-row-format-btn`);a.addEventListener(`click`,t=>{t.stopPropagation(),M(e.id,a)}),n.querySelector(`.gear-btn`).addEventListener(`click`,t=>{t.stopPropagation(),w(e.id)});let o=n.querySelector(`.row-quality-slider`),s=n.querySelector(`.row-quality-val`);o.addEventListener(`input`,()=>{e.quality=parseInt(o.value)/100,s.textContent=`${o.value}%`,e.status===`done`&&(e.status=`ready`,C())}),e.status===`done`&&n.querySelector(`.download-btn`).addEventListener(`click`,t=>{t.stopPropagation(),A(e)}),n.querySelector(`.remove-btn`).addEventListener(`click`,t=>{t.stopPropagation(),T(e.id)}),t.appendChild(n)})}}function w(t){let n=e.find(e=>e.id===t);n&&(n.settingsOpen=!n.settingsOpen,C())}function T(t){let n=e.findIndex(e=>e.id===t);n!==-1&&(URL.revokeObjectURL(e[n].src),e.splice(n,1),S())}function E(){e.forEach(e=>URL.revokeObjectURL(e.src)),e=[],P(),S()}function D(){if(!(!p||!m||!f)){if(e.length===0){p.style.display=`flex`,m.style.display=`none`,p.querySelector(`span`).textContent=`Convert Files`,p.disabled=!0,p.style.opacity=`0.5`,p.style.cursor=`not-allowed`,f.disabled=!0,f.style.opacity=`0.5`,f.style.cursor=`not-allowed`;return}if(p.disabled=!1,p.style.opacity=`1`,p.style.cursor=`pointer`,f.disabled=!1,f.style.opacity=`1`,f.style.cursor=`pointer`,e.every(e=>e.status===`done`))p.style.display=`none`,m.style.display=`flex`,m.textContent=`Download All (${e.length} files)`;else{p.style.display=`flex`,m.style.display=`none`;let t=e.filter(e=>e.status!==`done`).length;p.querySelector(`span`).textContent=`Convert ${t} File${t>1?`s`:``}`}}}async function O(){if(e.length!==0){p.disabled=!0,p.querySelector(`span`).textContent=`Converting...`,p.style.opacity=`0.7`;for(let t=0;t<e.length;t++){let n=e[t];if(n.status!==`done`){n.status=`converting`,C();try{n.imgElement||await new Promise(e=>{let t=new Image;t.onload=()=>{n.imgElement=t,e()},t.src=n.src}),n.convertedBlob=await k(n.imgElement,n.targetFormat,n.quality),n.status=`done`}catch(e){console.error(e),n.status=`error`}C()}}p.disabled=!1,p.style.opacity=`1`,D()}}function k(e,t,n){return new Promise((r,i)=>{let a=document.createElement(`canvas`);a.width=e.naturalWidth,a.height=e.naturalHeight;let o=a.getContext(`2d`);if(!o){i(Error(`2D context fail`));return}t===`jpeg`&&(o.fillStyle=`#FFFFFF`,o.fillRect(0,0,a.width,a.height)),o.drawImage(e,0,0);let s=`image/jpeg`;t===`png`?s=`image/png`:t===`webp`?s=`image/webp`:t===`bmp`?s=`image/bmp`:t===`gif`?s=`image/gif`:t===`ico`&&(s=`image/x-icon`),a.toBlob(e=>{e?r(e):i(Error(`Canvas Blob creation failed`))},s,t===`png`?void 0:n)})}function A(e){if(!e.convertedBlob)return;let t=e.targetFormat===`jpeg`?`jpg`:e.targetFormat,n=`${e.name.substring(0,e.name.lastIndexOf(`.`))||e.name}.${t}`,r=document.createElement(`a`);r.download=n,r.href=URL.createObjectURL(e.convertedBlob),document.body.appendChild(r),r.click(),document.body.removeChild(r),setTimeout(()=>URL.revokeObjectURL(r.href),1e3)}function j(){e.forEach((e,t)=>{e.status===`done`&&e.convertedBlob&&setTimeout(()=>{A(e)},t*250)})}function M(e,t){if(h&&h.style.display!==`none`&&n&&n.id===e){P();return}n={id:e,element:t},F(e),h&&(h.style.display=`flex`,N(t))}function N(e){if(!h)return;let t=e.getBoundingClientRect(),n=t.left+window.scrollX,r=t.bottom+window.scrollY+6;n+320>window.innerWidth&&(n=window.innerWidth-320-16),n<16&&(n=16),r+248>window.innerHeight+window.scrollY&&(r=t.top+window.scrollY-248-6),h.style.left=`${n}px`,h.style.top=`${r}px`}function P(){h&&(h.style.display=`none`),n=null}function F(n){if(!h)return;let r=`jpeg`;if(n===`bulk`)r=t;else{let t=e.find(e=>e.id===n);t&&(r=t.targetFormat)}h.innerHTML=`
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
          <button class="format-btn ${r===`webp`?`active`:``}" data-fmt="webp">WebP</button>
          <button class="format-btn ${r===`png`?`active`:``}" data-fmt="png">PNG</button>
          <button class="format-btn ${r===`jpeg`?`active`:``}" data-fmt="jpeg">JPEG</button>
          <button class="format-btn ${r===`bmp`?`active`:``}" data-fmt="bmp">BMP</button>
          <button class="format-btn ${r===`gif`?`active`:``}" data-fmt="gif">GIF</button>
          <button class="format-btn ${r===`ico`?`active`:``}" data-fmt="ico">ICO</button>
        </div>
      </div>
    </div>
  `;let i=h.querySelector(`#format-search`),a=h.querySelector(`#formats-grid-el`);i&&a&&(i.focus(),i.addEventListener(`input`,()=>{let e=i.value.toLowerCase().trim();a.querySelectorAll(`.format-btn`).forEach(t=>{let n=t.textContent.toLowerCase(),r=t;n.includes(e)?r.style.display=`block`:r.style.display=`none`})})),h.querySelectorAll(`.format-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),I(n,e.getAttribute(`data-fmt`)),P()})})}function I(n,r){if(n===`bulk`)t=r,u&&(u.textContent=r.toUpperCase()),e.forEach(e=>{e.targetFormat!==r&&(e.targetFormat=r,e.status===`done`&&(e.status=`ready`,e.convertedBlob=null))});else{let t=e.find(e=>e.id===n);t&&t.targetFormat!==r&&(t.targetFormat=r,t.status===`done`&&(t.status=`ready`,t.convertedBlob=null))}S()}