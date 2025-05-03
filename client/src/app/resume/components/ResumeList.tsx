'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Resume {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  skills: string[];
  experience: any[];
  education: any[];
  isPrimary: boolean;
  createdAt: string;
  languages: string[];
  projects: any[];
  about: string;
  contactInfo: {
    email: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    address?: string;
  };
}

interface ResumeListProps {
  resumes: Resume[];
  onResumeUpdate: (updatedResumes: Resume[]) => void;
  onSetMessage: (type: 'success' | 'error', message: string) => void;
}

export default function ResumeList({ resumes, onResumeUpdate, onSetMessage }: ResumeListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSetPrimary = async (resumeId: string) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    setLoading(resumeId);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/${resumeId}/set-primary`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the resumes list to reflect the change
      const updatedResumes = resumes.map(resume => ({
        ...resume,
        isPrimary: resume.id === resumeId
      }));
      
      onResumeUpdate(updatedResumes);
      onSetMessage('success', 'Primary resume updated successfully');
    } catch (error: any) {
      console.error('Error setting primary resume:', error);
      onSetMessage('error', error.response?.data?.message || 'Failed to update primary resume. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    setLoading(resumeId);

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/${resumeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Remove the deleted resume from the list
      const updatedResumes = resumes.filter(resume => resume.id !== resumeId);
      onResumeUpdate(updatedResumes);
      onSetMessage('success', 'Resume deleted successfully');
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      onSetMessage('error', error.response?.data?.message || 'Failed to delete resume. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-10 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new resume or uploading an existing one.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link 
            href="/resume/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Resume
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {resumes.map((resume) => (
          <li key={resume.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-primary-600 truncate">
                    {resume.title || resume.fileName}
                  </p>
                  {resume.isPrimary && (
                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      Primary
                    </span>
                  )}
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {resume.skills.length} skills
                  </p>
                </div>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="sm:flex">
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Created on {new Date(resume.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!resume.isPrimary && (
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => handleSetPrimary(resume.id)}
                      disabled={loading === resume.id}
                    >
                      {loading === resume.id ? 'Setting...' : 'Set as Primary'}
                    </button>
                  )}
                  <Link
                    href={`/resume/${resume.id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => handleDeleteResume(resume.id)}
                    disabled={loading === resume.id}
                  >
                    {loading === resume.id ? 'Deleting...' : 'Delete'}
                  </button>
                  <Link 
                    href={`/jobs/matching?resumeId=${resume.id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Find Matching Jobs
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 