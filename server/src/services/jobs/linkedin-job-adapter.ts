import axios from 'axios';
import * as cheerio from 'cheerio';
import { JobAdapter, JobPosting, JobSearchParams, JobSearchResult } from './job-adapter.interface';

export class LinkedInJobAdapter implements JobAdapter {
  name = 'linkedin';
  private baseUrl = 'https://www.linkedin.com/jobs/search';
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  
  async searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
    try {
      const searchUrl = this.buildSearchUrl(params);
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
      });
      
      const $ = cheerio.load(response.data);
      const jobs: JobPosting[] = [];
      
      $('.job-search-card').each((_, element) => {
        const id = $(element).attr('data-id') || '';
        const title = $(element).find('.job-search-card__title').text().trim();
        const company = $(element).find('.job-search-card__company-name').text().trim();
        const location = $(element).find('.job-search-card__location').text().trim();
        const datePosted = $(element).find('time').attr('datetime') || '';
        const url = $(element).find('.job-search-card__title a').attr('href') || '';
        
        if (id && title && company) {
          jobs.push({
            id,
            title,
            company,
            location,
            description: '', // Will need to fetch the details separately
            url,
            datePosted,
            source: 'linkedin',
          });
        }
      });
      
      const totalResults = parseInt($('.results-context-header__job-count').text().replace(/,/g, '')) || 0;
      
      // Pagination
      const nextPage = $('.artdeco-pagination__button--next:not(.artdeco-button--disabled)').length > 0 
        ? searchUrl + '&start=' + jobs.length 
        : null;
      
      return {
        jobs,
        nextPage,
        totalResults
      };
    } catch (error) {
      console.error('Error searching LinkedIn jobs:', error);
      return { jobs: [] };
    }
  }
  
  async getJobDetails(jobId: string): Promise<JobPosting | null> {
    try {
      const url = `https://www.linkedin.com/jobs/view/${jobId}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
      });
      
      const $ = cheerio.load(response.data);
      
      const title = $('.top-card-layout__title').text().trim();
      const company = $('.topcard__org-name-link').text().trim();
      const location = $('.topcard__flavor--bullet').text().trim();
      const description = $('.description__text').text().trim();
      
      // Extract job details
      const detailsContainer = $('.description__job-criteria-container');
      let jobType = '';
      let remote = false;
      
      detailsContainer.find('.description__job-criteria-item').each((_, item) => {
        const subheader = $(item).find('.description__job-criteria-subheader').text().trim();
        const text = $(item).find('.description__job-criteria-text').text().trim();
        
        if (subheader.includes('Employment type')) {
          jobType = text;
        }
        
        if (text.toLowerCase().includes('remote')) {
          remote = true;
        }
      });
      
      // Extract requirements (skills)
      const requirements: string[] = [];
      $('.description__text ul li').each((_, item) => {
        requirements.push($(item).text().trim());
      });
      
      return {
        id: jobId,
        title,
        company,
        location,
        description,
        url,
        datePosted: '', // LinkedIn doesn't show the exact date in job details
        source: 'linkedin',
        requirements,
        remote,
        jobType,
      };
    } catch (error) {
      console.error(`Error fetching LinkedIn job details for ${jobId}:`, error);
      return null;
    }
  }
  
  private buildSearchUrl(params: JobSearchParams): string {
    // Build the search URL with parameters
    const queryParams = new URLSearchParams();
    
    queryParams.append('keywords', params.keywords);
    
    if (params.location) {
      queryParams.append('location', params.location);
    }
    
    // Time filter
    if (params.timeFilter) {
      let f_TPR = 'r86400'; // Past 24 hours
      
      if (params.timeFilter === 'week') {
        f_TPR = 'r604800'; // Past week
      } else if (params.timeFilter === 'month') {
        f_TPR = 'r2592000'; // Past month
      } else if (params.timeFilter === 'any') {
        f_TPR = ''; // Any time
      }
      
      if (f_TPR) {
        queryParams.append('f_TPR', f_TPR);
      }
    }
    
    // Remote filter
    if (params.remote) {
      queryParams.append('f_WT', '2'); // Remote
    }
    
    // Job type filter
    if (params.jobType) {
      let f_JT = '';
      
      if (params.jobType === 'fulltime') {
        f_JT = 'F';
      } else if (params.jobType === 'parttime') {
        f_JT = 'P';
      } else if (params.jobType === 'contract') {
        f_JT = 'C';
      } else if (params.jobType === 'internship') {
        f_JT = 'I';
      }
      
      if (f_JT) {
        queryParams.append('f_JT', f_JT);
      }
    }
    
    // Set the result limit (LinkedIn uses count parameter)
    if (params.limit) {
      queryParams.append('count', params.limit.toString());
    }
    
    return `${this.baseUrl}?${queryParams.toString()}`;
  }
} 