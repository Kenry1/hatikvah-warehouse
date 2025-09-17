const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { googleDriveService } = require('./services/googleDriveService');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents and images are allowed.'), false);
    }
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Site Documentation Backend is running' });
});

// Gemini model setup (reused)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
let genAIInstance = null;
if (GEMINI_API_KEY) {
  try { genAIInstance = new GoogleGenerativeAI(GEMINI_API_KEY); } catch (e) { console.error('Failed to init Gemini client', e); }
}

function ensureModel() {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  if (!genAIInstance) genAIInstance = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAIInstance.getGenerativeModel({ model: GEMINI_MODEL });
}

// AI Assistant Chat Route
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { messages } = req.body || {};
    const userId = req.header('X-User-Id') || null;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'messages array required' });
    }
    const model = ensureModel();
    const systemPrompt = `You are a material request assistant. Output concise, helpful replies. If the user is ready to submit or has provided site, priority and at least one item, include a JSON block: {"action":"create_request","siteName":"...","priority":"...","items":[{"materialName":"...","quantity":1}],"notes":"..."}`;
    const history = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const finalInput = systemPrompt + '\n' + history;
    const result = await model.generateContent(finalInput);
    const text = result.response.text();
    let action = null;
    const jsonMatch = text.match(/\{[\s\S]*?"action"[\s\S]*?\}/);
    if (jsonMatch) { try { action = JSON.parse(jsonMatch[0]); } catch {} }
    res.json({ reply: text, action, userId, model: GEMINI_MODEL });
  } catch (e) {
    console.error('Gemini chat error', e);
    res.status(500).json({ error: 'Gemini request failed', details: e.message });
  }
});

// Streaming variant
app.post('/api/assistant/chat/stream', async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'messages array required' });
    }
    const model = ensureModel();
    const systemPrompt = `You are a material request assistant. Stream natural language. If ready to submit, include JSON action: {"action":"create_request",...}`;
    const history = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const finalInput = systemPrompt + '\n' + history;
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' });
    const result = await model.generateContentStream(finalInput);
    let full = '';
    for await (const chunk of result.stream) {
      const part = chunk.text();
      full += part;
      res.write(part);
    }
    const jsonMatch = full.match(/\{[\s\S]*?"action"[\s\S]*?\}/);
    if (jsonMatch) res.write(`\n[ACTION_JSON]${jsonMatch[0]}[/ACTION_JSON]`);
    res.end();
  } catch (e) {
    console.error('Streaming chat error', e);
    if (!res.headersSent) res.status(500).json({ error: 'stream failed', details: e.message }); else res.end('\n[ERROR]');
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 Upload request received');
    console.log('Files:', req.file ? 'Present' : 'Missing');
    console.log('Body:', req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { siteId, siteName, title } = req.body;

    // Validate required fields
    if (!title || !siteId) {
      console.log('❌ Validation failed - Missing title or siteId');
      return res.status(400).json({
        success: false,
        error: 'Title and Site ID are required'
      });
    }

    console.log('✅ Validation passed, proceeding with upload...');

    // Upload to Google Drive
    const fileId = await googleDriveService.uploadFile(req.file, {
      title: title || req.file.originalname.split('.')[0],
      siteId,
      siteName,
      uploadDate: new Date().toISOString(),
      uploader: 'Site Documentation System'
    });

    if (!fileId) {
      throw new Error('Failed to upload file to Google Drive');
    }

    // Get public URL
    const fileUrl = await googleDriveService.getFileUrl(fileId);

    res.json({
      success: true,
      data: {
        id: fileId,
        fileName: req.file.originalname,
        fileUrl,
        title: title || req.file.originalname.split('.')[0],
        siteId,
        siteName,
        uploadDate: new Date().toISOString(),
        fileSize: req.file.size
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload file'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 50MB.'
      });
    }
  }

  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Site Documentation Backend running on port ${PORT}`);
  console.log(`📁 Google Drive Folder: 1qWrBDsrm-Ghih3sfL0MsBiXx4vNLLKXx`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8081'}`);
});
