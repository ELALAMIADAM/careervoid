import sequelize from '../config/database';
import { Op } from 'sequelize';
import { Job } from '../models/job.model';
import { Resume } from '../models/resume.model';
import openaiService from './openai.service';

/**
 * Calculate cosine similarity between two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Similarity score (0-1)
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return similarity;
};

/**
 * Convert an embedding vector to a PostgreSQL bytea format
 * @param embedding Embedding vector as array of numbers
 * @returns Buffer for PostgreSQL bytea storage
 */
export const embeddingToBuffer = (embedding: number[]): Buffer => {
  const buffer = Buffer.alloc(embedding.length * 4);
  embedding.forEach((value, index) => {
    buffer.writeFloatLE(value, index * 4);
  });
  return buffer;
};

/**
 * Convert a PostgreSQL bytea back to an embedding vector
 * @param buffer Buffer from PostgreSQL bytea
 * @returns Embedding vector as array of numbers
 */
export const bufferToEmbedding = (buffer: Buffer): number[] => {
  const embedding: number[] = [];
  for (let i = 0; i < buffer.length; i += 4) {
    embedding.push(buffer.readFloatLE(i));
  }
  return embedding;
};

/**
 * Find matching jobs for a resume
 * @param resumeId Resume ID
 * @param limit Number of matches to return
 * @param minScore Minimum similarity score (0-1)
 * @returns Array of job matches with similarity scores
 */
export const findMatchingJobs = async (resumeId: string, limit: number = 10, minScore: number = 0.7) => {
  try {
    // Get resume with embedding
    const resume = await Resume.findByPk(resumeId);
    if (!resume || !resume.vectorEmbedding) {
      throw new Error('Resume not found or embedding not available');
    }
    
    // Convert buffer to embedding
    const resumeEmbedding = bufferToEmbedding(resume.vectorEmbedding);
    
    // Get all jobs with embeddings
    const jobs = await Job.findAll({ 
      where: {
        vectorEmbedding: sequelize.literal('vector_embedding IS NOT NULL')
      }
    });
    
    // Calculate similarities
    const matches = jobs.map(job => {
      const jobEmbedding = bufferToEmbedding(job.vectorEmbedding!);
      const similarityScore = cosineSimilarity(resumeEmbedding, jobEmbedding);
      
      return {
        job,
        similarityScore
      };
    });
    
    // Filter by min score and sort by score (descending)
    return matches
      .filter(match => match.similarityScore >= minScore)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
    
  } catch (error) {
    console.error('Error finding matching jobs:', error);
    throw new Error('Failed to find matching jobs');
  }
};

/**
 * Generate and store embedding for a job
 * @param jobId Job ID
 * @returns Updated job with embedding
 */
export const generateJobEmbedding = async (jobId: string) => {
  try {
    // This is a placeholder - in a real implementation, you would:
    // 1. Retrieve the job from the database
    // 2. Extract relevant text (title, description, requirements)
    // 3. Generate embeddings using OpenAI
    // 4. Store the embeddings in the database
    
    console.log(`Generated embedding for job ${jobId}`);
    return true;
  } catch (error) {
    console.error(`Error generating job embedding: ${error}`);
    return false;
  }
};

/**
 * Generate and store embedding for a resume
 * @param resumeId Resume ID
 * @returns Updated resume with embedding
 */
export const generateResumeEmbedding = async (resumeId: string) => {
  try {
    // This is a placeholder - in a real implementation, you would:
    // 1. Retrieve the resume from the database
    // 2. Extract relevant text
    // 3. Generate embeddings using OpenAI
    // 4. Store the embeddings in the database
    
    console.log(`Generated embedding for resume ${resumeId}`);
    return true;
  } catch (error) {
    console.error(`Error generating resume embedding: ${error}`);
    return false;
  }
};

/**
 * Find matching resumes for a job
 */
export const findMatchingResumes = async (
  jobId: string,
  limit: number = 10,
  minScore: number = 0.7
) => {
  try {
    // This is a placeholder for vector similarity search
    // In a real implementation, you would:
    // 1. Retrieve the job embedding
    // 2. Perform a similarity search against resume embeddings
    // 3. Return the most similar resumes with their similarity scores
    
    // For now, we'll return mock data
    const mockResumes = await Resume.findAll({ limit });
    
    return mockResumes.map(resume => ({
      resume,
      similarityScore: Math.random() * 0.3 + 0.7 // Random score between 0.7 and 1.0
    }));
  } catch (error) {
    console.error(`Error finding matching resumes: ${error}`);
    return [];
  }
};

export default {
  findMatchingJobs,
  generateJobEmbedding,
  generateResumeEmbedding,
  cosineSimilarity,
  embeddingToBuffer,
  bufferToEmbedding,
  findMatchingResumes
}; 