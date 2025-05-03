'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface Job {
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

interface JobsPageProps {}

export default function JobsPage({}: JobsPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [needsResume, setNeedsResume] = useState(false);
  const [needsResumeUpdate, setNeedsResumeUpdate] = useState(false);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [keywordsUsed, setKeywordsUsed] = useState('');
  
  // Search parameters
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'any'>('week');
  const [remote, setRemote] = useState(false);
  const [jobType, setJobType] = useState<'fulltime' | 'parttime' | 'contract' | 'internship' | undefined>(undefined);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Initially search for jobs based on the user's resume
    searchJobsWithResume();
  }, [router]);
  
  const searchJobsWithResume = async () => {
    setJobsLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs/resume-based/search`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            location,
            timeFilter,
            remote: remote ? 'true' : 'false',
            jobType
          }
        }
      );
      
      if (response.data.needsResume) {
        setNeedsResume(true);
        setJobs([]);
      } else if (response.data.needsResumeUpdate) {
        setNeedsResumeUpdate(true);
        setJobs([]);
      } else {
        // Extract jobs from all sources
        const allJobs: Job[] = [];
        const results = response.data.results;
        
        for (const source in results) {
          if (results[source] && results[source].jobs) {
            allJobs.push(...results[source].jobs);
          }
        }
        
        setJobs(allJobs);
        setKeywordsUsed(response.data.keywordsUsed || '');
      }
    } catch (error: any) {
      console.error('Error searching jobs with resume:', error);
      
      if (error.response?.status === 404 && error.response?.data?.needsResume) {
        setNeedsResume(true);
      } else if (error.response?.status === 400 && error.response?.data?.needsResumeUpdate) {
        setNeedsResumeUpdate(true);
      } else {
        setError(error.response?.data?.message || 'Failed to search for jobs. Please try again.');
      }
    } finally {
      setJobsLoading(false);
      setLoading(false);
    }
  };
  
  const searchJobs = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!keywords.trim()) {
      setError('Please enter keywords to search for jobs');
      return;
    }
    
    setJobsLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/jobs/external/search`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            keywords,
            location,
            timeFilter,
            remote: remote ? 'true' : 'false',
            jobType
          }
        }
      );
      
      // Extract jobs from all sources
      const allJobs: Job[] = [];
      const results = response.data.results;
      
      for (const source in results) {
        if (results[source] && results[source].jobs) {
          allJobs.push(...results[source].jobs);
        }
      }
      
      setJobs(allJobs);
      setKeywordsUsed('');
    } catch (error: any) {
      console.error('Error searching jobs:', error);
      setError(error.response?.data?.message || 'Failed to search for jobs. Please try again.');
    } finally {
      setJobsLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary-600">
                  CareerVoid
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/jobs" className="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Jobs
                </Link>
                <Link href="/resume" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Resume
                </Link>
                <Link href="/profile" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Profile
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Resume Warning/Error Messages */}
          {needsResume && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You need to create a resume to get personalized job recommendations.
                    <Link href="/resume" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                      Create Resume
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {needsResumeUpdate && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your resume needs more information to get better job recommendations.
                    <Link href="/resume" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                      Update Resume
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Search Form */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Search for Jobs</h2>
            
            <form onSubmit={searchJobs} className="space-y-4">
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                  Keywords
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="keywords"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Job title, skills, or company"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="location"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="City, state, or remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                <div>
                  <label htmlFor="timeFilter" className="block text-sm font-medium text-gray-700">
                    Time Filter
                  </label>
                  <select
                    id="timeFilter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as any)}
                  >
                    <option value="day">Past 24 hours</option>
                    <option value="week">Past week</option>
                    <option value="month">Past month</option>
                    <option value="any">Any time</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">
                    Job Type
                  </label>
                  <select
                    id="jobType"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={jobType || ''}
                    onChange={(e) => setJobType(e.target.value ? e.target.value as any : undefined)}
                  >
                    <option value="">All job types</option>
                    <option value="fulltime">Full-time</option>
                    <option value="parttime">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="remote"
                  name="remote"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={remote}
                  onChange={(e) => setRemote(e.target.checked)}
                />
                <label htmlFor="remote" className="ml-2 block text-sm text-gray-900">
                  Remote jobs only
                </label>
              </div>
              
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  disabled={jobsLoading}
                >
                  {jobsLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    'Search Jobs'
                  )}
                </button>
                
                {!needsResume && (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={searchJobsWithResume}
                    disabled={jobsLoading}
                  >
                    Use My Resume
                  </button>
                )}
              </div>
            </form>
          </div>
          
          {/* Job Results */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Job Results</h2>
              {keywordsUsed && (
                <span className="text-sm text-gray-500">
                  Based on your resume skills: <span className="font-medium">{keywordsUsed}</span>
                </span>
              )}
            </div>
            
            {jobsLoading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or create a resume for personalized recommendations.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <div key={`${job.source}-${job.id}`} className="flex flex-col border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                            {job.title}
                          </a>
                        </h3>
                        <p className="text-sm text-gray-500">
                          {job.company} • {job.location}
                          {job.remote && ' (Remote)'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {job.source === 'linkedin' ? 'LinkedIn' : job.source}
                        </span>
                        {job.jobType && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {job.jobType}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {job.description || 'No description available.'}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {job.datePosted ? (
                          <>Posted: {new Date(job.datePosted).toLocaleDateString()}</>
                        ) : 'Recently posted'}
                      </div>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        View Job →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 