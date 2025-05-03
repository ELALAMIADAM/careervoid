import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { InterviewPrep, InterviewType } from '../models/interview.model';
import { Job } from '../models/job.model';
import { Application } from '../models/application.model';
import openaiService from '../services/openai.service';

/**
 * Create a new interview preparation
 */
export const createInterviewPrep = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { 
      applicationId,
      interviewType,
      jobTitle,
      companyName,
      scheduledDate,
      notes
    } = req.body;

    // Validate input
    if (!interviewType || !jobTitle || !companyName) {
      return res.status(400).json({ message: 'Interview type, job title, and company name are required' });
    }

    // If applicationId is provided, validate it
    if (applicationId) {
      const application = await Application.findOne({
        where: {
          id: applicationId,
          userId: req.userId
        }
      });

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
    }

    // Create interview prep
    const interviewPrep = await InterviewPrep.create({
      userId: req.userId,
      applicationId,
      interviewType,
      jobTitle,
      companyName,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      notes,
      questions: []
    });

    // Generate interview questions asynchronously
    generateInterviewQuestions(interviewPrep.id)
      .catch(err => console.error('Error generating interview questions:', err));

    res.status(201).json({
      message: 'Interview preparation created successfully',
      interviewPrep
    });
  } catch (error) {
    console.error('Error creating interview preparation:', error);
    res.status(500).json({ message: 'Server error during interview preparation creation' });
  }
};

/**
 * Get all interview preps for the user
 */
export const getUserInterviewPreps = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const interviewPreps = await InterviewPrep.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Interview preparations retrieved successfully',
      interviewPreps
    });
  } catch (error) {
    console.error('Error retrieving interview preparations:', error);
    res.status(500).json({ message: 'Server error while retrieving interview preparations' });
  }
};

/**
 * Get interview prep by ID
 */
export const getInterviewPrepById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const interviewPrep = await InterviewPrep.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: [
        {
          model: Application,
          as: 'application',
          include: [
            {
              model: Job,
              as: 'job'
            }
          ]
        }
      ]
    });

    if (!interviewPrep) {
      return res.status(404).json({ message: 'Interview preparation not found' });
    }

    res.status(200).json({
      message: 'Interview preparation retrieved successfully',
      interviewPrep
    });
  } catch (error) {
    console.error('Error retrieving interview preparation:', error);
    res.status(500).json({ message: 'Server error while retrieving interview preparation' });
  }
};

/**
 * Update interview prep
 */
export const updateInterviewPrep = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find interview prep
    const interviewPrep = await InterviewPrep.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!interviewPrep) {
      return res.status(404).json({ message: 'Interview preparation not found' });
    }

    // Update fields
    const allowedFields = ['interviewType', 'jobTitle', 'companyName', 'scheduledDate', 'notes', 'questions'];
    const updates: any = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'scheduledDate' && req.body[field]) {
          updates[field] = new Date(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    // Update interview prep
    await interviewPrep.update(updates);

    res.status(200).json({
      message: 'Interview preparation updated successfully',
      interviewPrep
    });
  } catch (error) {
    console.error('Error updating interview preparation:', error);
    res.status(500).json({ message: 'Server error during interview preparation update' });
  }
};

/**
 * Delete interview prep
 */
export const deleteInterviewPrep = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find interview prep
    const interviewPrep = await InterviewPrep.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!interviewPrep) {
      return res.status(404).json({ message: 'Interview preparation not found' });
    }

    // Delete interview prep
    await interviewPrep.destroy();

    res.status(200).json({ message: 'Interview preparation deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview preparation:', error);
    res.status(500).json({ message: 'Server error during interview preparation deletion' });
  }
};

/**
 * Generate interview questions
 */
export const generateQuestionsForInterviewPrep = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const interviewPrepId = req.params.id;

    // Find interview prep
    const interviewPrep = await InterviewPrep.findOne({
      where: {
        id: interviewPrepId,
        userId: req.userId
      }
    });

    if (!interviewPrep) {
      return res.status(404).json({ message: 'Interview preparation not found' });
    }

    // Get job description if application is linked
    let jobDescription = '';
    if (interviewPrep.applicationId) {
      const application = await Application.findOne({
        where: { id: interviewPrep.applicationId },
        include: [{ model: Job, as: 'job' }]
      });

      if (application && application.job) {
        jobDescription = `${application.job.description}\n\n${application.job.requirements}`;
      }
    }

    // If no job description from application, use a generic one based on job title
    if (!jobDescription) {
      jobDescription = `Job Title: ${interviewPrep.jobTitle} at ${interviewPrep.companyName}`;
    }

    // Generate questions
    const questions = await openaiService.generateInterviewQuestions(
      interviewPrep.jobTitle,
      jobDescription,
      interviewPrep.interviewType
    );

    // Update interview prep with questions
    await interviewPrep.update({ questions });

    res.status(200).json({
      message: 'Interview questions generated successfully',
      questions
    });
  } catch (error) {
    console.error('Error generating interview questions:', error);
    res.status(500).json({ message: 'Server error during interview questions generation' });
  }
};

/**
 * Save answer to a question
 */
export const saveQuestionAnswer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { questionIndex, answer } = req.body;

    if (questionIndex === undefined || !answer) {
      return res.status(400).json({ message: 'Question index and answer are required' });
    }

    // Find interview prep
    const interviewPrep = await InterviewPrep.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!interviewPrep) {
      return res.status(404).json({ message: 'Interview preparation not found' });
    }

    // Update the question with the user's answer
    const questions = [...interviewPrep.questions];
    
    if (questionIndex < 0 || questionIndex >= questions.length) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    questions[questionIndex].userAnswer = answer;

    // Update interview prep
    await interviewPrep.update({ questions });

    res.status(200).json({
      message: 'Answer saved successfully',
      updatedQuestion: questions[questionIndex]
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ message: 'Server error while saving answer' });
  }
};

/**
 * Get AI suggestions for answers
 */
export const getAISuggestions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find interview prep
    const interviewPrep = await InterviewPrep.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!interviewPrep) {
      return res.status(404).json({ message: 'Interview preparation not found' });
    }

    // Generate suggestions using OpenAI
    const userAnswers = interviewPrep.questions
      .filter(q => q.userAnswer)
      .map(q => `Question: ${q.question}\nYour Answer: ${q.userAnswer}`);

    if (userAnswers.length === 0) {
      return res.status(400).json({ message: 'No answers provided yet' });
    }

    const prompt = `
      Here are some interview answers for a ${interviewPrep.jobTitle} position at ${interviewPrep.companyName}. 
      This is a ${interviewPrep.interviewType} interview.
      Please provide feedback on the answers and suggestions for improvement:

      ${userAnswers.join('\n\n')}
    `;

    const response = await openaiService.generateInterviewQuestions(
      interviewPrep.jobTitle,
      prompt,
      'FEEDBACK'
    );

    // Save the AI suggestions
    await interviewPrep.update({
      aiSuggestions: JSON.stringify(response)
    });

    res.status(200).json({
      message: 'AI suggestions generated successfully',
      suggestions: response
    });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    res.status(500).json({ message: 'Server error during AI suggestions generation' });
  }
};

/**
 * Helper function to generate interview questions asynchronously
 */
const generateInterviewQuestions = async (interviewPrepId: string) => {
  try {
    // Find interview prep
    const interviewPrep = await InterviewPrep.findByPk(interviewPrepId);

    if (!interviewPrep) {
      throw new Error('Interview preparation not found');
    }

    // Get job description if application is linked
    let jobDescription = '';
    if (interviewPrep.applicationId) {
      const application = await Application.findOne({
        where: { id: interviewPrep.applicationId },
        include: [{ model: Job, as: 'job' }]
      });

      if (application && application.job) {
        jobDescription = `${application.job.description}\n\n${application.job.requirements}`;
      }
    }

    // If no job description from application, use a generic one based on job title
    if (!jobDescription) {
      jobDescription = `Job Title: ${interviewPrep.jobTitle} at ${interviewPrep.companyName}`;
    }

    // Generate questions
    const questions = await openaiService.generateInterviewQuestions(
      interviewPrep.jobTitle,
      jobDescription,
      interviewPrep.interviewType
    );

    // Update interview prep with questions
    await interviewPrep.update({ questions });

    return questions;
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw error;
  }
}; 