'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';

interface ResumeFormProps {
  resumeId?: string;
  initialData?: {
    skills: string[];
    experience: Experience[];
    education: Education[];
    languages?: string[];
    projects?: Project[];
    about?: string;
    contactInfo?: ContactInfo;
  };
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrentPosition?: boolean;
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

interface ContactInfo {
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  address?: string;
}

export default function ResumeForm({ resumeId, initialData, onSubmit, onCancel }: ResumeFormProps) {
  const [formData, setFormData] = useState({
    skills: [] as string[],
    experience: [] as Experience[],
    education: [] as Education[],
    languages: [] as string[],
    projects: [] as Project[],
    about: '',
    contactInfo: {
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      website: '',
      address: ''
    } as ContactInfo
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState('personal');
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        contactInfo: initialData.contactInfo || formData.contactInfo
      });
    }
    
    // If we have a resumeId, fetch the data
    if (resumeId) {
      fetchResumeData();
    }
  }, [resumeId, initialData]);
  
  const fetchResumeData = async () => {
    if (!resumeId) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
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
      
      const resumeData = response.data.resume;
      
      // Transform the data to match our form structure
      setFormData({
        skills: resumeData.skills || [],
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        languages: resumeData.languages || [],
        projects: resumeData.projects || [],
        about: resumeData.about || '',
        contactInfo: resumeData.contactInfo || formData.contactInfo
      });
    } catch (error) {
      console.error('Error fetching resume data:', error);
      setError('Failed to load resume data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };
  
  const handleAddLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };
  
  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(language => language !== languageToRemove)
    });
  };
  
  const handleAddExperience = () => {
    const newExperience: Experience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrentPosition: false
    };
    
    setFormData({
      ...formData,
      experience: [...formData.experience, newExperience]
    });
  };
  
  const handleExperienceChange = (index: number, field: keyof Experience, value: any) => {
    const updatedExperience = [...formData.experience];
    
    if (field === 'isCurrentPosition' && value === true) {
      updatedExperience[index].endDate = '';
    }
    
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      experience: updatedExperience
    });
  };
  
  const handleRemoveExperience = (index: number) => {
    const updatedExperience = [...formData.experience];
    updatedExperience.splice(index, 1);
    
    setFormData({
      ...formData,
      experience: updatedExperience
    });
  };
  
  const handleAddEducation = () => {
    const newEducation: Education = {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    
    setFormData({
      ...formData,
      education: [...formData.education, newEducation]
    });
  };
  
  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };
  
  const handleRemoveEducation = (index: number) => {
    const updatedEducation = [...formData.education];
    updatedEducation.splice(index, 1);
    
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };
  
  const handleAddProject = () => {
    const newProject: Project = {
      name: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: ''
    };
    
    setFormData({
      ...formData,
      projects: [...formData.projects, newProject]
    });
  };
  
  const handleProjectChange = (index: number, field: keyof Project, value: any) => {
    const updatedProjects = [...formData.projects];
    
    if (field === 'technologies' && typeof value === 'string') {
      updatedProjects[index] = {
        ...updatedProjects[index],
        technologies: value.split(',').map(tech => tech.trim())
      };
    } else {
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value
      };
    }
    
    setFormData({
      ...formData,
      projects: updatedProjects
    });
  };
  
  const handleRemoveProject = (index: number) => {
    const updatedProjects = [...formData.projects];
    updatedProjects.splice(index, 1);
    
    setFormData({
      ...formData,
      projects: updatedProjects
    });
  };
  
  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setFormData({
      ...formData,
      contactInfo: {
        ...formData.contactInfo,
        [field]: value
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(formData);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (resumeId) {
        // Update existing resume
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/${resumeId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        // Create new resume manually
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/manual`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      
      // Redirect or update UI as needed
      window.location.reload();
    } catch (error: any) {
      console.error('Error saving resume:', error);
      setError(error.response?.data?.message || 'Failed to save resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderSectionNav = () => (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {[
          { id: 'personal', name: 'Personal Info' },
          { id: 'skills', name: 'Skills & Languages' },
          { id: 'experience', name: 'Experience' },
          { id: 'education', name: 'Education' },
          { id: 'projects', name: 'Projects' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentSection(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${currentSection === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
  
  if (loading && !initialData && !resumeId) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow sm:rounded-lg mt-8">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {resumeId ? 'Edit Resume' : 'Create Resume'}
        </h3>
        
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
        
        <form onSubmit={handleSubmit}>
          {renderSectionNav()}
          
          <div className="mt-6">
            {currentSection === 'personal' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                    About / Professional Summary
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="about"
                      rows={4}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Write a professional summary about yourself"
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        id="email"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.contactInfo?.email || ''}
                        onChange={(e) => handleContactInfoChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="phone"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.contactInfo?.phone || ''}
                        onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                      LinkedIn
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="linkedin"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.contactInfo?.linkedin || ''}
                        onChange={(e) => handleContactInfoChange('linkedin', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                      GitHub
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="github"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.contactInfo?.github || ''}
                        onChange={(e) => handleContactInfoChange('github', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Personal Website
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="website"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.contactInfo?.website || ''}
                        onChange={(e) => handleContactInfoChange('website', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address/Location
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.contactInfo?.address || ''}
                        onChange={(e) => handleContactInfoChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentSection === 'skills' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <div className="mt-1 flex">
                    <input
                      type="text"
                      id="skills"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Add a skill (e.g., JavaScript, Project Management)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    />
                    <button
                      type="button"
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={handleAddSkill}
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {skill}
                        <button
                          type="button"
                          className="ml-1.5 inline-flex flex-shrink-0 h-4 w-4 rounded-full text-primary-400 hover:text-primary-500 focus:outline-none focus:text-primary-500"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          <span className="sr-only">Remove {skill}</span>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
                    Languages
                  </label>
                  <div className="mt-1 flex">
                    <input
                      type="text"
                      id="languages"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Add a language (e.g., English, Spanish)"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                    />
                    <button
                      type="button"
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={handleAddLanguage}
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.languages.map((language, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {language}
                        <button
                          type="button"
                          className="ml-1.5 inline-flex flex-shrink-0 h-4 w-4 rounded-full text-blue-400 hover:text-blue-500 focus:outline-none focus:text-blue-500"
                          onClick={() => handleRemoveLanguage(language)}
                        >
                          <span className="sr-only">Remove {language}</span>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Rest of the form sections would be here */}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Resume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 