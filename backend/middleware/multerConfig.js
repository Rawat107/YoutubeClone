import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create upload directories
ensureDirectoryExists('uploads');
ensureDirectoryExists('uploads/videos');
ensureDirectoryExists('uploads/thumbnails');

// Storage configuration.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, 'uploads/videos/');
    } else if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails/');
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    if (file.fieldname === 'video') {
      const extension = path.extname(file.originalname);
      cb(null, `video-${uniqueSuffix}${extension}`);
    } else if (file.fieldname === 'thumbnail') {
      // Force JPG extension for thumbnails regardless of original format
      cb(null, `thumbnail-${uniqueSuffix}.jpg`);
    }
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for video upload'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    // Accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnail upload'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for videos
  },
  onError: (err, next) => {
    console.error('Multer error:', err);
    next(err);
  }
});

// Custom middleware for handling file size limits by field
const uploadWithLimits = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]);

  uploadFields(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large. Videos must be under 500MB, thumbnails under 5MB.'
        });
      }

      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          error: 'Unexpected file field. Only video and thumbnail files are allowed.'
        });
      }

      return res.status(400).json({ error: err.message });
    }

    next();
  });
};

export default uploadWithLimits;