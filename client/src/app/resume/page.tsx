'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import ResumeForm from './ResumeForm';

export default function ResumePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<any[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmUploadDialog, setShowConfirmUploadDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // For active resume form
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(true);
  const [resumeData, setResumeData] = useState({
    title: '',
    skills: [] as string[],
    experience: [] as any[],
    education: [] as any[],
    languages: [] as string[],
    projects: [] as any[],
    about: '',
    contactInfo: {
      email: '',  // Default empty string for required field
      phone: '',
      linkedin: '',
      github: '',
      website: '',
      address: ''
    }
  });

  // Add a flag to track if user has made changes
  const [hasChanges, setHasChanges] = useState(false);

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
        setSuccessMessage('Resume uploaded successfully! We\'ve pre-filled the form with extracted information. Please review and complete any missing details.');
        
        // Populate the resume form with parsed data
        setResumeData({
          title: response.data.resume.fileName || '',
          skills: response.data.resume.skills || [],
          experience: response.data.resume.experience || [],
          education: response.data.resume.education || [],
          languages: response.data.resume.languages || [],
          projects: response.data.resume.projects || [],
          about: response.data.resume.about || '',
          contactInfo: response.data.resume.contactInfo || {
            email: '',
            phone: '',
            linkedin: '',
            github: '',
            website: '',
            address: ''
          }
        });
        
        setActiveResumeId(response.data.resume.id);
      } else {
        setSuccessMessage('Resume uploaded successfully! You can now add your information manually.');
        
        // Set just the title for manual entry
        setResumeData({
          ...resumeData,
          title: response.data.resume.fileName || ''
        });
        
        setActiveResumeId(response.data.resume.id);
      }
      
      // Show the manual form to edit/add details
      setShowManualForm(true);
      
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      setError(error.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploadLoading(false);
      setUploadedFile(null);
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
      
      // If the active resume was deleted, reset the form
      if (activeResumeId === resumeId) {
        setActiveResumeId(null);
        setResumeData({
          title: '',
          skills: [],
          experience: [],
          education: [],
          languages: [],
          projects: [],
          about: '',
          contactInfo: {
            email: '',
            phone: '',
            linkedin: '',
            github: '',
            website: '',
            address: ''
          }
        });
      }
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      setError(error.response?.data?.message || 'Failed to delete resume. Please try again.');
    }
  };

  const handleEditResume = (resumeId: string) => {
    const resumeToEdit = resumes.find(resume => resume.id === resumeId);
    
    if (resumeToEdit) {
      setResumeData({
        title: resumeToEdit.title || resumeToEdit.fileName || '',
        skills: resumeToEdit.skills || [],
        experience: resumeToEdit.experience || [],
        education: resumeToEdit.education || [],
        languages: resumeToEdit.languages || [],
        projects: resumeToEdit.projects || [],
        about: resumeToEdit.about || '',
        contactInfo: resumeToEdit.contactInfo || {
          email: '',
          phone: '',
          linkedin: '',
          github: '',
          website: '',
          address: ''
        }
      });
      
      setActiveResumeId(resumeId);
      setShowManualForm(true);
      
      // Scroll to the form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFormCancel = () => {
    setActiveResumeId(null);
    setResumeData({
      title: '',
      skills: [],
      experience: [],
      education: [],
      languages: [],
      projects: [],
      about: '',
      contactInfo: {
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        website: '',
        address: ''
      }
    });
  };

  const handleFormSubmit = async (formData: any) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      let response: { data: { resume: any, message: string } };
      
      // Create a payload with the title included
      const payload = {
        ...formData,
        title: formData.title || `Resume - ${new Date().toLocaleDateString()}`
      };
      
      if (activeResumeId) {
        console.log('Updating existing resume:', activeResumeId);
        // Update existing resume
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/${activeResumeId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Update the resume in the list
        const updatedResumes = resumes.map(resume => 
          resume.id === activeResumeId ? response.data.resume : resume
        );
        
        setResumes(updatedResumes);
        setSuccessMessage('Resume updated successfully');
      } else {
        console.log('Creating new resume');
        // Create new resume manually
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/manual`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Add the new resume to the list
        setResumes([response.data.resume, ...resumes]);
        setSuccessMessage('Resume created successfully');
      }
      
      // Reset the form
      setActiveResumeId(null);
      setResumeData({
        title: '',
        skills: [],
        experience: [],
        education: [],
        languages: [],
        projects: [],
        about: '',
        contactInfo: {
          email: '',
          phone: '',
          linkedin: '',
          github: '',
          website: '',
          address: ''
        }
      });
      
      setHasChanges(false);
      
    } catch (error: any) {
      console.error('Error saving resume:', error);
      setError(error.response?.data?.message || 'Failed to save resume. Please try again.');
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

            {/* Upload section */}
            <div className="bg-white shadow sm:rounded-lg mt-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Upload your resume</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Upload your resume file (PDF, DOC, or DOCX) to quickly populate your profile information.</p>
                </div>
                <form className="mt-5 sm:flex sm:items-center">
                  <div className="w-full sm:max-w-xs">
                    <label htmlFor="resume-upload" className="sr-only">Upload Resume</label>
                    <input 
                      id="resume-upload" 
                      name="resume-upload" 
                      type="file" 
                      className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelected}
                      disabled={uploadLoading}
                    />
                  </div>
                </form>
              </div>
            </div>

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

            {/* Resume form section - always visible by default */}
            {showManualForm && (
              <ResumeForm 
                resumeId={activeResumeId || undefined}
                initialData={resumeData}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            )}

            {/* Resume list section */}
            <div className="mt-8">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Resumes</h2>
              {resumes.length === 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
                  <p>You haven't created any resumes yet.</p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {resumes.map((resume) => (
                      <li key={resume.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-primary-600 truncate">
                                {resume.fileName}
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
                                >
                                  Set as Primary
                                </button>
                              )}
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={() => handleEditResume(resume.id)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onClick={() => handleDeleteResume(resume.id)}
                              >
                                Delete
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
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 