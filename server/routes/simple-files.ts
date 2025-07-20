import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

// Import realistic test files data
import { mockFiles as seedFiles } from '../seed-data';

// GET /api/files - Get all files
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    
    // Use seed data files directly
    let filteredFiles = [...seedFiles];
    
    if (category && category !== 'all') {
      filteredFiles = filteredFiles.filter(file => file.category === category);
    }
    
    // Files already have uploader information
    const filesWithUploaders = filteredFiles.map(file => ({
      ...file,
      name: file.originalName, // Map for compatibility with frontend
      uploader: {
        id: file.uploadedBy,
        firstName: file.uploadedBy === 1 ? 'System' : 'Regular',
        lastName: file.uploadedBy === 1 ? 'Admin' : 'User',
        email: file.uploadedBy === 1 ? 'admin@demo.com' : 'user@test.com'
      }
    }));
    
    res.json(filesWithUploaders);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});

// POST /api/simple-files/upload - Upload a file
// POST /api/files/upload - Upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { workspaceId = '1', channelId = 'general' } = req.body;
    
    // Determine file category based on MIME type
    let category = 'documents';
    if (req.file.mimetype.startsWith('image/')) {
      category = 'images';
    } else if (req.file.mimetype.startsWith('video/')) {
      category = 'videos';
    } else if (req.file.mimetype.startsWith('audio/')) {
      category = 'audio';
    }
    
    const newFile = {
      id: (mockFiles.length + 1).toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: 3, // Mock user ID
      uploadedAt: new Date(),
      workspaceId,
      channelId,
      category,
      url: `/uploads/${req.file.filename}`
    };
    
    mockFiles.push(newFile);
    
    const fileWithUploader = {
      ...newFile,
      uploader: {
        id: 3,
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@test.com'
      }
    };
    
    res.status(201).json(fileWithUploader);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// GET /api/simple-files/:id - Get a specific file
router.get('/simple-files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = mockFiles.find(f => f.id === fileId);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const fileWithUploader = {
      ...file,
      uploader: {
        id: file.uploadedBy,
        firstName: file.uploadedBy === 1 ? 'System' : 'Regular',
        lastName: file.uploadedBy === 1 ? 'Admin' : 'User',
        email: file.uploadedBy === 1 ? 'admin@demo.com' : 'user@test.com'
      }
    };
    
    res.json(fileWithUploader);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Failed to fetch file' });
  }
});

// DELETE /api/simple-files/:id - Delete a file
// POST /api/simple-files/upload-multiple - Upload multiple files
router.post('/simple-files/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const { workspaceId = '1', channelId = 'general' } = req.body;
    const uploadedFiles = [];
    
    for (const file of req.files) {
      // Determine file category based on MIME type
      let category = 'documents';
      if (file.mimetype.startsWith('image/')) {
        category = 'images';
      } else if (file.mimetype.startsWith('video/')) {
        category = 'videos';
      } else if (file.mimetype.startsWith('audio/')) {
        category = 'audio';
      }
      
      const newFile = {
        id: (mockFiles.length + uploadedFiles.length + 1).toString(),
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedBy: 3, // Mock user ID
        uploadedAt: new Date(),
        workspaceId,
        channelId,
        category,
        url: `/uploads/${file.filename}`
      };
      
      mockFiles.push(newFile);
      uploadedFiles.push({
        ...newFile,
        uploader: {
          id: 3,
          firstName: 'Regular',
          lastName: 'User',
          email: 'user@test.com'
        }
      });
    }
    
    res.status(201).json({
      files: uploadedFiles,
      totalUploaded: uploadedFiles.length,
      totalRequested: req.files.length
    });
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    res.status(500).json({ message: 'Failed to upload files' });
  }
});

router.delete('/simple-files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const fileIndex = mockFiles.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const file = mockFiles[fileIndex];
    
    // Try to delete the actual file from disk
    try {
      const filePath = path.join(process.cwd(), 'uploads', file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsError) {
      console.warn('Could not delete file from disk:', fsError);
    }
    
    mockFiles.splice(fileIndex, 1);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

// GET /api/simple-files/:id/download - Download a file
router.get('/simple-files/:id/download', async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = mockFiles.find(f => f.id === fileId);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const filePath = path.join(process.cwd(), 'uploads', file.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }
    
    res.download(filePath, file.originalName);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

export default router;