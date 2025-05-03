'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ResumeForm from '../components/ResumeForm';

export default function NewResumePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (formData: any) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Enhanced logging for debugging
      console.log('Creating new resume with data:', JSON.stringify(formData, null, 2));
      
      // Create a payload with properly transformed data
      const payload = {
        ...formData,
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
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/manual`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Resume created successfully:', response.data);
      setSuccessMessage('Resume created successfully!');
      
      // Redirect to the resume list page after a short delay
      setTimeout(() => {
        router.push('/resume');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating resume:', error);
      setError(error.response?.data?.message || 'Failed to create resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/resume');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Resume</h1>
          <Link
            href="/resume"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to Resumes
          </Link>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Fill out the form below to create a new resume manually.
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
      
      <ResumeForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
} 