'use client'

import { SectionHeading } from '../ui/SectionHeading';

interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

interface ProjectsSectionProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (index: number, project: Project) => void;
  onRemoveProject: (index: number) => void;
}

export default function ProjectsSection({
  projects,
  onAddProject,
  onUpdateProject,
  onRemoveProject
}: ProjectsSectionProps) {
  
  const handleAddProject = () => {
    const newProject: Project = {
      name: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: ''
    };
    
    onAddProject(newProject);
  };
  
  const handleProjectChange = (index: number, field: keyof Project, value: any) => {
    const updatedProject = { ...projects[index] };
    
    if (field === 'technologies' && typeof value === 'string') {
      updatedProject.technologies = value.split(',').map(tech => tech.trim()).filter(Boolean);
    } else {
      updatedProject[field] = value;
    }
    
    onUpdateProject(index, updatedProject);
  };
  
  return (
    <div className="space-y-8">
      <SectionHeading 
        title="Projects" 
        buttonText="Add Project"
        onButtonClick={handleAddProject}
      />
      
      {projects.length === 0 ? (
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
          {projects.map((project, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md relative border border-gray-200 shadow-sm">
              <button
                type="button"
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                onClick={() => onRemoveProject(index)}
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
  );
} 