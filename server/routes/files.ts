import { Router } from "express";
import multer from "multer";
import { 
  uploadFileToWasabi, 
  getPresignedUrl, 
  deleteFileFromWasabi, 
  listFiles,
  validateFileType,
  validateFileSize
} from "../wasabi";
import { storage } from "../storage";

const router = Router();

// Configure multer for memory storage (we'll upload to Wasabi)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types - we'll validate based on use case
    cb(null, true);
  },
});

// Upload single file
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { workspaceId, channelId, messageId } = req.body;

    // Validate file size (100MB max)
    if (!validateFileSize(req.file.size, 100)) {
      return res.status(400).json({ error: "File size too large. Maximum 100MB allowed." });
    }

    // Upload to Wasabi
    const uploadResult = await uploadFileToWasabi(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        uploadedBy: req.user.id.toString(),
        workspace: workspaceId,
        channel: channelId,
      }
    );

    // Save file metadata to database
    const [fileRecord] = await db.insert(files).values({
      filename: uploadResult.filename,
      originalName: req.file.originalname,
      wasabiKey: uploadResult.key,
      wasabiUrl: uploadResult.url,
      mimeType: req.file.mimetype,
      category: uploadResult.key.split('/')[0], // Extract category from key
      size: req.file.size,
      uploadedBy: req.user.id,
      workspaceId: workspaceId || null,
      channelId: channelId || null,
      messageId: messageId || null,
    }).returning();

    res.json({
      success: true,
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        url: uploadResult.url,
        mimeType: fileRecord.mimeType,
        category: fileRecord.category,
        size: fileRecord.size,
        uploadedAt: uploadResult.uploadedAt,
      }
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

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { workspaceId, channelId, messageId } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        // Validate file size
        if (!validateFileSize(file.size, 100)) {
          console.warn(`Skipping ${file.originalname}: File too large`);
          continue;
        }

        // Upload to Wasabi
        const uploadResult = await uploadFileToWasabi(
          file.buffer,
          file.originalname,
          file.mimetype,
          {
            uploadedBy: req.user.id.toString(),
            workspace: workspaceId,
            channel: channelId,
          }
        );

        // Save to database
        const [fileRecord] = await db.insert(files).values({
          filename: uploadResult.filename,
          originalName: file.originalname,
          wasabiKey: uploadResult.key,
          wasabiUrl: uploadResult.url,
          mimeType: file.mimetype,
          category: uploadResult.key.split('/')[0],
          size: file.size,
          uploadedBy: req.user.id,
          workspaceId: workspaceId || null,
          channelId: channelId || null,
          messageId: messageId || null,
        }).returning();

        uploadedFiles.push({
          id: fileRecord.id,
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          url: uploadResult.url,
          mimeType: fileRecord.mimeType,
          category: fileRecord.category,
          size: fileRecord.size,
          uploadedAt: uploadResult.uploadedAt,
        });
      } catch (fileError) {
        console.error(`Error uploading ${file.originalname}:`, fileError);
        // Continue with other files
      }
    }

    res.json({
      success: true,
      files: uploadedFiles,
      totalUploaded: uploadedFiles.length,
      totalRequested: req.files.length,
    });
  } catch (error) {
    console.error("Multiple file upload error:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
});

// Get file by ID with download URL
router.get("/:fileId", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const fileRecord = await db.query.files.findFirst({
      where: eq(files.id, req.params.fileId),
    });

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    // Generate presigned URL for secure download
    const downloadUrl = await getPresignedUrl(fileRecord.wasabiKey, 3600); // 1 hour expiry

    // Increment download count
    await db.update(files)
      .set({ 
        downloadCount: fileRecord.downloadCount + 1,
        updatedAt: new Date()
      })
      .where(eq(files.id, req.params.fileId));

    res.json({
      id: fileRecord.id,
      filename: fileRecord.filename,
      originalName: fileRecord.originalName,
      downloadUrl,
      mimeType: fileRecord.mimeType,
      category: fileRecord.category,
      size: fileRecord.size,
      downloadCount: fileRecord.downloadCount + 1,
      uploadedAt: fileRecord.createdAt,
    });
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({ error: "Failed to retrieve file" });
  }
});

// List files by workspace/channel
router.get("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { workspaceId, channelId, category, page = 1, limit = 20 } = req.query;

    let whereConditions = [eq(files.isActive, true)];

    if (workspaceId) {
      whereConditions.push(eq(files.workspaceId, workspaceId as string));
    }

    if (channelId) {
      whereConditions.push(eq(files.channelId, channelId as string));
    }

    if (category) {
      whereConditions.push(eq(files.category, category as string));
    }

    const offset = (Number(page) - 1) * Number(limit);

    const fileRecords = await db.query.files.findMany({
      where: and(...whereConditions),
      orderBy: [desc(files.createdAt)],
      limit: Number(limit),
      offset,
      with: {
        uploadedBy: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    const filesWithUrls = await Promise.all(
      fileRecords.map(async (file) => {
        try {
          const downloadUrl = await getPresignedUrl(file.wasabiKey, 3600);
          return {
            id: file.id,
            filename: file.filename,
            originalName: file.originalName,
            downloadUrl,
            mimeType: file.mimeType,
            category: file.category,
            size: file.size,
            downloadCount: file.downloadCount,
            uploadedBy: file.uploadedBy,
            uploadedAt: file.createdAt,
          };
        } catch (error) {
          console.error(`Error generating URL for file ${file.id}:`, error);
          return {
            id: file.id,
            filename: file.filename,
            originalName: file.originalName,
            downloadUrl: null,
            mimeType: file.mimeType,
            category: file.category,
            size: file.size,
            downloadCount: file.downloadCount,
            uploadedBy: file.uploadedBy,
            uploadedAt: file.createdAt,
          };
        }
      })
    );

    res.json({
      files: filesWithUrls,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasMore: fileRecords.length === Number(limit),
      }
    });
  } catch (error) {
    console.error("List files error:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

// Delete file
router.delete("/:fileId", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const fileRecord = await db.query.files.findFirst({
      where: eq(files.id, req.params.fileId),
    });

    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check if user has permission to delete (owner or admin)
    if (fileRecord.uploadedBy !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Delete from Wasabi
    await deleteFileFromWasabi(fileRecord.wasabiKey);

    // Soft delete from database
    await db.update(files)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(files.id, req.params.fileId));

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// Get file statistics
router.get("/stats/overview", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { workspaceId } = req.query;

    let whereConditions = [eq(files.isActive, true)];
    if (workspaceId) {
      whereConditions.push(eq(files.workspaceId, workspaceId as string));
    }

    // This would need proper aggregation - simplified for now
    const allFiles = await db.query.files.findMany({
      where: and(...whereConditions),
    });

    const stats = {
      totalFiles: allFiles.length,
      totalSize: allFiles.reduce((acc, file) => acc + file.size, 0),
      categories: {
        document: allFiles.filter(f => f.category === 'document').length,
        image: allFiles.filter(f => f.category === 'image').length,
        video: allFiles.filter(f => f.category === 'video').length,
        audio: allFiles.filter(f => f.category === 'audio').length,
        other: allFiles.filter(f => f.category === 'other').length,
      },
      recentUploads: allFiles
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(file => ({
          id: file.id,
          filename: file.filename,
          category: file.category,
          size: file.size,
          uploadedAt: file.createdAt,
        })),
    };

    res.json(stats);
  } catch (error) {
    console.error("Get file stats error:", error);
    res.status(500).json({ error: "Failed to get file statistics" });
  }
});

export default router;