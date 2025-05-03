'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import ResumeList from './components/ResumeList';

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

export default function ResumePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showConfirmUploadDialog, setShowConfirmUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Fetch user's resumes
    const fetchResumes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setResumes(response.data.resumes || []);
      } catch (error) {
        console.error('Error fetching resumes:', error);
        setError('Failed to load your resumes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResumes();
  }, [router]);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadedFile(file);
    setShowConfirmUploadDialog(true);
  };

  const handleResumeUpload = async (parseContent: boolean) => {
    if (!uploadedFile) return;
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    setUploadLoading(true);
    setError('');
    setSuccessMessage('');
    setShowConfirmUploadDialog(false);
    
    // Create form data
    const formData = new FormData();
    formData.append('resume', uploadedFile);
    formData.append('parseContent', parseContent.toString());
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Add the new resume to the list
      setResumes([response.data.resume, ...resumes]);
      
      if (parseContent) {
        setSuccessMessage('Resume uploaded successfully! You can now edit it to add or modify information.');
        
        // Redirect to edit page for the new resume
        setTimeout(() => {
          router.push(`/resume/${response.data.resume.id}`);
        }, 1500);
      } else {
        setSuccessMessage('Resume uploaded successfully! You can now add your information manually.');
        
        // Redirect to edit page for the new resume
        setTimeout(() => {
          router.push(`/resume/${response.data.resume.id}`);
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      setError(error.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploadLoading(false);
      setUploadedFile(null);
      setShowCreateOptions(false);
    }
  };

  const handleSetPrimary = async (resumeId: string) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
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
      
      setResumes(updatedResumes);
      setSuccessMessage('Primary resume updated successfully');
    } catch (error: any) {
      console.error('Error setting primary resume:', error);
      setError(error.response?.data?.message || 'Failed to update primary resume. Please try again.');
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
      setResumes(updatedResumes);
      setSuccessMessage('Resume deleted successfully');
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      setError(error.response?.data?.message || 'Failed to delete resume. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSetMessage = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMessage(text);
      setError('');
    } else {
      setError(text);
      setSuccessMessage('');
    }
    
    // Clear the message after 5 seconds
    setTimeout(() => {
      setError('');
      setSuccessMessage('');
    }, 5000);
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
                <Link href="/jobs" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Jobs
                </Link>
                <Link href="/resume" className="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Manage Your Resumes</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Error and success messages */}
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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
            {successMessage && (
              <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Create Resume Button */}
            <div className="mt-6 mb-8 flex justify-end">
              <button
                onClick={() => setShowCreateOptions(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Resume
              </button>
            </div>

            {/* Create Resume Options Dialog */}
            {showCreateOptions && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create a New Resume</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Choose how you would like to create your resume:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer" onClick={() => document.getElementById('resume-upload')?.click()}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-primary-100 rounded-md p-2">
                          <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-base font-medium text-gray-900">Upload Resume</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            Upload a PDF, DOC, or DOCX file to extract information automatically.
                          </p>
                          <input 
                            id="resume-upload" 
                            name="resume-upload" 
                            type="file" 
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileSelected}
                            disabled={uploadLoading}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer" onClick={() => {
                      setShowCreateOptions(false);
                      router.push('/resume/new');
                    }}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-base font-medium text-gray-900">Create Manually</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            Build your resume from scratch by filling out the form.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCreateOptions(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dialog for confirming resume parsing */}
            {showConfirmUploadDialog && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Extract resume information?</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Would you like us to attempt to automatically extract information from your resume? 
                    This will pre-fill the form fields, which you can review and edit.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => handleResumeUpload(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      No, I'll enter manually
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResumeUpload(true)}
                      className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700"
                    >
                      Yes, extract information
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resume list section */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Resumes</h2>
              <ResumeList 
                resumes={resumes} 
                onResumeUpdate={setResumes} 
                onSetMessage={handleSetMessage} 
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 