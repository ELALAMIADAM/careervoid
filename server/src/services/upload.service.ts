import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { Request } from 'express';
import pdf from 'pdf-parse';
// Use a workaround to avoid TypeScript error
const docxParser: any = require('docx-parser');
import mammoth from 'mammoth';

// Promisify docx-parser
const parseDocx = promisify(docxParser.parseDocx);

// Define upload directory
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Define storage location and filename strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    // Format: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter function to allow only certain file types
const fileFilter = (req: any, file: any, cb: any) => {
  // Accept pdfs and docs
  const allowedFileTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

/**
 * Parse resume file content
 * @param filePath Path to the uploaded file
 * @returns Parsed content and plain text
 */
const parseResumeFile = async (filePath: string) => {
  try {
    const extname = path.extname(filePath).toLowerCase();
    let content = '';
    let plainText = '';
    
    if (extname === '.pdf') {
      // Parse PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      content = pdfData.text;
      plainText = pdfData.text;
      
    } else if (extname === '.docx') {
      // Parse DOCX
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
      plainText = result.value;
      
    } else if (extname === '.doc') {
      // Parse DOC (legacy format)
      content = await parseDocx(filePath);
      plainText = content.replace(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags
      
    } else if (extname === '.txt') {
      // Parse TXT
      content = fs.readFileSync(filePath, 'utf8');
      plainText = content;
    }
    
    return { content, plainText };
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw new Error('Failed to parse resume file');
  }
};

/**
 * Delete file from uploads directory
 * @param filePath Path to the file
 */
const deleteFile = async (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

// Export all functions and constants
export default upload;
export { parseResumeFile, deleteFile, UPLOAD_DIR }; 