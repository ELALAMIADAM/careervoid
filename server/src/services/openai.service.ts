import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Extract skills from resume text
 */
export const extractSkillsFromResume = async (resumeText: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a skilled HR professional specialized in resume analysis. Extract all technical and soft skills from the resume text.'
        },
        {
          role: 'user',
          content: `Extract all technical and soft skills from this resume. Return the result as a JSON object with two arrays: "technicalSkills" and "softSkills". Resume text: ${resumeText}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error extracting skills from resume:', error);
    return { technicalSkills: [], softSkills: [] };
  }
};

/**
 * Analyze resume and provide feedback
 */
export const analyzeResume = async (resumeText: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume reviewer. Analyze the given resume and provide constructive feedback.'
        },
        {
          role: 'user',
          content: `Analyze this resume and provide feedback. Include strengths, weaknesses, and specific suggestions for improvement. Format your response as a JSON object with the following fields: "strengths", "weaknesses", "suggestions", "overallScore" (1-10), and "summary". Resume text: ${resumeText}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return {
      strengths: [],
      weaknesses: [],
      suggestions: [],
      overallScore: 0,
      summary: 'Error analyzing resume'
    };
  }
};

/**
 * Generate a tailored cover letter
 */
export const generateCoverLetter = async (
  resumeText: string,
  jobDescription: string,
  userPreferences: any
) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional cover letter writer. Generate a tailored cover letter based on the resume and job description.'
        },
        {
          role: 'user',
          content: `Generate a tailored cover letter for the following job description based on this resume. 
          User preferences (tone, focus points, etc.): ${JSON.stringify(userPreferences)}
          Resume: ${resumeText}
          Job Description: ${jobDescription}`
        }
      ]
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return 'Error generating cover letter. Please try again.';
  }
};

/**
 * Generate interview questions based on job description
 */
export const generateInterviewQuestions = async (
  jobTitle: string,
  jobDescription: string,
  interviewType: string
) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced interviewer who creates relevant and challenging interview questions.'
        },
        {
          role: 'user',
          content: `Generate 10 interview questions for a ${jobTitle} position based on this job description. 
          The interview type is: ${interviewType}.
          For each question, provide the question, the intent behind asking it, and what a good answer might include.
          Format the response as a JSON array of objects with fields: "question", "intent", and "goodAnswerPoints".
          Job Description: ${jobDescription}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{"questions":[]}';
    return JSON.parse(content).questions || [];
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return [];
  }
};

/**
 * Generate feedback on interview answers
 */
export const generateInterviewFeedback = async (
  jobTitle: string,
  question: string,
  answer: string
) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an interview coach providing constructive feedback on interview answers.'
        },
        {
          role: 'user',
          content: `Provide feedback on this answer for a ${jobTitle} position interview.
          Question: ${question}
          Answer: ${answer}
          
          Format your response as a JSON object with the following fields:
          "strengths": [array of strengths in the answer],
          "weaknesses": [array of areas for improvement],
          "suggestions": [specific suggestions to improve the answer],
          "rating": a score from 1-10,
          "improvedAnswer": a suggested improved version of the answer`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating interview feedback:', error);
    return {
      strengths: [],
      weaknesses: ['Unable to analyze answer'],
      suggestions: ['Try again later'],
      rating: 0,
      improvedAnswer: ''
    };
  }
};

/**
 * Generate career path suggestions based on user inputs
 * Used by the career path controller
 */
export const generateCareerPathSuggestions = async (
  currentRole: string,
  experience: string,
  skills: string[],
  goals: string
) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a career development expert who provides guidance on career progression paths.'
        },
        {
          role: 'user',
          content: `Generate a detailed career path for someone with the following profile:
          Current Role: ${currentRole}
          Experience Level: ${experience}
          Skills: ${skills.join(', ')}
          Career Goals: ${goals}
          
          Format your response as a JSON object with the following structure:
          {
            "currentPosition": {
              "title": "Current job title",
              "description": "Brief description of current position",
              "skills": ["list", "of", "relevant", "skills"],
              "salaryRange": "$XX,XXX - $YY,YYY"
            },
            "careerPath": [
              {
                "title": "Next job title",
                "level": "Junior/Mid/Senior",
                "description": "Description of this career step",
                "skills": ["skills", "needed"],
                "salaryRange": "$XX,XXX - $YY,YYY",
                "timeToAchieve": "Estimated time to reach this position (e.g., '1-2 years')",
                "prerequisites": ["list", "of", "prerequisites"],
                "nextSteps": ["steps", "to", "progress"],
                "resources": ["resources", "for", "learning"],
                "probability": 0.8,
                "connectionDescription": "Description of the connection between positions"
              },
              // Additional positions...
            ]
          }`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating career path suggestions:', error);
    return {
      currentPosition: {
        title: currentRole,
        description: "Unable to generate career path information",
        skills: skills || [],
        salaryRange: "Unknown"
      },
      careerPath: []
    };
  }
};

/**
 * Generate career path based on user inputs
 */
export const generateCareerPath = async (
  currentRole: string,
  experienceYears: number,
  skills: string[],
  careerGoals: string
) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a career development expert who provides guidance on career progression paths.'
        },
        {
          role: 'user',
          content: `Generate a detailed career path for someone with the following profile:
          Current Role: ${currentRole}
          Years of Experience: ${experienceYears}
          Skills: ${skills.join(', ')}
          Career Goals: ${careerGoals}
          
          Format your response as a JSON object with the following structure:
          {
            "currentPosition": {
              "title": "Current job title",
              "description": "Brief description of current position",
              "skills": ["list", "of", "relevant", "skills"],
              "level": 1
            },
            "careerPath": [
              {
                "title": "Next job title",
                "description": "Description of this career step",
                "skills": ["skills", "needed"],
                "timeframe": "Estimated time to reach this position (e.g., '1-2 years')",
                "level": 2,
                "prerequisites": ["list", "of", "prerequisites"]
              },
              // Additional positions...
            ]
          }`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating career path:', error);
    return {
      currentPosition: {
        title: currentRole,
        description: "Unable to generate career path information",
        skills: skills || [],
        level: 1
      },
      careerPath: []
    };
  }
};

// Export all functions
export default {
  extractSkillsFromResume,
  analyzeResume,
  generateCoverLetter,
  generateInterviewQuestions,
  generateInterviewFeedback,
  generateCareerPath,
  generateCareerPathSuggestions
}; 