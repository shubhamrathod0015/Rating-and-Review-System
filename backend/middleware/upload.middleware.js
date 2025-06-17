import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { ApiError } from './ApiError.js';
import { asyncHandler } from './asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/reviews');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `review-${uniqueSuffix}${extension}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new ApiError(400, 'Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 5 // Maximum 5 files per review
    },
    fileFilter: fileFilter
});

// Middleware for handling file uploads in reviews
const uploadReviewPhotos = upload.array('photos', 5);

// Error handling wrapper
const handleUploadErrors = (req, res, next) => {
    uploadReviewPhotos(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                throw new ApiError(400, 'File size too large. Maximum size is 5MB per file.');
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                throw new ApiError(400, 'Too many files. Maximum 5 files allowed per review.');
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                throw new ApiError(400, 'Unexpected file field. Use "photos" field for uploading images.');
            }
            throw new ApiError(400, `Upload error: ${err.message}`);
        } else if (err) {
            if (err instanceof ApiError) {
                throw err;
            }
            throw new ApiError(400, err.message);
        }
        
        // Process uploaded files
        if (req.files && req.files.length > 0) {
            req.uploadedPhotos = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                path: `/uploads/reviews/${file.filename}`
            }));
        }
        
        next();
    });
};

// Utility function to delete uploaded files
const deleteFiles = (filePaths) => {
    if (!Array.isArray(filePaths)) return;
    
    filePaths.forEach(filePath => {
        const fullPath = path.join(__dirname, '../uploads/reviews', path.basename(filePath));
        fs.unlink(fullPath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Error deleting file:', fullPath, err);
            }
        });
    });
};

// Clean up orphaned files (files not referenced in database)
const cleanupOrphanedFiles = asyncHandler(async () => {
    try {
        // Get all file paths from database
        const reviews = await prisma.review.findMany({
            where: {
                photos: {
                    not: null
                }
            },
            select: {
                photos: true
            }
        });
        
        const dbFiles = new Set();
        reviews.forEach(review => {
            if (review.photos && Array.isArray(review.photos)) {
                review.photos.forEach(photo => {
                    if (photo.path) {
                        dbFiles.add(path.basename(photo.path));
                    }
                });
            }
        });
        
        // Get all files in upload directory
        if (fs.existsSync(uploadDir)) {
            const uploadFiles = fs.readdirSync(uploadDir);
            
            // Delete files not in database
            uploadFiles.forEach(file => {
                if (!dbFiles.has(file)) {
                    const filePath = path.join(uploadDir, file);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting orphaned file:', filePath, err);
                        } else {
                            console.log('Deleted orphaned file:', file);
                        }
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
});

// Middleware to validate uploaded photos
const validatePhotos = (req, res, next) => {
    if (req.uploadedPhotos && req.uploadedPhotos.length > 0) {
        // Validate each photo
        for (const photo of req.uploadedPhotos) {
            if (photo.size > 5 * 1024 * 1024) {
                // Clean up uploaded files if validation fails
                deleteFiles(req.uploadedPhotos.map(p => p.path));
                throw new ApiError(400, 'One or more files exceed the 5MB size limit');
            }
        }
        
        // Add photo data to request body