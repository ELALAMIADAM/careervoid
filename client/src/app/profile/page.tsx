'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  goal?: string;
  industry?: string;
  experience?: string;
  workType?: string;
  profileCompleted: boolean;
  createdAt: string;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    goal: '',
    industry: '',
    experience: '',
    workType: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found');
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const userData = response.data.user;
        setUser(userData);
        
        // Initialize form data with user data
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          goal: userData.goal || '',
          industry: userData.industry || '',
          experience: userData.experience || '',
          workType: userData.workType || ''
        });
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(response.data.user);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderGoalLabel = (goal: string) => {
    switch (goal) {
      case 'job_search':
        return 'Find a job';
      case 'career_advice':
        return 'Career advice';
      case 'resume_help':
        return 'Improve my resume';
      default:
        return goal;
    }
  };

  const renderIndustryLabel = (industry: string) => {
    switch (industry) {
      case 'tech':
        return 'Technology';
      case 'healthcare':
        return 'Healthcare';
      case 'finance':
        return 'Finance';
      case 'other':
        return 'Other';
      default:
        return industry;
    }
  };

  const renderExperienceLabel = (experience: string) => {
    switch (experience) {
      case 'entry_level':
        return 'Entry Level (0-2 years)';
      case 'mid_level':
        return 'Mid Level (3-5 years)';
      case 'senior':
        return 'Senior Level (6+ years)';
      default:
        return experience;
    }
  };

  const renderWorkTypeLabel = (workType: string) => {
    switch (workType) {
      case 'remote':
        return 'Remote';
      case 'hybrid':
        return 'Hybrid';
      case 'onsite':
        return 'On-site';
      default:
        return workType;
    }
  };

  if (isLoading && !user) {
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
                <Link href="/resume" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Resume
                </Link>
                <Link href="/profile" className="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Profile
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('userId');
                      router.push('/login');
                    }}
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
            <h1 className="text-3xl font-bold leading-tight text-gray-900">My Profile</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              
              {successMessage && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Account Information
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Personal details and preferences.
                    </p>
                  </div>
                  <div>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form data to original user data
                          if (user) {
                            setFormData({
                              firstName: user.firstName || '',
                              lastName: user.lastName || '',
                              goal: user.goal || '',
                              industry: user.industry || '',
                              experience: user.experience || '',
                              workType: user.workType || ''
                            });
                          }
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                
                {!isEditing ? (
                  // View mode
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Full name</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user?.firstName} {user?.lastName}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Email address</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Goal</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user?.goal ? renderGoalLabel(user.goal) : 'Not specified'}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Industry</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user?.industry ? renderIndustryLabel(user.industry) : 'Not specified'}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Experience level</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user?.experience ? renderExperienceLabel(user.experience) : 'Not specified'}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Work type preference</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user?.workType ? renderWorkTypeLabel(user.workType) : 'Not specified'}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Account created</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  // Edit mode
                  <div className="border-t border-gray-200">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                        <div className="shadow sm:rounded-md">
                          <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                            <div>
                              <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
                              <p className="mt-1 text-sm text-gray-500">Update your personal information and preferences.</p>
                            </div>

                            <div className="grid grid-cols-6 gap-6">
                              <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                  First name
                                </label>
                                <input
                                  type="text"
                                  name="firstName"
                                  id="firstName"
                                  value={formData.firstName}
                                  onChange={handleInputChange}
                                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>

                              <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                  Last name
                                </label>
                                <input
                                  type="text"
                                  name="lastName"
                                  id="lastName"
                                  value={formData.lastName}
                                  onChange={handleInputChange}
                                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>

                              <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
                                  Goal
                                </label>
                                <select
                                  id="goal"
                                  name="goal"
                                  value={formData.goal}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                >
                                  <option value="">Select a goal</option>
                                  <option value="job_search">Find a job</option>
                                  <option value="career_advice">Career advice</option>
                                  <option value="resume_help">Improve my resume</option>
                                </select>
                              </div>

                              <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                                  Industry
                                </label>
                                <select
                                  id="industry"
                                  name="industry"
                                  value={formData.industry}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                >
                                  <option value="">Select an industry</option>
                                  <option value="tech">Technology</option>
                                  <option value="healthcare">Healthcare</option>
                                  <option value="finance">Finance</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>

                              <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                                  Experience Level
                                </label>
                                <select
                                  id="experience"
                                  name="experience"
                                  value={formData.experience}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                >
                                  <option value="">Select experience level</option>
                                  <option value="entry_level">Entry Level (0-2 years)</option>
                                  <option value="mid_level">Mid Level (3-5 years)</option>
                                  <option value="senior">Senior Level (6+ years)</option>
                                </select>
                              </div>

                              <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="workType" className="block text-sm font-medium text-gray-700">
                                  Work Type Preference
                                </label>
                                <select
                                  id="workType"
                                  name="workType"
                                  value={formData.workType}
                                  onChange={handleInputChange}
                                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                >
                                  <option value="">Select work type</option>
                                  <option value="remote">Remote</option>
                                  <option value="hybrid">Hybrid</option>
                                  <option value="onsite">On-site</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                            >
                              {isLoading ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 