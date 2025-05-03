import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Job } from '../models/job.model';
import { Resume } from '../models/resume.model';
import { Op } from 'sequelize';
import openaiService from '../services/openai.service';
import vectorService from '../services/vector.service';
import huggingfaceService from '../services/huggingface.service';

/**
 * Create a new job listing
 */
export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, company, location, description, requirements, type, salary } = req.body;

    // Validate input
    if (!title || !company || !location || !description || !requirements || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create job
    const job = await Job.create({
      title,
      company,
      location,
      description,
      requirements,
      type,
      salary
    });

    // Generate embedding for the job asynchronously (don't wait for it)
    vectorService.generateJobEmbedding(job.id)
      .catch(err => console.error('Error generating job embedding:', err));

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error during job creation' });
  }
};

/**
 * Get all jobs with optional filtering
 */
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      company, 
      location, 
      type, 
      page = '1', 
      limit = '10' 
    } = req.query;

    // Build query
    const whereClause: any = {};
    
    if (title) {
      whereClause.title = { [Op.iLike]: `%${title}%` };
    }
    
    if (company) {
      whereClause.company = { [Op.iLike]: `%${company}%` };
    }
    
    if (location) {
      whereClause.location = { [Op.iLike]: `%${location}%` };
    }
    
    if (type) {
      whereClause.type = type;
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get jobs
    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Jobs retrieved successfully',
      jobs,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Error retrieving jobs:', error);
    res.status(500).json({ message: 'Server error while retrieving jobs' });
  }
};

/**
 * Get a job by ID
 */
export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({
      message: 'Job retrieved successfully',
      job
    });
  } catch (error) {
    console.error('Error retrieving job:', error);
    res.status(500).json({ message: 'Server error while retrieving job' });
  }
};

/**
 * Update a job
 */
export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Update job
    await job.update(req.body);

    // Regenerate embedding if key fields changed
    if (req.body.title || req.body.company || req.body.description || req.body.requirements) {
      vectorService.generateJobEmbedding(job.id)
        .catch(err => console.error('Error regenerating job embedding:', err));
    }

    res.status(200).json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error during job update' });
  }
};

/**
 * Delete a job
 */
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Delete job
    await job.destroy();

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error during job deletion' });
  }
};

/**
 * Search jobs with text search
 */
export const searchJobs = async (req: Request, res: Response) => {
  try {
    const { query, page = '1', limit = '10' } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Search jobs
    const { count, rows: jobs } = await Job.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { company: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { requirements: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Search results',
      jobs,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ message: 'Server error during job search' });
  }
};

/**
 * Get matching jobs for a user using the latest resume
 * This is a convenience method for the dashboard
 */
export const getMatchingJobsForUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user's latest resume
    const resume = await Resume.findOne({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });

    if (!resume) {
      return res.status(404).json({ message: 'No resume found for user' });
    }

    // Get matching jobs
    const matches = await vectorService.findMatchingJobs(resume.id);

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
    console.error('Error finding matching jobs for user:', error);
    res.status(500).json({ message: 'Server error while finding matching jobs' });
  }
};

/**
 * Analyze a job description
 */
export const analyzeJobDescription = async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Job description is required' });
    }

    // Analyze with HuggingFace
    const analysis = await huggingfaceService.analyzeJobDescription(description);

    res.status(200).json({
      message: 'Job description analyzed successfully',
      analysis
    });
  } catch (error) {
    console.error('Error analyzing job description:', error);
    res.status(500).json({ message: 'Server error during job description analysis' });
  }
}; 