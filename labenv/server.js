const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const pty = require('node-pty');
const os = require('os');
const fs = require('fs');
const path = require('path');
const fsp = fs.promises;
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

// If fish is available, run pty script, else fallback to user's default shell
const scriptPath = path.join(__dirname, 'scripts', 'start.fish');
const start = fs.existsSync('/usr/bin/fish') ? scriptPath : os.userInfo().shell;

// Serve static files
app.use(express.static('public'));
app.use(express.static('workshop'));
app.use(express.json());

// Serve node_modules for frontend libraries
app.use('/node_modules', express.static('node_modules'));

function parseGitHubFolderUrl(value) {
    let url;
    try {
        url = new URL(value);
    } catch {
        throw new Error('Enter a valid GitHub folder URL.');
    }

    if (url.protocol !== 'https:' || url.hostname !== 'github.com') {
        throw new Error('Only HTTPS github.com folder URLs are supported.');
    }

    let parts;
    try {
        parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    } catch {
        throw new Error('The GitHub URL contains invalid characters.');
    }
    if (parts.length < 5 || parts[2] !== 'tree') {
        throw new Error('Use a URL like https://github.com/owner/repository/tree/branch/folder.');
    }

    const [owner, repository, , ...refAndFolder] = parts;
    if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repository)) {
        throw new Error('Invalid GitHub repository URL.');
    }
    if (refAndFolder.some(part => !part || part === '.' || part === '..' || /[\\/\0]/.test(part))) {
        throw new Error('The GitHub URL contains an unsafe folder path.');
    }

    return { owner, repository, refAndFolder };
}

async function downloadGitHubFolder(urlValue) {
    const { owner, repository, refAndFolder } = parseGitHubFolderUrl(urlValue);
    const workDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'labenv-workshop-'));

    try {
        // A Git ref may contain slashes. Try the longest possible ref first and
        // keep a candidate only when that ref's archive contains the requested folder.
        for (let refLength = refAndFolder.length - 1; refLength >= 1; refLength--) {
            const ref = refAndFolder.slice(0, refLength).join('/');
            const folder = refAndFolder.slice(refLength).join('/');
            const archivePath = path.join(workDir, 'workshop.zip');
            const archiveUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/zipball/${encodeURIComponent(ref)}`;
            const response = await fetch(archiveUrl, {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'labenv-workshop-loader'
                },
                redirect: 'follow',
                signal: AbortSignal.timeout(30000)
            });
            if (!response.ok || !response.body) continue;

            const bytes = Buffer.from(await response.arrayBuffer());
            await fsp.writeFile(archivePath, bytes);

            const extractDir = path.join(workDir, 'extracted');
            await fsp.mkdir(extractDir);
            await execFileAsync('unzip', ['-q', archivePath, '-d', extractDir], { timeout: 30000 });
            const entries = await fsp.readdir(extractDir, { withFileTypes: true });
            const root = entries.find(entry => entry.isDirectory());
            const source = root && path.join(extractDir, root.name, folder);
            if (!source || !fs.existsSync(source) || !fs.statSync(source).isDirectory()) {
                await fsp.rm(extractDir, { recursive: true, force: true });
                continue;
            }

            const workshopDir = path.join(__dirname, 'workshop');
            const backupDir = path.join(workDir, 'previous-workshop');
            await fsp.cp(workshopDir, backupDir, { recursive: true });
            const clearWorkshop = async () => {
                const existingFiles = await fsp.readdir(workshopDir);
                await Promise.all(existingFiles.map(file =>
                    fsp.rm(path.join(workshopDir, file), { recursive: true, force: true })
                ));
            };
            const copyWorkshopContents = async (from) => {
                const files = await fsp.readdir(from);
                await Promise.all(files.map(file =>
                    fsp.cp(path.join(from, file), path.join(workshopDir, file), { recursive: true })
                ));
            };

            await clearWorkshop();
            try {
                await copyWorkshopContents(source);
            } catch (err) {
                await clearWorkshop();
                await copyWorkshopContents(backupDir);
                throw err;
            }

            const files = await fsp.readdir(workshopDir, { recursive: true });
            return { files: files.length };
        }

        throw new Error('The URL did not resolve to a GitHub folder. Check the branch and folder path.');
    } finally {
        await fsp.rm(workDir, { recursive: true, force: true });
    }
}

app.post('/api/workshop/load', async (req, res) => {
    if (typeof req.body.url !== 'string' || !req.body.url.trim()) {
        return res.status(400).json({ error: 'A GitHub folder URL is required.' });
    }

    try {
        const result = await downloadGitHubFolder(req.body.url.trim());
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('Workshop load error:', err);
        res.status(400).json({ error: err.message || 'Failed to load workshop.' });
    }
});

// API to handle clipboard from terminal
app.post('/clipboard', (req, res) => {
    const { data } = req.body;
    if (data) {
        try {
            const text = Buffer.from(data, 'base64').toString('utf-8');
            io.emit('clipboard-copy', { text });
            res.json({ success: true });
        } catch (e) {
            console.error('Clipboard decode error:', e);
            res.status(500).json({ error: 'Decode failed' });
        }
    } else {
        res.status(400).json({ error: 'Invalid request' });
    }
});

// API to list slides
app.get('/api/slides', (req, res) => {
    const slidesDir = path.join(__dirname, 'workshop');
    if (!fs.existsSync(slidesDir)) {
        return res.json([]);
    }
    const files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.md') && f !== "README.md");
    res.json(files);
});

// API to get slide content
app.get('/api/slides/:filename', (req, res) => {
    const filepath = path.join(__dirname, 'workshop', req.params.filename);
    if (fs.existsSync(filepath)) {
        res.send(fs.readFileSync(filepath, 'utf8'));
    } else {
        res.status(404).send('Not found');
    }
});

// API to save markdown content
app.post('/api/save', (req, res) => {
    const { content, filename } = req.body;
    // Default to README.md if no filename provided
    const targetFile = filename || 'README.md';
    
    // Basic path traversal prevention
    if (targetFile.includes('..') || targetFile.includes('/')) {
        return res.status(400).json({ error: 'Invalid filename' });
    }

    const filepath = path.join(__dirname, 'workshop', targetFile);
    try {
        fs.writeFileSync(filepath, content, 'utf8');
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving file:', err);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

// Socket.io for Terminal
io.on('connection', (socket) => {
    console.log('Client connected');
    const terminals = new Map();

    socket.on('create-terminal', (termId, callback) => {
        const ptyProcess = pty.spawn(start, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
        });

        terminals.set(termId, ptyProcess);

        ptyProcess.onData((data) => {
            socket.emit('terminal-output', { termId, data });
        });

        ptyProcess.onExit(() => {
            socket.emit('terminal-exit', { termId });
            terminals.delete(termId);
        });

        if (callback) callback();
    });

    socket.on('terminal-input', ({ termId, data }) => {
        const term = terminals.get(termId);
        if (term) term.write(data);
    });

    socket.on('terminal-resize', ({ termId, cols, rows }) => {
        const term = terminals.get(termId);
        if (term) term.resize(cols, rows);
    });

    socket.on('close-terminal', ({ termId }) => {
        const term = terminals.get(termId);
        if (term) {
            term.kill();
            terminals.delete(termId);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        terminals.forEach(term => term.kill());
        terminals.clear();
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
