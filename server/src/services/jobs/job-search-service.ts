import { JobAdapter, JobSearchParams, JobSearchResult } from './job-adapter.interface';
import { LinkedInJobAdapter } from './linkedin-job-adapter';

export class JobSearchService {
  private adapters: Map<string, JobAdapter> = new Map();
  
  constructor() {
    // Register available adapters
    this.registerAdapter(new LinkedInJobAdapter());
    
    // In the future, we can add more adapters like Indeed, Glassdoor, etc.
    // this.registerAdapter(new IndeedJobAdapter());
    // this.registerAdapter(new GlassdoorJobAdapter());
  }
  
  private registerAdapter(adapter: JobAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }
  
  public getAdapter(name: string): JobAdapter | undefined {
    return this.adapters.get(name);
  }
  
  public async searchJobs(
    params: JobSearchParams, 
    sources: string[] = ['linkedin']
  ): Promise<{ [source: string]: JobSearchResult }> {
    const result: { [source: string]: JobSearchResult } = {};
    
    // Get the adapters for the requested sources
    const adaptersToUse = sources
      .map(source => this.adapters.get(source))
      .filter(adapter => adapter !== undefined) as JobAdapter[];
    
    // If no valid adapters are found, use LinkedIn by default
    if (adaptersToUse.length === 0) {
      const linkedInAdapter = this.adapters.get('linkedin');
      if (linkedInAdapter) {
        adaptersToUse.push(linkedInAdapter);
      }
    }
    
    // Run the search in parallel across all adapters
    await Promise.all(
      adaptersToUse.map(async adapter => {
        try {
          const jobResults = await adapter.searchJobs(params);
          result[adapter.name] = jobResults;
        } catch (error) {
          console.error(`Error searching jobs with ${adapter.name}:`, error);
          result[adapter.name] = { jobs: [] };
        }
      })
    );
    
    return result;
  }
  
  public async getJobDetails(
    jobId: string, 
    source: string = 'linkedin'
  ): Promise<any | null> {
    const adapter = this.adapters.get(source);
    
    if (!adapter) {
      throw new Error(`Job source ${source} not supported`);
    }
    
    return adapter.getJobDetails(jobId);
  }
}

// Export a singleton instance
export const jobSearchService = new JobSearchService(); 