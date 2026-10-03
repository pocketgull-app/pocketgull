// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * Universal Bionic Fixation & Reading Speed Engine
 * Transforms HTML paragraph blocks by bolding the first half of each word
 * to guide saccadic eye movements and accelerate cognitive comprehension.
 */
export function applyBionicText(html: string): string {
  if (!html) return '';
  const pOpen = '<p';
  const pClose = '</p>';
  let result = '';
  let cursor = 0;
  const lowerHtml = html.toLowerCase();

  while (cursor < html.length) {
    const startIdx = lowerHtml.indexOf(pOpen, cursor);
    if (startIdx === -1) {
      result += html.slice(cursor);
      break;
    }
    result += html.slice(cursor, startIdx);

    const tagEnd = html.indexOf('>', startIdx);
    if (tagEnd === -1) {
      result += html.slice(startIdx);
      break;
    }
    const openTag = html.slice(startIdx, tagEnd + 1);

    const closeIdx = lowerHtml.indexOf(pClose, tagEnd + 1);
    if (closeIdx === -1) {
      result += html.slice(startIdx);
      break;
    }

    const inner = html.slice(tagEnd + 1, closeIdx);
    const closeTag = html.slice(closeIdx, closeIdx + pClose.length);

    const words = inner.split(' ');
    const transformed = words.map((word: string) => {
      if (!word || word.startsWith('<') || word.startsWith('&')) return word;
      const mid = Math.ceil(word.length / 2);
      return `<b>${word.slice(0, mid)}</b>${word.slice(mid)}`;
    }).join(' ');

    result += `${openTag}${transformed}${closeTag}`;
    cursor = closeIdx + pClose.length;
  }

  return result;
}

/**
 * Renders the standardized Tri-Mode Reading Toolbar HTML markup.
 */
export function renderReadingToolbarHtml(): string {
  return `
      <!-- Reading Toolbar -->
      <div class="reading-toolbar">
        <div class="tool-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: #a1a1aa; text-transform: uppercase;">Reading Level:</span>
          <button id="btn-level-standard" class="toggle-btn active" onclick="setReadingLevel('standard')">🎓 Standard</button>
          <button id="btn-level-grade6" class="toggle-btn" onclick="setReadingLevel('grade6')">🌱 6th Grade</button>
        </div>

        <div class="tool-group">
          <button id="btn-bionic" class="toggle-btn" onclick="toggleBionic()">⚡ Bionic Fixation Mode</button>
          <a href="https://pocketgull.app" class="btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.9rem;">Interactive 3D App →</a>
        </div>
      </div>`;
}

/**
 * Standard client-side script for toggling reading levels and bionic fixation.
 */
export const READING_TOOLBAR_SCRIPT = `
    function setReadingLevel(level) {
      const std = document.getElementById('content-standard');
      const g6 = document.getElementById('content-grade6');
      const bio = document.getElementById('content-bionic');
      const btnStd = document.getElementById('btn-level-standard');
      const btnG6 = document.getElementById('btn-level-grade6');
      const btnBio = document.getElementById('btn-bionic');
      if (!std || !g6) return;
      if (level === 'grade6') {
        std.style.display = 'none';
        if (bio) bio.style.display = 'none';
        g6.style.display = 'block';
        if (btnG6) btnG6.classList.add('active');
        if (btnStd) btnStd.classList.remove('active');
        if (btnBio) btnBio.classList.remove('active');
        bionicActive = false;
      } else {
        std.style.display = 'block';
        if (bio) bio.style.display = 'none';
        g6.style.display = 'none';
        if (btnStd) btnStd.classList.add('active');
        if (btnG6) btnG6.classList.remove('active');
        if (btnBio) btnBio.classList.remove('active');
        bionicActive = false;
      }
    }

    let bionicActive = false;
    function toggleBionic() {
      bionicActive = !bionicActive;
      const bionicBtn = document.getElementById('btn-bionic');
      const std = document.getElementById('content-standard');
      const g6 = document.getElementById('content-grade6');
      const bio = document.getElementById('content-bionic');
      const btnStd = document.getElementById('btn-level-standard');
      const btnG6 = document.getElementById('btn-level-grade6');
      if (!std || !bio) return;
      if (bionicActive) {
        std.style.display = 'none';
        if (g6) g6.style.display = 'none';
        bio.style.display = 'block';
        if (bionicBtn) bionicBtn.classList.add('active');
        if (btnStd) btnStd.classList.remove('active');
        if (btnG6) btnG6.classList.remove('active');
      } else {
        std.style.display = 'block';
        bio.style.display = 'none';
        if (g6) g6.style.display = 'none';
        if (bionicBtn) bionicBtn.classList.remove('active');
        if (btnStd) btnStd.classList.add('active');
      }
    }
`;

/**
 * Standard CSS rules for the reading toolbar.
 */
export const READING_TOOLBAR_CSS = `
    .reading-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: var(--card, #18181b);
      border: 1px solid var(--border, #27272a);
      padding: 0.75rem 1.25rem;
      border-radius: 1rem;
      margin: 1.5rem 0 2rem;
    }
    .tool-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .toggle-btn {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #d4d4d8;
      padding: 0.4rem 0.85rem;
      border-radius: 0.6rem;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .toggle-btn:hover {
      border-color: var(--teal-light, #2dd4bf);
      color: #fff;
    }
    .toggle-btn.active {
      background: var(--teal, #14b8a6);
      color: #09090b;
      border-color: var(--teal-light, #2dd4bf);
    }
    .btn-primary {
      background: var(--teal-light, #2dd4bf);
      color: #042f2e;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-primary:hover {
      background: #5eead4;
      transform: translateY(-1px);
    }
    .grade6-card {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 1rem;
      padding: 1.75rem;
      margin-bottom: 2rem;
      line-height: 1.8;
    }
    .grade6-card h3 {
      color: var(--emerald-light, #34d399);
      font-size: 1.35rem;
      font-weight: 800;
      margin-bottom: 1rem;
    }
    .grade6-card h4 {
      color: #fff;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 1.5rem 0 0.5rem;
    }
    .grade6-card p {
      margin-bottom: 1rem;
      font-size: 1.05rem;
      color: #e4e4e7;
    }
    .grade6-card ul {
      margin-left: 1.5rem;
      margin-bottom: 1rem;
      color: #d4d4d8;
    }
    .grade6-card li {
      margin-bottom: 0.5rem;
    }
`;
