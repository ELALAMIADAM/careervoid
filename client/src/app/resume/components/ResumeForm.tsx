'use client'

import { useState, useEffect } from 'react';
import { FormSectionStatus } from './ui/FormSectionStatus';
import PersonalInfoSection from './sections/PersonalInfoSection';
import SkillsSection from './sections/SkillsSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import ProjectsSection from './sections/ProjectsSection';

interface ResumeFormProps {
  resumeId?: string;
  initialData?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
  loading?: boolean;
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
  fluency: string;
}

interface FormData {
  title: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  languages: Language[];
  projects: Project[];
  about: string;
  contactInfo: ContactInfo;
  fileName?: string;
}

export default function ResumeForm({ 
  resumeId, 
  initialData, 
  onSubmit, 
  onCancel,
  loading = false 
}: ResumeFormProps) {
  const [formData, setFormData] = useState<FormData>({
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
  
  const [error, setError] = useState('');
  const [currentSection, setCurrentSection] = useState('personal');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (initialData) {
      console.log('Setting initial data:', JSON.stringify(initialData, null, 2));
      setFormData({
        title: initialData.title || initialData.fileName || '',
        skills: initialData.skills || [],
        experience: initialData.experience || [],
        education: initialData.education || [],
        languages: initialData.languages || [],
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
      // Log specific field we're having issues with
      console.log('Title set in form:', initialData.title || initialData.fileName || '');
    }
  }, [initialData]);
  
  // Handle adding and removing skills
  const handleAddSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: [...formData.skills, skill]
    });
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };
  
  // Handle adding and removing languages
  const handleAddLanguage = (language: Language) => {
    setFormData({
      ...formData,
      languages: [...formData.languages, language]
    });
  };
  
  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(lang => lang.name !== languageToRemove)
    });
  };
  
  // Handle adding, updating and removing experiences
  const handleAddExperience = (experience: Experience) => {
    setFormData({
      ...formData,
      experience: [...formData.experience, experience]
    });
  };
  
  const handleUpdateExperience = (index: number, updatedExperience: Experience) => {
    const updatedExperiences = [...formData.experience];
    updatedExperiences[index] = updatedExperience;
    
    setFormData({
      ...formData,
      experience: updatedExperiences
    });
  };
  
  const handleRemoveExperience = (index: number) => {
    const updatedExperiences = [...formData.experience];
    updatedExperiences.splice(index, 1);
    
    setFormData({
      ...formData,
      experience: updatedExperiences
    });
  };
  
  // Handle adding, updating and removing education
  const handleAddEducation = (education: Education) => {
    setFormData({
      ...formData,
      education: [...formData.education, education]
    });
  };
  
  const handleUpdateEducation = (index: number, updatedEducation: Education) => {
    const updatedEducations = [...formData.education];
    updatedEducations[index] = updatedEducation;
    
    setFormData({
      ...formData,
      education: updatedEducations
    });
  };
  
  const handleRemoveEducation = (index: number) => {
    const updatedEducations = [...formData.education];
    updatedEducations.splice(index, 1);
    
    setFormData({
      ...formData,
      education: updatedEducations
    });
  };
  
  // Handle adding, updating and removing projects
  const handleAddProject = (project: Project) => {
    setFormData({
      ...formData,
      projects: [...formData.projects, project]
    });
  };
  
  const handleUpdateProject = (index: number, updatedProject: Project) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[index] = updatedProject;
    
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
  
  // Handle personal info
  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title
    });
  };
  
  const handleAboutChange = (about: string) => {
    setFormData({
      ...formData,
      about
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
    
    if (!formData.title.trim()) {
      setError('Resume title is required');
      setCurrentSection('personal');
      return;
    }
    
    // Log the form data being submitted
    console.log('Submitting form data:', formData);
    
    onSubmit(formData);
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
              <PersonalInfoSection
                title={formData.title}
                about={formData.about}
                contactInfo={formData.contactInfo}
                onTitleChange={handleTitleChange}
                onAboutChange={handleAboutChange}
                onContactInfoChange={handleContactInfoChange}
              />
            )}
            
            {currentSection === 'skills' && (
              <SkillsSection
                skills={formData.skills}
                languages={formData.languages}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
                onAddLanguage={handleAddLanguage}
                onRemoveLanguage={handleRemoveLanguage}
              />
            )}
            
            {currentSection === 'experience' && (
              <ExperienceSection
                experiences={formData.experience}
                onAddExperience={handleAddExperience}
                onUpdateExperience={handleUpdateExperience}
                onRemoveExperience={handleRemoveExperience}
              />
            )}
            
            {currentSection === 'education' && (
              <EducationSection
                educations={formData.education}
                onAddEducation={handleAddEducation}
                onUpdateEducation={handleUpdateEducation}
                onRemoveEducation={handleRemoveEducation}
              />
            )}
            
            {currentSection === 'projects' && (
              <ProjectsSection
                projects={formData.projects}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onRemoveProject={handleRemoveProject}
              />
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