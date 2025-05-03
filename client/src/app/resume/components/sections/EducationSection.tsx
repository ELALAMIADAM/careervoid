'use client'

import { SectionHeading } from '../ui/SectionHeading';

interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface EducationSectionProps {
  educations: Education[];
  onAddEducation: (education: Education) => void;
  onUpdateEducation: (index: number, education: Education) => void;
  onRemoveEducation: (index: number) => void;
}

export default function EducationSection({
  educations,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation
}: EducationSectionProps) {
  
  const handleAddEducation = () => {
    const newEducation: Education = {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    
    onAddEducation(newEducation);
  };
  
  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    const updatedEducation = { ...educations[index] };
    updatedEducation[field] = value;
    
    onUpdateEducation(index, updatedEducation);
  };
  
  return (
    <div className="space-y-8">
      <SectionHeading 
        title="Education" 
        buttonText="Add Education"
        onButtonClick={handleAddEducation}
      />
      
      {educations.length === 0 ? (
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
          {educations.map((edu, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md relative border border-gray-200 shadow-sm">
              <button
                type="button"
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                onClick={() => onRemoveEducation(index)}
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
  );
} 