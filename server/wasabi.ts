import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import mime from 'mime-types';
import crypto from 'crypto';
import path from 'path';

// Initialize Wasabi S3 client
const wasabiClient = new S3Client({
  endpoint: process.env.WASABI_ENDPOINT,
  region: 'us-east-1', // Wasabi uses us-east-1 as default
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY!,
    secretAccessKey: process.env.WASABI_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for Wasabi
});

const BUCKET_NAME = process.env.WASABI_BUCKET!;

export interface UploadResult {
  url: string;
  key: string;
  filename: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

export interface FileMetadata {
  originalName: string;
  size: number;
  mimetype: string;
  uploadedBy: string;
  channel?: string;
  workspace?: string;
  category: 'document' | 'image' | 'video' | 'audio' | 'other';
}

// Generate a unique file key
function generateFileKey(originalName: string, category: string, userId: string): string {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  
  return `${category}/${userId}/${timestamp}_${randomId}_${baseName}${ext}`;
}

// Determine file category based on mimetype
function getFileCategory(mimetype: string): 'document' | 'image' | 'video' | 'audio' | 'other' {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.includes('pdf') || 
      mimetype.includes('document') || 
      mimetype.includes('spreadsheet') || 
      mimetype.includes('presentation') ||
      mimetype.includes('text/')) return 'document';
  return 'other';
}

// Upload file to Wasabi
export async function uploadFileToWasabi(
  fileBuffer: Buffer,
  originalName: string,
  mimetype: string,
  metadata: Omit<FileMetadata, 'originalName' | 'size' | 'mimetype' | 'category'>
): Promise<UploadResult> {
  try {
    const category = getFileCategory(mimetype);
    const fileKey = generateFileKey(originalName, category, metadata.uploadedBy);
    
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimetype,
      Metadata: {
        originalName,
        uploadedBy: metadata.uploadedBy,
        channel: metadata.channel || '',
        workspace: metadata.workspace || '',
        category,
        uploadedAt: new Date().toISOString(),
      },
    });

    await wasabiClient.send(uploadCommand);

    // Generate the public URL
    const fileUrl = `${process.env.WASABI_ENDPOINT}/${BUCKET_NAME}/${fileKey}`;

    return {
      url: fileUrl,
      key: fileKey,
      filename: originalName,
      size: fileBuffer.length,
      mimetype,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error uploading to Wasabi:', error);
    throw new Error(`Failed to upload file: ${error}`);
  }
}

// Generate a presigned URL for secure file access
export async function getPresignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    return await getSignedUrl(wasabiClient, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error(`Failed to generate download URL: ${error}`);
  }
}

// Delete file from Wasabi
export async function deleteFileFromWasabi(fileKey: string): Promise<void> {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await wasabiClient.send(deleteCommand);
  } catch (error) {
    console.error('Error deleting from Wasabi:', error);
    throw new Error(`Failed to delete file: ${error}`);
  }
}

// List files in a specific category or path
export async function listFiles(prefix?: string, maxKeys: number = 100) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await wasabiClient.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error(`Failed to list files: ${error}`);
  }
}

// Get file metadata
export async function getFileMetadata(fileKey: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const response = await wasabiClient.send(command);
    return {
      size: response.ContentLength,
      mimetype: response.ContentType,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error(`Failed to get file metadata: ${error}`);
  }
}

// Helper function to validate file types
export function validateFileType(mimetype: string, allowedTypes?: string[]): boolean {
  if (!allowedTypes) return true;
  
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return mimetype.startsWith(type.slice(0, -1));
    }
    return mimetype === type;
  });
}

// Helper function to validate file size
export function validateFileSize(size: number, maxSizeMB: number = 100): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}