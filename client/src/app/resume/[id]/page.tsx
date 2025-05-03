'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ResumeForm from '../components/ResumeForm';

export default function EditResumePage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resumeData, setResumeData] = useState<any>(null);

  useEffect(() => {
    fetchResumeData();
  }, [resumeId]);

  const fetchResumeData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/${resumeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const data = response.data.resume;
      
      // Add detailed logging to debug title issue
      console.log("Raw API response:", JSON.stringify(response.data, null, 2));
      console.log("Resume data from API:", data);
      console.log("Title from API:", data.title);
      console.log("Filename from API:", data.fileName);
      
      // Transform languages from string[] to { name, fluency }[] format
      const transformedData = {
        ...data,
        // Ensure title is properly set, using fileName as fallback
        title: data.title || data.fileName || `Resume - ${new Date().toLocaleDateString()}`,
        languages: data.languages?.map((lang: string) => ({
          name: lang,
          fluency: 'Fluent' // Default fluency
        })) || []
      };
      
      console.log("Transformed data with title:", transformedData.title);
      
      setResumeData(transformedData);
    } catch (error: any) {
      console.error('Error fetching resume data:', error);
      setError(error.response?.data?.message || 'Failed to load resume data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      // Enhanced logging for debugging
      console.log('Updating resume with ID:', resumeId);
      console.log('Form data structure:', JSON.stringify(formData, null, 2));
      
      // Create a payload with properly transformed data
      const payload = {
        ...formData,
        // Make sure we have a title
        title: formData.title || resumeData?.title || resumeData?.fileName || `Resume - ${new Date().toLocaleDateString()}`,
        // Transform languages from { name, fluency } objects to just string names for API
        languages: formData.languages.map((lang: any) => lang.name),
        // Ensure dates are in proper format for experience items
        experience: formData.experience.map((exp: any) => ({
          ...exp,
          startDate: exp.startDate || null,
          endDate: exp.isCurrentPosition ? null : (exp.endDate || null)
        })),
        // Ensure dates are in proper format for education items
        education: formData.education.map((edu: any) => ({
          ...edu,
          startDate: edu.startDate || null,
          endDate: edu.endDate || null
        })),
        // Ensure dates are in proper format for project items
        projects: formData.projects.map((proj: any) => ({
          ...proj,
          startDate: proj.startDate || null,
          endDate: proj.endDate || null
        }))
      };
      
      console.log('API payload:', JSON.stringify(payload, null, 2));

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/${resumeId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Resume updated successfully:', response.data);
      setSuccessMessage('Resume updated successfully!');
      
      // Redirect to the resume list page after a short delay
      setTimeout(() => {
        router.push('/resume');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating resume:', error);
      setError(error.response?.data?.message || 'Failed to update resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/resume');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Resume</h1>
          <Link
            href="/resume"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to Resumes
          </Link>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Edit your resume information below.
        </p>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
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
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <ResumeForm
          resumeId={resumeId}
          initialData={resumeData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={saving}
        />
      )}
    </div>
  );
} 