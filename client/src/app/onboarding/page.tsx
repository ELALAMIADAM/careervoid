'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

enum OnboardingStep {
  GOAL = 'goal',
  INDUSTRY = 'industry',
  EXPERIENCE = 'experience',
  PREFERENCES = 'preferences',
  COMPLETE = 'complete'
}

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.GOAL);
  const [goal, setGoal] = useState<string>('job_search');
  const [industry, setIndustry] = useState<string>('tech');
  const [experience, setExperience] = useState<string>('mid_level');
  const [workType, setWorkType] = useState<string>('hybrid');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    switch (currentStep) {
      case OnboardingStep.GOAL:
        setCurrentStep(OnboardingStep.INDUSTRY);
        break;
      case OnboardingStep.INDUSTRY:
        setCurrentStep(OnboardingStep.EXPERIENCE);
        break;
      case OnboardingStep.EXPERIENCE:
        setCurrentStep(OnboardingStep.PREFERENCES);
        break;
      case OnboardingStep.PREFERENCES:
        handleSubmit();
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case OnboardingStep.INDUSTRY:
        setCurrentStep(OnboardingStep.GOAL);
        break;
      case OnboardingStep.EXPERIENCE:
        setCurrentStep(OnboardingStep.INDUSTRY);
        break;
      case OnboardingStep.PREFERENCES:
        setCurrentStep(OnboardingStep.EXPERIENCE);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Create onboarding data
      const onboardingData = {
        goal,
        industry,
        experience,
        workType
      };

      // Save onboarding data
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/onboarding`, 
        onboardingData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Move to completion step
      setCurrentStep(OnboardingStep.COMPLETE);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case OnboardingStep.GOAL:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What brings you to CareerVoid?</h2>
            <p className="text-gray-600">Select your primary goal so we can personalize your experience.</p>
            
            <div className="space-y-4 mt-6">
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${goal === 'job_search' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setGoal('job_search')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${goal === 'job_search' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {goal === 'job_search' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Find a job</h3>
                    <p className="text-sm text-gray-600">I'm looking for new job opportunities</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${goal === 'career_advice' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setGoal('career_advice')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${goal === 'career_advice' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {goal === 'career_advice' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Career advice</h3>
                    <p className="text-sm text-gray-600">I want guidance on my career path</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${goal === 'resume_help' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setGoal('resume_help')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${goal === 'resume_help' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {goal === 'resume_help' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Improve my resume</h3>
                    <p className="text-sm text-gray-600">I want to optimize my resume</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case OnboardingStep.INDUSTRY:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What industry are you interested in?</h2>
            <p className="text-gray-600">Select the industry you're most interested in working in.</p>
            
            <div className="space-y-4 mt-6">
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${industry === 'tech' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setIndustry('tech')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${industry === 'tech' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {industry === 'tech' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Technology</h3>
                    <p className="text-sm text-gray-600">Software, IT, Data Science</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${industry === 'healthcare' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setIndustry('healthcare')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${industry === 'healthcare' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {industry === 'healthcare' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Healthcare</h3>
                    <p className="text-sm text-gray-600">Medical, Pharmaceutical, Healthcare Services</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${industry === 'finance' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setIndustry('finance')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${industry === 'finance' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {industry === 'finance' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Finance</h3>
                    <p className="text-sm text-gray-600">Banking, Investment, Insurance</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${industry === 'other' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setIndustry('other')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${industry === 'other' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {industry === 'other' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Other</h3>
                    <p className="text-sm text-gray-600">Select for other industries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case OnboardingStep.EXPERIENCE:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What is your experience level?</h2>
            <p className="text-gray-600">This helps us find the right opportunities for you.</p>
            
            <div className="space-y-4 mt-6">
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${experience === 'entry_level' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setExperience('entry_level')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${experience === 'entry_level' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {experience === 'entry_level' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Entry Level</h3>
                    <p className="text-sm text-gray-600">0-2 years of experience</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${experience === 'mid_level' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setExperience('mid_level')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${experience === 'mid_level' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {experience === 'mid_level' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Mid Level</h3>
                    <p className="text-sm text-gray-600">3-5 years of experience</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${experience === 'senior' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setExperience('senior')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${experience === 'senior' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {experience === 'senior' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Senior Level</h3>
                    <p className="text-sm text-gray-600">6+ years of experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case OnboardingStep.PREFERENCES:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What work type do you prefer?</h2>
            <p className="text-gray-600">Select your preferred work arrangement.</p>
            
            <div className="space-y-4 mt-6">
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${workType === 'remote' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setWorkType('remote')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${workType === 'remote' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {workType === 'remote' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Remote</h3>
                    <p className="text-sm text-gray-600">Work from anywhere</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${workType === 'hybrid' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setWorkType('hybrid')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${workType === 'hybrid' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {workType === 'hybrid' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Hybrid</h3>
                    <p className="text-sm text-gray-600">Mix of office and remote work</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer ${workType === 'onsite' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`} 
                onClick={() => setWorkType('onsite')}
              >
                <div className="flex items-center">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${workType === 'onsite' ? 'bg-primary-500' : 'border border-gray-400'}`}>
                    {workType === 'onsite' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">On-site</h3>
                    <p className="text-sm text-gray-600">Work at the office</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case OnboardingStep.COMPLETE:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">All set!</h2>
            <p className="text-lg text-gray-600">
              Your profile is ready. We'll use your preferences to provide personalized recommendations.
            </p>
            <button
              type="button"
              onClick={goToDashboard}
              className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {currentStep !== OnboardingStep.COMPLETE && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary-600 h-2.5 rounded-full" style={{ 
                  width: currentStep === OnboardingStep.GOAL ? '25%' : 
                        currentStep === OnboardingStep.INDUSTRY ? '50%' : 
                        currentStep === OnboardingStep.EXPERIENCE ? '75%' : '100%' 
                }}></div>
              </div>
            </div>
            <div className="mt-2 text-right text-sm text-gray-600">
              Step {currentStep === OnboardingStep.GOAL ? '1' : 
                   currentStep === OnboardingStep.INDUSTRY ? '2' : 
                   currentStep === OnboardingStep.EXPERIENCE ? '3' : '4'} of 4
            </div>
          </div>
        )}

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          
          {renderStep()}
          
          {currentStep !== OnboardingStep.COMPLETE && (
            <div className="mt-8 flex justify-between">
              {currentStep !== OnboardingStep.GOAL && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back
                </button>
              )}
              
              {currentStep === OnboardingStep.GOAL && (
                <div></div>
              )}
              
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
              >
                {currentStep === OnboardingStep.PREFERENCES ? (isLoading ? 'Saving...' : 'Finish') : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 