import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { 
  uploadResume, 
  getUserResumes, 
  getResumeById, 
  analyzeResume, 
  deleteResume, 
  findMatchingJobs,
  updateResume 
} from '../controllers/resume.controller';
import upload from '../services/upload.service';
import { Resume } from '../models/resume.model';
import vectorService from '../services/vector.service';

// Define interfaces for resume data
interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
}

const router = express.Router();

// Protected routes
router.use(authenticate);

// Upload a new resume
router.post(
  '/upload', 
  upload.single('resume'), 
  uploadResume
);

// Create a resume manually (without file upload)
router.post('/manual', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { title, skills, experience, education, languages, projects, about, contactInfo } = req.body;

    // Create a generic filename if title isn't provided
    const resumeTitle = title || `Resume - ${new Date().toLocaleDateString()}`;
    const fileName = `${resumeTitle}`;
    const fileUrl = '/manual'; // No actual file for manual resumes

    // Create a plaintext version from the submitted data
    let plainText = `Resume: ${resumeTitle}\n\n`;
    
    if (about) {
      plainText += `About:\n${about}\n\n`;
    }
    
    if (skills && skills.length > 0) {
      plainText += `Skills: ${skills.join(', ')}\n\n`;
    }
    
    if (experience && experience.length > 0) {
      plainText += `Experience:\n`;
      experience.forEach((exp: Experience) => {
        plainText += `- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})\n`;
        plainText += `  ${exp.description}\n`;
      });
      plainText += '\n';
    }
    
    if (education && education.length > 0) {
      plainText += `Education:\n`;
      education.forEach((edu: Education) => {
        plainText += `- ${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution} (${edu.startDate} - ${edu.endDate})\n`;
      });
      plainText += '\n';
    }

    // Check if this is the user's first resume
    const resumeCount = await Resume.count({ where: { userId: req.userId } });
    const isPrimary = resumeCount === 0; // Make it primary if it's the first one

    // Create resume record
    const resume = await Resume.create({
      userId: req.userId,
      title: resumeTitle,
      fileName,
      fileUrl,
      content: plainText, // Using the generated plaintext as content as well
      plainText,
      skills: skills || [],
      experience: experience || [],
      education: education || [],
      isPrimary // Default to not primary
    });

    // Optionally generate embedding for the resume asynchronously
    if (vectorService && typeof vectorService.generateResumeEmbedding === 'function') {
      vectorService.generateResumeEmbedding(resume.id)
        .catch(err => console.error('Error generating resume embedding:', err));
    }

    res.status(201).json({
      message: 'Resume created successfully',
      resume: {
        id: resume.id,
        title: resume.title,
        fileName: resume.fileName,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        isPrimary: resume.isPrimary,
        createdAt: resume.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating manual resume:', error);
    res.status(500).json({ message: 'Server error during resume creation' });
  }
});

// Set a resume as primary
router.put('/:id/set-primary', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const resumeId = req.params.id;

    // Find the resume to set as primary
    const resume = await Resume.findOne({
      where: {
        id: resumeId,
        userId: req.userId
      }
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Begin a transaction to ensure data consistency
    const transaction = await Resume.sequelize!.transaction();

    try {
      // Reset isPrimary flag for all user's resumes
      await Resume.update(
        { isPrimary: false },
        { 
          where: { userId: req.userId },
          transaction
        }
      );

      // Set the selected resume as primary
      await resume.update({ isPrimary: true }, { transaction });

      // Commit the transaction
      await transaction.commit();

      res.status(200).json({ 
        message: 'Resume set as primary',
        resumeId: resume.id
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error setting resume as primary:', error);
    res.status(500).json({ message: 'Server error while setting resume as primary' });
  }
});

// Get all resumes for the current user
router.get('/', getUserResumes);

// Get a specific resume by ID
router.get('/:id', getResumeById);

// Update a resume
router.put('/:id', updateResume);

// Analyze a resume
router.get('/:id/analyze', analyzeResume);

// Delete a resume
router.delete('/:id', deleteResume);

// Find matching jobs for a resume
router.get('/:id/matching-jobs', findMatchingJobs);

export const resumeRoutes = router; 