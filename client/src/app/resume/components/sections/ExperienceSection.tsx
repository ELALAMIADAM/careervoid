'use client'

import { useState } from 'react';
import { SectionHeading } from '../ui/SectionHeading';

interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrentPosition?: boolean;
}

interface ExperienceSectionProps {
  experiences: Experience[];
  onAddExperience: (experience: Experience) => void;
  onUpdateExperience: (index: number, experience: Experience) => void;
  onRemoveExperience: (index: number) => void;
}

export default function ExperienceSection({
  experiences,
  onAddExperience,
  onUpdateExperience,
  onRemoveExperience
}: ExperienceSectionProps) {
  
  const handleAddExperience = () => {
    const newExperience: Experience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrentPosition: false
    };
    
    onAddExperience(newExperience);
  };
  
  const handleExperienceChange = (index: number, field: keyof Experience, value: any) => {
    const updatedExperience = { ...experiences[index] };
    
    if (field === 'isCurrentPosition' && value === true) {
      updatedExperience.endDate = '';
    }
    
    updatedExperience[field] = value;
    
    onUpdateExperience(index, updatedExperience);
  };
  
  return (
    <div className="space-y-8">
      <SectionHeading 
        title="Work Experience" 
        buttonText="Add Experience"
        onButtonClick={handleAddExperience}
      />
      
      {experiences.length === 0 ? (
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
          {experiences.map((exp, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md relative border border-gray-200 shadow-sm">
              <button
                type="button"
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                onClick={() => onRemoveExperience(index)}
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
  );
} 