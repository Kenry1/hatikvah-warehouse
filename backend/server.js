const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { googleDriveService } = require('./services/googleDriveService');

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
