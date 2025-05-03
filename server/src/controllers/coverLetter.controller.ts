import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CoverLetter } from '../models/coverLetter.model';
import { Job } from '../models/job.model';
import { Resume } from '../models/resume.model';
import openaiService from '../services/openai.service';

/**
 * Generate a cover letter
 */
export const generateCoverLetter = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { resumeId, jobId, additionalInfo } = req.body;

    if (!resumeId || !jobId) {
      return res.status(400).json({ message: 'Resume ID and Job ID are required' });
    }

    // Get resume
    const resume = await Resume.findOne({
      where: {
        id: resumeId,
        userId: req.userId
      }
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Get job
    const job = await Job.findByPk(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // User info for customization
    const userInfo = {
      additionalInfo,
      resumeId,
      jobId
    };

    // Generate cover letter with OpenAI
    const coverLetterContent = await openaiService.generateCoverLetter(
      resume.plainText,
      `${job.title} at ${job.company}\n\n${job.description}\n\n${job.requirements}`,
      userInfo
    );

    // Save the cover letter
    const coverLetter = await CoverLetter.create({
      userId: req.userId,
      jobId,
      content: coverLetterContent
    });

    res.status(201).json({
      message: 'Cover letter generated successfully',
      coverLetter
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ message: 'Server error during cover letter generation' });
  }
};

/**
 * Get all cover letters for the user
 */
export const getUserCoverLetters = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const coverLetters = await CoverLetter.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'company']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Cover letters retrieved successfully',
      coverLetters
    });
  } catch (error) {
    console.error('Error retrieving cover letters:', error);
    res.status(500).json({ message: 'Server error while retrieving cover letters' });
  }
};

/**
 * Get cover letter by ID
 */
export const getCoverLetterById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const coverLetter = await CoverLetter.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'company', 'location']
        }
      ]
    });

    if (!coverLetter) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }

    res.status(200).json({
      message: 'Cover letter retrieved successfully',
      coverLetter
    });
  } catch (error) {
    console.error('Error retrieving cover letter:', error);
    res.status(500).json({ message: 'Server error while retrieving cover letter' });
  }
};

/**
 * Update cover letter
 */
export const updateCoverLetter = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Find cover letter
    const coverLetter = await CoverLetter.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!coverLetter) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }

    // Update cover letter
    await coverLetter.update({ content });

    res.status(200).json({
      message: 'Cover letter updated successfully',
      coverLetter
    });
  } catch (error) {
    console.error('Error updating cover letter:', error);
    res.status(500).json({ message: 'Server error during cover letter update' });
  }
};

/**
 * Delete cover letter
 */
export const deleteCoverLetter = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find cover letter
    const coverLetter = await CoverLetter.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!coverLetter) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }

    // Delete cover letter
    await coverLetter.destroy();

    res.status(200).json({ message: 'Cover letter deleted successfully' });
  } catch (error) {
    console.error('Error deleting cover letter:', error);
    res.status(500).json({ message: 'Server error during cover letter deletion' });
  }
}; 