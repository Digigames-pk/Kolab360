import { Router } from "express";
import multer from "multer";
import { storage } from "../storage";

const router = Router();

// Configure multer for simple file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Get files
router.get("/", async (req, res) => {
  try {
    const { workspaceId, channelId, category } = req.query;
    
    // For now, return mock data to get it working
    const mockFiles = [
      {
        id: "1",
        filename: "document.pdf",
        originalName: "Project Requirements.pdf",
        mimeType: "application/pdf",
        category: "document",
        size: 1024000,
        uploadedAt: new Date().toISOString(),
        downloadCount: 5,
        uploadedBy: {
          id: 1,
          firstName: "John",
          lastName: "Doe"
        }
      },
      {
        id: "2", 
        filename: "image.jpg",
        originalName: "Team Photo.jpg",
        mimeType: "image/jpeg",
        category: "image",
        size: 2048000,
        uploadedAt: new Date().toISOString(),
        downloadCount: 12,
        uploadedBy: {
          id: 2,
          firstName: "Jane",
          lastName: "Smith"
        }
      }
    ];

    let filteredFiles = mockFiles;
    
    // Apply category filter
    if (category && category !== 'all') {
      filteredFiles = mockFiles.filter(file => file.category === category);
    }

    res.json({ files: filteredFiles });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// Upload single file
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { workspaceId, channelId } = req.body;
    
    // For now, return mock successful response
    const mockFile = {
      id: Date.now().toString(),
      filename: req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      category: req.file.mimetype.startsWith('image/') ? 'image' : 
                req.file.mimetype.startsWith('video/') ? 'video' : 'document',
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
      uploadedBy: {
        id: 1,
        firstName: "Current",
        lastName: "User"
      }
    };

    res.json({
      success: true,
      file: mockFile
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Upload multiple files
router.post("/upload-multiple", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const { workspaceId, channelId } = req.body;
    
    // For now, return mock successful response
    const mockFiles = req.files.map((file, index) => ({
      id: (Date.now() + index).toString(),
      filename: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      category: file.mimetype.startsWith('image/') ? 'image' : 
                file.mimetype.startsWith('video/') ? 'video' : 'document',
      size: file.size,
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
      uploadedBy: {
        id: 1,
        firstName: "Current",
        lastName: "User"
      }
    }));

    res.json({
      success: true,
      files: mockFiles,
      totalUploaded: mockFiles.length,
      totalRequested: req.files.length
    });
  } catch (error) {
    console.error("Multiple file upload error:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
});

// Delete file
router.delete("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // For now, return mock successful response
    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;