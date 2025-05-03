export interface JobSearchParams {
  keywords: string;
  location?: string;
  timeFilter?: 'day' | 'week' | 'month' | 'any';
  remote?: boolean;
  jobType?: 'fulltime' | 'parttime' | 'contract' | 'internship';
  limit?: number;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  datePosted: string;
  salary?: string;
  source: string;
  requirements?: string[];
  remote?: boolean;
  jobType?: string;
}

export interface JobSearchResult {
  jobs: JobPosting[];
  nextPage?: string | null;
  totalResults?: number;
}

export interface JobAdapter {
  name: string;
  searchJobs(params: JobSearchParams): Promise<JobSearchResult>;
  getJobDetails(jobId: string): Promise<JobPosting | null>;
} 