import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import { Resume } from '../models/resume.model';
import uploadService from '../services/upload.service';
import openaiService from '../services/openai.service';
import vectorService from '../services/vector.service';

/**
 * Upload and process a new resume
 */
export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get file path and details
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileUrl = `/uploads/${path.basename(filePath)}`;

    // Parse resume content - implement this based on file type
    // For now, we'll just use a simple text extraction or mock it
    const content = "Full parsed content would go here";
    const plainText = "Plain text extracted from resume";

    // Extract skills using OpenAI
    const extractedSkills = await openaiService.extractSkillsFromResume(plainText);
    const skills = Array.isArray(extractedSkills) ? extractedSkills : 
                   (extractedSkills && typeof extractedSkills === 'object' ? 
                     [...(extractedSkills.technicalSkills || []), 
                      ...(extractedSkills.softSkills || [])] : 
                     []);

    // Create resume record
    const resume = await Resume.create({
      userId: req.userId,
      fileName,
      fileUrl,
      content,
      plainText,
      skills,
      experience: [], // Will be filled in later with parsed data
      education: []   // Will be filled in later with parsed data
    });

    // Generate embedding for the resume asynchronously (don't wait for it)
    if (vectorService && typeof vectorService.generateResumeEmbedding === 'function') {
      vectorService.generateResumeEmbedding(resume.id)
        .catch(err => console.error('Error generating resume embedding:', err));
    }

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume.id,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        skills: resume.skills,
        createdAt: resume.createdAt
      }
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Server error during resume upload' });
  }
};

/**
 * Get all resumes for the authenticated user
 */
export const getUserResumes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const resumes = await Resume.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Resumes retrieved successfully',
      resumes: resumes.map(resume => ({
        id: resume.id,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        skills: resume.skills,
        createdAt: resume.createdAt
      }))
    });
  } catch (error) {
    console.error('Error retrieving resumes:', error);
    res.status(500).json({ message: 'Server error while retrieving resumes' });
  }
};

/**
 * Get a specific resume by ID
 */
export const getResumeById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const resume = await Resume.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.status(200).json({
      message: 'Resume retrieved successfully',
      resume
    });
  } catch (error) {
    console.error('Error retrieving resume:', error);
    res.status(500).json({ message: 'Server error while retrieving resume' });
  }
};

/**
 * Analyze a resume using OpenAI
 */
export const analyzeResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const resumeId = req.params.id;

    const resume = await Resume.findOne({
      where: {
        id: resumeId,
        userId: req.userId
      }
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Analyze resume with OpenAI
    const analysis = await openaiService.analyzeResume(resume.plainText);

    res.status(200).json({
      message: 'Resume analyzed successfully',
      analysis
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ message: 'Server error during resume analysis' });
  }
};

/**
 * Delete a resume
 */
export const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const resumeId = req.params.id;

    const resume = await Resume.findOne({
      where: {
        id: resumeId,
        userId: req.userId
      }
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Get file path
    const filePath = path.join(__dirname, '../../uploads', path.basename(resume.fileUrl));

    // Delete file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete resume from database
    await resume.destroy();

    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Server error during resume deletion' });
  }
};

/**
 * Find matching jobs for a resume
 */
export const findMatchingJobs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const resumeId = req.params.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const minScore = req.query.minScore ? parseFloat(req.query.minScore as string) : 0.7;

    const resume = await Resume.findOne({
      where: {
        id: resumeId,
        userId: req.userId
      }
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Find matching jobs
    const matches = await vectorService.findMatchingJobs(resumeId, limit, minScore);

    res.status(200).json({
      message: 'Matching jobs found',
      matches: matches.map(match => ({
        job: {
          id: match.job.id,
          title: match.job.title,
          company: match.job.company,
          location: match.job.location,
          type: match.job.type,
          salary: match.job.salary
        },
        matchScore: Math.round(match.similarityScore * 100)
      }))
    });
  } catch (error) {
    console.error('Error finding matching jobs:', error);
    res.status(500).json({ message: 'Server error while finding matching jobs' });
  }
}; 