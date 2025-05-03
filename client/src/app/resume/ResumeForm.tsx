'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';

interface ResumeFormProps {
  resumeId?: string;
  initialData?: {
    title?: string;
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

interface Language {
  name: string;
  fluency: string; // e.g., "Native", "Fluent", "Intermediate", "Basic"
}

const SectionHeading = ({ 
  title, 
  buttonText, 
  onButtonClick 
}: { 
  title: string; 
  buttonText?: string; 
  onButtonClick?: () => void 
}) => (
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
    {buttonText && onButtonClick && (
      <button
        type="button"
        onClick={onButtonClick}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {buttonText}
      </button>
    )}
  </div>
);

const FormSectionStatus = ({ 
  section, 
  formData 
}: { 
  section: string, 
  formData: any 
}) => {
  // Calculate completion percentage for each section
  const getCompletionStatus = () => {
    switch(section) {
      case 'personal':
        const contactFields = Object.values(formData.contactInfo || {}).filter(Boolean).length;
        const contactTotal = Object.keys(formData.contactInfo || {}).length;
        const hasAbout = formData.about?.trim().length > 0;
        const hasTitle = formData.title?.trim().length > 0;
        return {
          completed: hasTitle + hasAbout + contactFields,
          total: 2 + contactTotal,
          percentage: Math.round(((hasTitle + hasAbout + contactFields) / (2 + contactTotal)) * 100)
        };
      case 'skills':
        const hasSkills = formData.skills.length > 0;
        const hasLanguages = formData.languages.length > 0;
        return {
          completed: hasSkills + hasLanguages,
          total: 2,
          percentage: Math.round(((hasSkills + hasLanguages) / 2) * 100)
        };
      case 'experience':
        return {
          completed: formData.experience.length,
          total: formData.experience.length > 0 ? formData.experience.length : 1,
          percentage: formData.experience.length > 0 ? 100 : 0
        };
      case 'education':
        return {
          completed: formData.education.length,
          total: formData.education.length > 0 ? formData.education.length : 1,
          percentage: formData.education.length > 0 ? 100 : 0
        };
      case 'projects':
        return {
          completed: formData.projects.length,
          total: formData.projects.length > 0 ? formData.projects.length : 1,
          percentage: formData.projects.length > 0 ? 100 : 0
        };
      default:
        return { completed: 0, total: 1, percentage: 0 };
    }
  };
  
  const status = getCompletionStatus();
  
  return (
    <div className="flex items-center">
      <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
        <div 
          className="bg-primary-600 h-1.5 rounded-full" 
          style={{ width: `${status.percentage}%` }}
        ></div>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">{status.percentage}%</span>
    </div>
  );
};

export default function ResumeForm({ resumeId, initialData, onSubmit, onCancel }: ResumeFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    skills: [] as string[],
    experience: [] as Experience[],
    education: [] as Education[],
    languages: [] as Language[],
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
  const [newLanguageFluency, setNewLanguageFluency] = useState('Fluent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState('personal');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    console.log('Current section:', currentSection);
  }, [currentSection]);
  
  useEffect(() => {
    if (initialData) {
      // Handle languages separately to avoid type issues
      let languages: Language[] = [];
      if (initialData.languages && Array.isArray(initialData.languages)) {
        languages = initialData.languages.map((lang: any) => {
          if (typeof lang === 'string') {
            return { name: lang, fluency: 'Fluent' };
          }
          return lang as Language;
        });
      }
      
      setFormData({
        title: initialData.title || '',
        skills: initialData.skills || [],
        experience: initialData.experience || [],
        education: initialData.education || [],
        languages,
        projects: initialData.projects || [],
        about: initialData.about || '',
        contactInfo: initialData.contactInfo || {
          email: '',
          phone: '',
          linkedin: '',
          github: '',
          website: '',
          address: ''
        }
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
        title: resumeData.title || resumeData.fileName || '',
        skills: resumeData.skills || [],
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        languages: resumeData.languages?.map((lang: any) => ({ name: lang, fluency: 'Fluent' })) || [],
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
    if (newLanguage.trim() && !formData.languages.some(lang => lang.name === newLanguage.trim())) {
      setFormData({
        ...formData,
        languages: [...formData.languages, { 
          name: newLanguage.trim(), 
          fluency: newLanguageFluency 
        }]
      });
      setNewLanguage('');
    }
  };
  
  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(lang => lang.name !== languageToRemove)
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
    
    // Log the form data being submitted
    console.log('Submitting form data:', formData);
    
    if (onSubmit) {
      // When using the parent's submit handler
      console.log('Using parent submit handler with resumeId:', resumeId);
      onSubmit(formData);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      let response;
      const payload = {
        ...formData,
        // Convert languages from our format to the API's expected format
        languages: formData.languages.map(lang => lang.name)
      };
      
      console.log('Sending API payload:', payload);
      
      if (resumeId) {
        // Update existing resume
        console.log(`Updating resume with ID: ${resumeId}`);
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/${resumeId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log('Update response:', response.data);
        setSuccessMessage('Resume updated successfully! All your changes have been saved.');
      } else {
        // Create new resume manually
        console.log('Creating new resume');
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/resumes/manual`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log('Create response:', response.data);
        setSuccessMessage('Resume created successfully! You can now use it to apply for jobs.');
      }
      
      // Only reload if the user confirms
      setTimeout(() => {
        if (window.confirm('Your resume was saved. Would you like to refresh the page to view all your resumes?')) {
          window.location.reload();
        }
      }, 1500);
      
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
          <div key={tab.id} className="space-y-2 w-32">
            <button
              type="button"
              onClick={() => setCurrentSection(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm w-full text-left
                ${currentSection === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.name}
            </button>
            <FormSectionStatus section={tab.id} formData={formData} />
          </div>
        ))}
      </nav>
    </div>
  );
  
  useEffect(() => {
    // Scroll to top of form when changing tabs
    const formContainer = document.getElementById('resume-form-container');
    if (formContainer) {
      formContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSection]);
  
  if (loading && !initialData && !resumeId) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div id="resume-form-container" className="bg-white shadow sm:rounded-lg mt-8 overflow-auto max-h-[80vh]">
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
                <SectionHeading title="Personal Information" />
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Resume Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Professional Resume, Technical Resume, etc."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Give your resume a descriptive name to help you identify it later.
                  </p>
                </div>
                
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
                
                <div>
                  <SectionHeading title="Contact Information" />
                  <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
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
              </div>
            )}
            
            {currentSection === 'skills' && (
              <div className="space-y-6">
                <div>
                  <SectionHeading title="Skills" />
                  <div className="mt-4">
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
                      {formData.skills.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Add skills to make your resume stand out.</p>
                      ) : (
                        formData.skills.map((skill, index) => (
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
                        ))
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <SectionHeading title="Languages" />
                  <div className="mt-4">
                    <div className="flex flex-wrap space-x-2">
                      <input
                        type="text"
                        id="languages"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add a language (e.g., English, Spanish)"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                      />
                      <select
                        id="language-fluency"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-40 sm:text-sm border-gray-300 rounded-md"
                        value={newLanguageFluency}
                        onChange={(e) => setNewLanguageFluency(e.target.value)}
                      >
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Basic">Basic</option>
                      </select>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={handleAddLanguage}
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.languages.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Add languages to showcase your communication skills.</p>
                      ) : (
                        formData.languages.map((language, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {language.name} - {language.fluency}
                            <button
                              type="button"
                              className="ml-1.5 inline-flex flex-shrink-0 h-4 w-4 rounded-full text-blue-400 hover:text-blue-500 focus:outline-none focus:text-blue-500"
                              onClick={() => handleRemoveLanguage(language.name)}
                            >
                              <span className="sr-only">Remove {language.name}</span>
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentSection === 'experience' && (
              <div className="space-y-8">
                <SectionHeading 
                  title="Work Experience" 
                  buttonText="Add Experience"
                  onButtonClick={handleAddExperience}
                />
                
                {formData.experience.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No work experience</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your work experience.</p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleAddExperience}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Experience
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md relative border border-gray-200 shadow-sm">
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                          onClick={() => handleRemoveExperience(index)}
                        >
                          <span className="sr-only">Remove experience</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor={`company-${index}`} className="block text-sm font-medium text-gray-700">
                              Company
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`company-${index}`}
                                value={exp.company}
                                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor={`position-${index}`} className="block text-sm font-medium text-gray-700">
                              Position
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`position-${index}`}
                                value={exp.position}
                                onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor={`start-date-${index}`} className="block text-sm font-medium text-gray-700">
                              Start Date
                            </label>
                            <div className="mt-1">
                              <input
                                type="month"
                                id={`start-date-${index}`}
                                value={exp.startDate}
                                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              <p className="mt-1 text-xs text-gray-500">Format: MM/YYYY</p>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor={`end-date-${index}`} className="block text-sm font-medium text-gray-700">
                              End Date
                            </label>
                            <div className="mt-1">
                              <input
                                type="month"
                                id={`end-date-${index}`}
                                value={exp.endDate || ''}
                                disabled={exp.isCurrentPosition}
                                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${exp.isCurrentPosition ? 'bg-gray-100' : ''}`}
                              />
                              <p className="mt-1 text-xs text-gray-500">Leave empty for current positions</p>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <div className="flex items-center h-full pt-5">
                              <input
                                id={`current-position-${index}`}
                                type="checkbox"
                                checked={exp.isCurrentPosition}
                                onChange={(e) => handleExperienceChange(index, 'isCurrentPosition', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`current-position-${index}`} className="ml-2 block text-sm text-gray-700">
                                Current Position
                              </label>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-6">
                            <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <div className="mt-1">
                              <textarea
                                id={`description-${index}`}
                                rows={3}
                                value={exp.description}
                                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {currentSection === 'education' && (
              <div className="space-y-8">
                <SectionHeading 
                  title="Education" 
                  buttonText="Add Education"
                  onButtonClick={handleAddEducation}
                />
                
                {formData.education.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5m0 0l9-5-9-5-9 5 9 5m0 0v6" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No education added</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your educational background.</p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleAddEducation}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Education
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md relative border border-gray-200 shadow-sm">
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                          onClick={() => handleRemoveEducation(index)}
                        >
                          <span className="sr-only">Remove education</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor={`institution-${index}`} className="block text-sm font-medium text-gray-700">
                              Institution
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`institution-${index}`}
                                value={edu.institution}
                                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor={`degree-${index}`} className="block text-sm font-medium text-gray-700">
                              Degree
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`degree-${index}`}
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor={`field-of-study-${index}`} className="block text-sm font-medium text-gray-700">
                              Field of Study
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`field-of-study-${index}`}
                                value={edu.fieldOfStudy}
                                onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-3"></div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor={`edu-start-date-${index}`} className="block text-sm font-medium text-gray-700">
                              Start Date
                            </label>
                            <div className="mt-1">
                              <input
                                type="month"
                                id={`edu-start-date-${index}`}
                                value={edu.startDate}
                                onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              <p className="mt-1 text-xs text-gray-500">Format: MM/YYYY</p>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor={`edu-end-date-${index}`} className="block text-sm font-medium text-gray-700">
                              End Date
                            </label>
                            <div className="mt-1">
                              <input
                                type="month"
                                id={`edu-end-date-${index}`}
                                value={edu.endDate || ''}
                                onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              <p className="mt-1 text-xs text-gray-500">For expected graduation, enter the future date</p>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-6">
                            <label htmlFor={`edu-description-${index}`} className="block text-sm font-medium text-gray-700">
                              Description (Optional)
                            </label>
                            <div className="mt-1">
                              <textarea
                                id={`edu-description-${index}`}
                                rows={3}
                                value={edu.description || ''}
                                onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="Honors, achievements, relevant coursework, etc."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {currentSection === 'projects' && (
              <div className="space-y-8">
                <SectionHeading 
                  title="Projects" 
                  buttonText="Add Project"
                  onButtonClick={handleAddProject}
                />
                
                {formData.projects.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No projects added</h3>
                    <p className="mt-1 text-sm text-gray-500">Showcase your projects to stand out to employers.</p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleAddProject}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Project
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.projects.map((project, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md relative border border-gray-200 shadow-sm">
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                          onClick={() => handleRemoveProject(index)}
                        >
                          <span className="sr-only">Remove project</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-4">
                            <label htmlFor={`project-name-${index}`} className="block text-sm font-medium text-gray-700">
                              Project Name
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`project-name-${index}`}
                                value={project.name}
                                onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-6">
                            <label htmlFor={`project-url-${index}`} className="block text-sm font-medium text-gray-700">
                              Project URL (Optional)
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`project-url-${index}`}
                                value={project.url || ''}
                                onChange={(e) => handleProjectChange(index, 'url', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor={`project-start-date-${index}`} className="block text-sm font-medium text-gray-700">
                              Start Date (Optional)
                            </label>
                            <div className="mt-1">
                              <input
                                type="month"
                                id={`project-start-date-${index}`}
                                value={project.startDate || ''}
                                onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor={`project-end-date-${index}`} className="block text-sm font-medium text-gray-700">
                              End Date (Optional)
                            </label>
                            <div className="mt-1">
                              <input
                                type="month"
                                id={`project-end-date-${index}`}
                                value={project.endDate || ''}
                                onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              <p className="mt-1 text-xs text-gray-500">Leave empty for ongoing projects</p>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-6">
                            <label htmlFor={`project-description-${index}`} className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <div className="mt-1">
                              <textarea
                                id={`project-description-${index}`}
                                rows={3}
                                value={project.description}
                                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-6">
                            <label htmlFor={`project-technologies-${index}`} className="block text-sm font-medium text-gray-700">
                              Technologies Used
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`project-technologies-${index}`}
                                value={project.technologies.join(', ')}
                                onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="JavaScript, React, Node.js, etc. (comma separated)"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-5">
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
            
            <div className="flex justify-end space-x-3">
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
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  resumeId ? 'Update Resume' : 'Create Resume'
                )}
              </button>
            </div>
            
            <div className="mt-2 text-sm text-gray-500 text-right">
              Make sure to save your resume before navigating away from this page.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 