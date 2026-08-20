// Initialize Split.js
Split(['#renderer', '#playground'], {
    sizes: [50, 50],
    minSize: 200,
    gutterSize: 5,
    onDragEnd: () => {
        // Trigger resize on all active terminals when split drag ends
        if (activeTabId && openedTabs[activeTabId] && openedTabs[activeTabId].type === 'terminal') {
            const { fitAddon, term } = openedTabs[activeTabId];
            fitAddon.fit();
            socket.emit('terminal-resize', { termId: activeTabId, cols: term.cols, rows: term.rows });
        }
    }
});

// Renderer Logic
let slides = [];
let currentSlideIndex = 0;

const slideContent = document.getElementById('slide-content');
const slideInfo = document.getElementById('slide-info');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');
const loadWorkshopBtn = document.getElementById('load-workshop');

// View Switching Logic
const viewInstructionsBtn = document.getElementById('view-instructions');
const viewReportingBtn = document.getElementById('view-reporting');
const instructionsView = document.getElementById('instructions-view');
const reportingView = document.getElementById('reporting-view');

viewInstructionsBtn.addEventListener('click', () => {
    viewInstructionsBtn.classList.add('active');
    viewReportingBtn.classList.remove('active');
    instructionsView.style.display = 'flex';
    reportingView.style.display = 'none';
});

viewReportingBtn.addEventListener('click', () => {
    viewReportingBtn.classList.add('active');
    viewInstructionsBtn.classList.remove('active');
    reportingView.style.display = 'block';
    instructionsView.style.display = 'none';
});

// Configure marked with highlight.js
marked.use({
    renderer: {
        code(code, language) {
            const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
            const highlighted = hljs.highlight(code, { language: validLanguage }).value;
            return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
        }
    }
});

async function loadSlides() {
    try {
        const response = await fetch('/api/slides');
        if (!response.ok) throw new Error('Unable to load the slide list');
        slides = await response.json();
        if (slides.length > 0) {
            loadSlide(0);
        } else {
            slideContent.innerHTML = '<p>No slides found.</p>';
            slideInfo.textContent = 'Slide 0/0';
            prevBtn.style.visibility = 'hidden';
            nextBtn.style.visibility = 'hidden';
        }
    } catch (err) {
        console.error('Failed to load slides', err);
    }
}

async function loadSlide(index) {
    if (index < 0 || index >= slides.length) return;
    
    currentSlideIndex = index;

    // Update button visibility
    prevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
    nextBtn.style.visibility = index === slides.length - 1 ? 'hidden' : 'visible';

    const filename = slides[index];
    
    try {
        const response = await fetch(`/api/slides/${filename}`);
        const text = await response.text();
        slideContent.innerHTML = marked.parse(text);
        slideInfo.textContent = `Slide ${index + 1}/${slides.length}`;
        
        // Add copy buttons to code blocks
        document.querySelectorAll('pre').forEach(pre => {
            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.textContent = 'Copy';
            btn.addEventListener('click', () => {
                const code = pre.querySelector('code').innerText;
                navigator.clipboard.writeText(code).then(() => {
                    btn.textContent = 'Copied!';
                    setTimeout(() => btn.textContent = 'Copy', 2000);
                });
            });
            pre.appendChild(btn);
        });

    } catch (err) {
        console.error('Failed to load slide content', err);
    }
}

prevBtn.addEventListener('click', () => loadSlide(currentSlideIndex - 1));
nextBtn.addEventListener('click', () => loadSlide(currentSlideIndex + 1));

loadWorkshopBtn.addEventListener('click', async () => {
    const url = window.prompt('Enter a GitHub folder URL to load into this workshop:', '');
    if (!url) return;

    loadWorkshopBtn.disabled = true;
    const previousLabel = loadWorkshopBtn.textContent;
    loadWorkshopBtn.textContent = 'Loading…';

    try {
        const response = await fetch('/api/workshop/load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load workshop');

        await loadSlides();
        window.alert(`Workshop loaded (${result.files} files).`);
    } catch (err) {
        console.error('Failed to load workshop', err);
        window.alert(`Failed to load workshop: ${err.message}`);
    } finally {
        loadWorkshopBtn.disabled = false;
        loadWorkshopBtn.textContent = previousLabel;
    }
});

loadSlides();

// --- Playground Logic (Terminal & Web) ---
const socket = io();
const tabsList = document.getElementById('tabs-list');
const terminalsContainer = document.getElementById('terminals-container');
const addTabBtn = document.getElementById('add-tab');
const urlInput = document.getElementById('url-input');

let openedTabs = {}; // id -> { type, term, fitAddon, wrapper, tab, iframe }
let activeTabId = null;
let tabIdCounter = 1;

function createTabElement(id, title, onClose, onRefresh) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.innerHTML = `<span>${title}</span>${onRefresh ? '<button class="refresh-tab" title="Refresh tab" aria-label="Refresh tab">↻</button>' : ''}${onClose ? '<button class="close-tab" title="Close tab" aria-label="Close tab">x</button>' : ''}`;
    tab.onclick = (e) => {
        if (e.target.classList.contains('refresh-tab')) {
            onRefresh(id);
        } else if (e.target.classList.contains('close-tab')) {
            onClose(id);
        } else {
            setActiveTab(id);
        }
    };
    tabsList.appendChild(tab);
    return tab;
}

function createTerminal() {
    const id = 'term-' + tabIdCounter++;
    const tab = createTabElement(id, 'Terminal', null);

    // Create Terminal Container
    const wrapper = document.createElement('div');
    wrapper.className = 'terminal-wrapper';
    wrapper.id = id;
    terminalsContainer.appendChild(wrapper);

    // Initialize xterm.js
    const term = new Terminal({
        cursorBlink: true,
        theme: {
            background: '#1e1e1e'
        },
        allowProposedApi: true,
        fontFamily: '"JetBrainsMono Nerd Font", monospace'
    });
    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(wrapper);
    
    // Initial fit
    setTimeout(() => {
        fitAddon.fit();
        socket.emit('terminal-resize', { termId: id, cols: term.cols, rows: term.rows });
    }, 0);

    // Store tab info
    openedTabs[id] = { type: 'terminal', term, fitAddon, wrapper, tab };

    // Socket events
    socket.emit('create-terminal', id, () => {
        term.onData(data => {
            socket.emit('terminal-input', { termId: id, data });
        });
        
        // Resize on window resize
        window.addEventListener('resize', () => {
            fitAddon.fit();
            socket.emit('terminal-resize', { termId: id, cols: term.cols, rows: term.rows });
        });
        
        // Handle Ctrl + / - for zooming (basic implementation)
        // Note: Browser zoom handles most of this, but we can adjust font size if needed.
        // For now, let's rely on the fit addon reacting to container size changes.
    });

    // Add ResizeObserver to the wrapper to handle container resizing (e.g. Split.js)
    const resizeObserver = new ResizeObserver(() => {
        if (wrapper.classList.contains('active')) {
            fitAddon.fit();
            socket.emit('terminal-resize', { termId: id, cols: term.cols, rows: term.rows });
        }
    });
    resizeObserver.observe(wrapper);

    setActiveTab(id);
    return id;
}

function createWebTab(url, title) {
    // Parse tab name as name|url
    const parts = url.split('|');
    if (parts.length === 2) {
        title = parts[0];
        url = parts[1];
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;

        // if the url is just a port number, prepend window.location.hostname
        if (/^\d+$/.test(url.replace('http://', ''))) {
            url = 'http://' + window.location.hostname + ':' + url.replace('http://', '');
        }        
    }

    const id = 'web-' + tabIdCounter++;
    const tabTitle = title || url;
    const tab = createTabElement(id, tabTitle, closeTab, refreshTab);

    const wrapper = document.createElement('div');
    wrapper.className = 'terminal-wrapper'; // Reuse class for layout
    wrapper.id = id;
    
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allow = "clipboard-read; clipboard-write";
    wrapper.appendChild(iframe);
    
    terminalsContainer.appendChild(wrapper);

    openedTabs[id] = { type: 'web', wrapper, tab, iframe };
    setActiveTab(id);
    return id;
}

function refreshTab(id) {
    const tabData = openedTabs[id];
    if (tabData && tabData.type === 'web') {
        tabData.iframe.src = tabData.iframe.src;
    }
}

function closeTab(id) {
    if (!openedTabs[id]) return;

    const { type, term, wrapper, tab } = openedTabs[id];
    
    // Cleanup DOM
    wrapper.remove();
    tab.remove();
    
    if (type === 'terminal') {
        term.dispose();
        socket.emit('close-terminal', { termId: id });
    }
    
    delete openedTabs[id];

    // Switch to another tab if active one was closed
    if (activeTabId === id) {
        const remainingIds = Object.keys(openedTabs);
        if (remainingIds.length > 0) {
            setActiveTab(remainingIds[remainingIds.length - 1]);
        } else {
            activeTabId = null;
        }
    }
}

function setActiveTab(id) {
    if (activeTabId && openedTabs[activeTabId]) {
        openedTabs[activeTabId].wrapper.classList.remove('active');
        openedTabs[activeTabId].tab.classList.remove('active');
    }

    activeTabId = id;
    if (openedTabs[id]) {
        const tabData = openedTabs[id];
        tabData.wrapper.classList.add('active');
        tabData.tab.classList.add('active');
        
        if (tabData.type === 'terminal') {
            tabData.fitAddon.fit();
            tabData.term.focus();
        }
    }
}

socket.on('terminal-output', ({ termId, data }) => {
    if (openedTabs[termId] && openedTabs[termId].type === 'terminal') {
        openedTabs[termId].term.write(data);
    }
});

socket.on('terminal-exit', ({ termId }) => {
    closeTab(termId);
});

socket.on('clipboard-copy', ({ text }) => {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard')
    }).catch(err => {
        console.error('Clipboard write failed', err);
    });
});

addTabBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
        createWebTab(url);
        urlInput.value = '';
    }
});

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTabBtn.click();
    }
});

// Handle resize
window.addEventListener('resize', () => {
    if (activeTabId && openedTabs[activeTabId] && openedTabs[activeTabId].type === 'terminal') {
        const { fitAddon, term } = openedTabs[activeTabId];
        fitAddon.fit();
        socket.emit('terminal-resize', { termId: activeTabId, cols: term.cols, rows: term.rows });
    }
});

// Handle Ctrl + / - for font size adjustment
window.addEventListener('keydown', (e) => {
    // Check if the active element is within the terminal wrapper
    const isTerminalFocused = activeTabId && 
                              openedTabs[activeTabId] && 
                              openedTabs[activeTabId].type === 'terminal' &&
                              openedTabs[activeTabId].wrapper.contains(document.activeElement);

    if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '0' || e.key === '+')) {
        if (isTerminalFocused) {
            e.preventDefault();
            e.stopPropagation();
            
            const { term, fitAddon } = openedTabs[activeTabId];
            let currentSize = term.options.fontSize || 14;

            if (e.key === '=' || e.key === '+') {
                currentSize += 1;
            } else if (e.key === '-') {
                currentSize = Math.max(8, currentSize - 1);
            } else if (e.key === '0') {
                currentSize = 14; // Reset
            }

            term.options.fontSize = currentSize;
            fitAddon.fit();
            socket.emit('terminal-resize', { termId: activeTabId, cols: term.cols, rows: term.rows });
        }
    }
});

// Create initial tabs
const termId = createTerminal();

createWebTab(`http://${window.location.hostname}:5800`, 'Browser');
createWebTab(`http://${window.location.hostname}:8080`, 'IDE');
createWebTab(`http://${window.location.hostname}:9000`, 'Studio');
setActiveTab(termId);
