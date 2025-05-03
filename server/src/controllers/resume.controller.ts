import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import { Resume } from '../models/resume.model';
import uploadService, { parseResumeFile } from '../services/upload.service';
import openaiService from '../services/openai.service';
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

interface ParsedResumeData {
  experience: Experience[];
  education: Education[];
  languages: string[];
  projects: any[];
  contactInfo: any;
}

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

    // Check if we should parse the content from the resume
    const parseContent = req.body.parseContent === 'true';

    // Get file path and details
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileUrl = `/uploads/${path.basename(filePath)}`;
    
    // Set the title to the original filename without extension
    const fileExtension = fileName.lastIndexOf('.');
    const title = fileExtension > 0 ? fileName.substring(0, fileExtension) : fileName;

    // Parse resume content from the file
    const parsedFile = await parseResumeFile(filePath);
    const { content, plainText } = parsedFile;

    let skills: string[] = [];
    let parsedData: ParsedResumeData = {
      experience: [],
      education: [],
      languages: [],
      projects: [],
      contactInfo: {}
    };

    // Only extract data if parseContent is true
    if (parseContent) {
      // Extract skills using OpenAI
      const extractedSkills = await openaiService.extractSkillsFromResume(plainText);
      skills = Array.isArray(extractedSkills) ? extractedSkills : 
                (extractedSkills && typeof extractedSkills === 'object' ? 
                  [...(extractedSkills.technicalSkills || []), 
                   ...(extractedSkills.softSkills || [])] : 
                  []);

      // Extract experience and education using OpenAI
      // This would be a more complex prompt in a real implementation
      const parsePrompt = `
        Parse the following resume text and extract the following information:
        1. Work experience (company, position, dates, description)
        2. Education (institution, degree, field of study, dates)
        3. Languages
        4. Projects (if any)
        5. Contact information

        Resume text:
        ${plainText}

        Return the result as a JSON object with the following structure:
        {
          "experience": [
            {
              "company": "Company name",
              "position": "Job title",
              "startDate": "Start date (MM/YYYY)",
              "endDate": "End date (MM/YYYY) or 'Present'",
              "description": "Job description"
            }
          ],
          "education": [
            {
              "institution": "University name",
              "degree": "Degree",
              "fieldOfStudy": "Field of study",
              "startDate": "Start date (MM/YYYY)",
              "endDate": "End date (MM/YYYY)"
            }
          ],
          "languages": ["Language 1", "Language 2"],
          "projects": [
            {
              "name": "Project name",
              "description": "Project description",
              "technologies": ["Tech 1", "Tech 2"]
            }
          ],
          "contactInfo": {
            "email": "email@example.com",
            "phone": "123-456-7890",
            "linkedin": "linkedin profile",
            "github": "github profile",
            "website": "personal website"
          }
        }
      `;

      try {
        // In a real implementation, this would use the OpenAI API
        // const parsedResponse = await openaiService.parseResumeData(plainText);
        // parsedData = parsedResponse;
        
        // For now, we'll just mock some data extraction
        // Remove this in production and use the real OpenAI parsing
        if (plainText.includes("experience") || plainText.includes("work")) {
          parsedData.experience = [{
            company: "Example Company",
            position: "Software Developer",
            startDate: "01/2020",
            endDate: "Present",
            description: "Worked on various projects"
          }];
        }
        
        if (plainText.includes("education") || plainText.includes("university")) {
          parsedData.education = [{
            institution: "Example University",
            degree: "Bachelor's",
            fieldOfStudy: "Computer Science",
            startDate: "09/2016",
            endDate: "06/2020"
          }];
        }
      } catch (parseError) {
        console.error('Error parsing resume details:', parseError);
        // Continue with basic data if parsing fails
      }
    }

    // Check if this is the user's first resume
    const resumeCount = await Resume.count({ where: { userId: req.userId } });
    const isPrimary = resumeCount === 0; // Make it primary if it's the first one

    // Create resume record
    const resume = await Resume.create({
      userId: req.userId,
      title,
      fileName,
      fileUrl,
      content,
      plainText,
      skills,
      experience: parsedData.experience || [],
      education: parsedData.education || [],
      isPrimary
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
        title: resume.title,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        isPrimary: resume.isPrimary,
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
        title: resume.title,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        languages: resume.languages || [],
        projects: resume.projects || [],
        about: resume.about || '',
        contactInfo: resume.contactInfo || {},
        isPrimary: resume.isPrimary,
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
      resume: {
        id: resume.id,
        title: resume.title,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        languages: resume.languages || [],
        projects: resume.projects || [],
        about: resume.about || '',
        contactInfo: resume.contactInfo || {},
        isPrimary: resume.isPrimary,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      }
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

    // Check if this was the primary resume
    const wasPrimary = resume.isPrimary;

    // Delete resume from database
    await resume.destroy();

    // If this was the primary resume, set another resume as primary if available
    if (wasPrimary) {
      const anotherResume = await Resume.findOne({
        where: { userId: req.userId },
        order: [['createdAt', 'DESC']]
      });

      if (anotherResume) {
        await anotherResume.update({ isPrimary: true });
      }
    }

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

/**
 * Update an existing resume
 */
export const updateResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const resumeId = req.params.id;
    const { title, skills, experience, education, languages, projects, about, contactInfo } = req.body;

    // Find the resume
    const resume = await Resume.findOne({
      where: {
        id: resumeId,
        userId: req.userId
      }
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Update the plaintext content
    let plainText = `Resume: ${title || resume.title}\n\n`;
    
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
        plainText += `- ${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution} (${edu.startDate} - ${edu.endDate || ''})\n`;
      });
      plainText += '\n';
    }
    
    if (languages && languages.length > 0) {
      plainText += `Languages: ${languages.join(', ')}\n\n`;
    }
    
    if (projects && projects.length > 0) {
      plainText += `Projects:\n`;
      projects.forEach((proj: any) => {
        plainText += `- ${proj.name}`;
        if (proj.technologies && proj.technologies.length > 0) {
          plainText += ` (${proj.technologies.join(', ')})`;
        }
        plainText += `\n  ${proj.description}\n`;
      });
      plainText += '\n';
    }

    // Update the resume
    await resume.update({
      title: title || resume.title,
      content: plainText,
      plainText,
      skills: skills || resume.skills,
      experience: experience || resume.experience,
      education: education || resume.education,
      languages: languages || resume.languages,
      projects: projects || resume.projects,
      about: about || resume.about,
      contactInfo: contactInfo || resume.contactInfo
    });

    // If the vector embedding was already generated, regenerate it
    if (resume.vectorEmbedding && vectorService && typeof vectorService.generateResumeEmbedding === 'function') {
      vectorService.generateResumeEmbedding(resume.id)
        .catch(err => console.error('Error regenerating resume embedding:', err));
    }

    res.status(200).json({
      message: 'Resume updated successfully',
      resume: {
        id: resume.id,
        title: resume.title,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        languages: resume.languages || [],
        projects: resume.projects || [],
        about: resume.about || '',
        contactInfo: resume.contactInfo || {},
        isPrimary: resume.isPrimary,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ message: 'Server error during resume update' });
  }
}; 