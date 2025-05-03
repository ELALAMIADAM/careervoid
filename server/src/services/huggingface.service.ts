import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// HuggingFace API URL and key
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Default headers for API requests
const headers = {
  'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
  'Content-Type': 'application/json'
};

/**
 * Text classification using a HuggingFace model
 * @param text Text to classify
 * @param model HuggingFace model ID (default: distilbert-base-uncased-finetuned-sst-2-english)
 * @returns Classification results
 */
export const classifyText = async (text: string, model = 'distilbert-base-uncased-finetuned-sst-2-english') => {
  try {
    const response = await axios.post(
      `${HUGGINGFACE_API_URL}/${model}`,
      { inputs: text },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error classifying text with HuggingFace:', error);
    throw new Error('Failed to classify text');
  }
};

/**
 * Text summarization using a HuggingFace model
 * @param text Text to summarize
 * @param model HuggingFace model ID (default: facebook/bart-large-cnn)
 * @returns Summarized text
 */
export const summarizeText = async (text: string, model = 'facebook/bart-large-cnn') => {
  try {
    const response = await axios.post(
      `${HUGGINGFACE_API_URL}/${model}`,
      { 
        inputs: text,
        parameters: {
          max_length: 150,
          min_length: 30,
          do_sample: false
        }
      },
      { headers }
    );
    
    return response.data[0].summary_text;
  } catch (error) {
    console.error('Error summarizing text with HuggingFace:', error);
    throw new Error('Failed to summarize text');
  }
};

/**
 * Job description analysis using a HuggingFace model
 * @param jobDescription Job description text
 * @param model HuggingFace model ID for text classification
 * @returns Analysis of job description with key skills and requirements
 */
export const analyzeJobDescription = async (jobDescription: string, model = 'distilbert-base-uncased') => {
  try {
    // First, we'll summarize the job description
    const summary = await summarizeText(jobDescription);
    
    // Then we'll extract key information
    const keywordsRequest = await axios.post(
      `${HUGGINGFACE_API_URL}/xlm-roberta-large-finetuned-conll03-english`,
      { inputs: jobDescription },
      { headers }
    );
    
    // Process and structure the response
    return {
      summary,
      keywords: keywordsRequest.data,
      importance: jobDescription.length > 500 ? 'Detailed job description' : 'Brief job description'
    };
  } catch (error) {
    console.error('Error analyzing job description with HuggingFace:', error);
    throw new Error('Failed to analyze job description');
  }
};

/**
 * Generate embeddings using a HuggingFace model
 * @param text Text to generate embeddings for
 * @param model HuggingFace model ID (default: sentence-transformers/all-MiniLM-L6-v2)
 * @returns Embedding vector
 */
export const generateEmbeddings = async (text: string, model = 'sentence-transformers/all-MiniLM-L6-v2') => {
  try {
    const response = await axios.post(
      `${HUGGINGFACE_API_URL}/${model}`,
      { inputs: text },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error generating embeddings with HuggingFace:', error);
    throw new Error('Failed to generate embeddings');
  }
};

/**
 * Zero-shot classification using a HuggingFace model
 * @param text Text to classify
 * @param labels Array of possible labels
 * @param model HuggingFace model ID (default: facebook/bart-large-mnli)
 * @returns Classification results with probabilities
 */
export const zeroShotClassification = async (text: string, labels: string[], model = 'facebook/bart-large-mnli') => {
  try {
    const response = await axios.post(
      `${HUGGINGFACE_API_URL}/${model}`,
      { 
        inputs: text,
        parameters: { candidate_labels: labels }
      },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error with zero-shot classification on HuggingFace:', error);
    throw new Error('Failed to perform zero-shot classification');
  }
};

export default {
  classifyText,
  summarizeText,
  analyzeJobDescription,
  generateEmbeddings,
  zeroShotClassification
}; 