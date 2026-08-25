/**
 * DocNode Drill-Down Engine
 * 
 * Client-side Gemini API integration for the evidence popover system.
 * Mirrors the clinical summary-node drill-down pattern from the main app.
 * Acts as a teaching mechanism and research aid for documentation readers.
 */

(function () {
    const STORAGE_VAL = '_pg_d_ak';

    function obfuscateKey(val) {
        return btoa(val).split('').reverse().join('');
    }
    function deobfuscateKey(val) {
        try {
            return atob(val.split('').reverse().join(''));
        } catch (e) {
            return '';
        }
    }
    const DRILL_PANEL_ID = 'docDrillPanel';

    let currentTerm = '';
    let conversationHistory = [];

    // ─── Build drill panel (injected once) ────────────────────────
    function ensureDrillPanel() {
        if (document.getElementById(DRILL_PANEL_ID)) return;

        const panel = document.createElement('div');
        panel.id = DRILL_PANEL_ID;
        panel.className = 'doc-drill-panel';
        panel.innerHTML = `
            <div class="doc-drill-header">
                <div class="doc-drill-icon">
                    <svg viewBox="0 -960 960 960" fill="currentColor" width="11" height="11">
                        <path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z"/>
                    </svg>
                </div>
                <span class="doc-drill-title">Evidence Focus</span>
                <span class="doc-drill-badge" id="drillBadge"></span>
                <button class="doc-drill-close" id="drillClose" aria-label="Close">
                    <svg viewBox="0 -960 960 960" fill="currentColor" width="14" height="14">
                        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                    </svg>
                </button>
            </div>
            <div class="doc-drill-body" id="drillBody"></div>
            <div class="doc-drill-input-row">
                <input class="doc-drill-input" id="drillInput" type="text"
                       placeholder="Ask a follow-up…">
                <button class="doc-drill-send" id="drillSend">
                    <svg viewBox="0 -960 960 960" fill="currentColor" width="14" height="14">
                        <path d="M120-160v-240l320-80-320-80v-240l760 320-760 320Z"/>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(panel);

        // Close handler
        document.getElementById('drillClose').addEventListener('click', closeDrill);

        // Send handler
        document.getElementById('drillSend').addEventListener('click', sendFollowUp);
        document.getElementById('drillInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendFollowUp();
        });
    }

    // ─── API Key ──────────────────────────────────────────────────
    function getApiKey() {
        const raw = localStorage.getItem(STORAGE_VAL);
        return raw ? deobfuscateKey(raw) : '';
    }

    function promptForKey(callback) {
        const body = document.getElementById('drillBody');
        body.innerHTML = `
            <div class="api-key-prompt">
                <label>Enter your Gemini API key to enable AI-powered exploration</label>
                <input type="password" id="apiKeyInput" placeholder="AIza..." autocomplete="off">
                <button id="apiKeySave">Save & Continue</button>
                <p style="font-size: 10px; color: #9CA3AF; margin-top: 4px;">
                    Key is stored locally in your browser. Never sent to any server other than Google's API.
                </p>
            </div>
        `;
        document.getElementById('apiKeySave').addEventListener('click', () => {
            const key = document.getElementById('apiKeyInput').value.trim();
            if (key) {
                localStorage.setItem(STORAGE_VAL, obfuscateKey(key));
                callback(key);
            }
        });
        document.getElementById('apiKeyInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const key = e.target.value.trim();
                if (key) {
                    localStorage.setItem(STORAGE_VAL, obfuscateKey(key));
                    callback(key);
                }
            }
        });
    }

    // ─── Gemini API Call ──────────────────────────────────────────
    async function callGemini(apiKey, messages) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const systemInstruction = `You are an expert technical educator and research assistant embedded in the documentation for "Pocket Gull" — a voice-first clinical co-pilot built with Angular v21.1, Three.js, Google GenAI SDK, and the Agent Development Kit (ADK).

Your role is to TEACH and help readers RESEARCH. When a reader clicks on a technical term, explain it in the context of Pocket Gull's architecture. Be:
- Concise but thorough (2-4 paragraphs max)
- Use analogies when helpful
- Reference specific files or components when relevant
- Cite official documentation links for further reading
- Use markdown formatting: **bold** for emphasis, \`code\` for files/functions, bullet lists for key points

Technology stack context:
- Frontend: Angular v21.1 (Signals, Zoneless, SSR)
- 3D: Three.js v0.183 (procedural anatomy models)
- AI: Google GenAI SDK (gemini-2.5-flash), @google/adk (InMemoryRunner, LlmAgent)
- Data: FHIR R4 Bundles, IndexedDB local persistence
- Backend: Express.js on Google Cloud Run
- Research: NCBI PubMed E-utilities, Google CSE
- Speech: Web Speech API (bi-directional)
- Styling: Tailwind CSS + Dieter Rams design tokens`;

        const contents = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!resp.ok) {
            const err = await resp.text();
            throw new Error(`Gemini API error: ${resp.status} — ${err}`);
        }

        const data = await resp.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
    }

    // ─── Simple Markdown → HTML ──────────────────────────────────
    function renderMarkdown(text) {
        return text
            // Headers
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h3>$1</h3>')
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#76B362">$1</a>')
            // Bullet lists
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/gs, (match) => '<ul>' + match + '</ul>')
            // Paragraphs (text separated by double newlines)
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[hulo])(.+)/gm, '<p>$1</p>')
            // Clean up empty tags
            .replace(/<p><\/p>/g, '');
    }

    // ─── Drill Open ──────────────────────────────────────────────
    function openDrill(term, category, hint) {
        ensureDrillPanel();
        const panel = document.getElementById(DRILL_PANEL_ID);
        const badge = document.getElementById('drillBadge');
        const body = document.getElementById('drillBody');
        const input = document.getElementById('drillInput');

        currentTerm = term;
        conversationHistory = [];
        badge.textContent = category;
        panel.classList.add('open');

        // Check for API key
        const apiKey = getApiKey();
        if (!apiKey) {
            promptForKey((key) => {
                startDrill(key, term, hint, body);
            });
            return;
        }

        startDrill(apiKey, term, hint, body);
        input.focus();
    }

    async function startDrill(apiKey, term, hint, body) {
        // Show thinking
        body.innerHTML = `<div class="doc-drill-thinking"><span></span><span></span><span></span></div>`;

        const prompt = `The reader clicked on the term "${term}" in the Pocket Gull documentation. The contextual hint says: "${hint}".

Explain this concept as a teaching aid:
1. What it is and why it matters in the context of Pocket Gull
2. How it connects to the rest of the architecture
3. A practical example or analogy
4. Where to learn more (link to official docs if applicable)`;

        conversationHistory.push({ role: 'user', text: prompt });

        try {
            const response = await callGemini(apiKey, conversationHistory);
            conversationHistory.push({ role: 'model', text: response });
            body.innerHTML = renderMarkdown(response);
        } catch (e) {
            body.innerHTML = `<p style="color: #EF4444;">${e.message}</p>`;
            if (e.message.includes('401') || e.message.includes('403')) {
                localStorage.removeItem(STORAGE_VAL);
            }
        }
    }

    // ─── Follow-Up ───────────────────────────────────────────────
    async function sendFollowUp() {
        const input = document.getElementById('drillInput');
        const body = document.getElementById('drillBody');
        const question = input.value.trim();
        if (!question) return;

        const apiKey = getApiKey();
        if (!apiKey) return;

        input.value = '';

        // Append user message
        const userDiv = document.createElement('div');
        userDiv.style.cssText = 'text-align: right; margin: 12px 0 8px;';
        const span = document.createElement('span');
        span.style.cssText = 'display: inline-block; background: #1C1C1C; color: #fff; font-size: 11.5px; padding: 5px 10px; border-radius: 8px 8px 2px 8px; max-width: 85%;';
        span.textContent = question;
        userDiv.appendChild(span);
        body.appendChild(userDiv);

        // Thinking dots
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'doc-drill-thinking';
        thinkingDiv.innerHTML = '<span></span><span></span><span></span>';
        body.appendChild(thinkingDiv);
        body.scrollTop = body.scrollHeight;

        conversationHistory.push({ role: 'user', text: question });

        try {
            const response = await callGemini(apiKey, conversationHistory);
            conversationHistory.push({ role: 'model', text: response });

            thinkingDiv.remove();
            const responseDiv = document.createElement('div');
            responseDiv.style.cssText = 'margin: 8px 0;';
            responseDiv.innerHTML = renderMarkdown(response);
            body.appendChild(responseDiv);
            body.scrollTop = body.scrollHeight;
        } catch (e) {
            thinkingDiv.remove();
            const errDiv = document.createElement('div');
            errDiv.innerHTML = `<p style="color: #EF4444; font-size: 11px;">${e.message}</p>`;
            body.appendChild(errDiv);
        }
    }

    // ─── Close ───────────────────────────────────────────────────
    function closeDrill() {
        const panel = document.getElementById(DRILL_PANEL_ID);
        if (panel) panel.classList.remove('open');
        conversationHistory = [];
    }

    // ─── Attach click handlers to all DocNodes ───────────────────
    function init() {
        document.querySelectorAll('.doc-node').forEach(node => {
            node.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const term = node.dataset.term;
                const category = node.dataset.category;
                const hint = node.dataset.hint;
                openDrill(term, category, hint);
            });
        });
    }

    // Init on DOMContentLoaded and Astro page transitions
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    document.addEventListener('astro:page-load', init);
})();
