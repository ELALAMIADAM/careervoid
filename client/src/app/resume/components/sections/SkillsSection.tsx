'use client'

import { useState } from 'react';
import { SectionHeading } from '../ui/SectionHeading';

interface Language {
  name: string;
  fluency: string; // e.g., "Native", "Fluent", "Intermediate", "Basic"
}

interface SkillsSectionProps {
  skills: string[];
  languages: Language[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  onAddLanguage: (language: Language) => void;
  onRemoveLanguage: (languageName: string) => void;
}

export default function SkillsSection({
  skills,
  languages,
  onAddSkill,
  onRemoveSkill,
  onAddLanguage,
  onRemoveLanguage
}: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newLanguageFluency, setNewLanguageFluency] = useState('Fluent');

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onAddSkill(newSkill.trim());
      setNewSkill('');
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !languages.some(lang => lang.name === newLanguage.trim())) {
      onAddLanguage({
        name: newLanguage.trim(),
        fluency: newLanguageFluency
      });
      setNewLanguage('');
    }
  };

  return (
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
            {skills.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Add skills to make your resume stand out.</p>
            ) : (
              skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {skill}
                  <button
                    type="button"
                    className="ml-1.5 inline-flex flex-shrink-0 h-4 w-4 rounded-full text-primary-400 hover:text-primary-500 focus:outline-none focus:text-primary-500"
                    onClick={() => onRemoveSkill(skill)}
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
            {languages.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Add languages to showcase your communication skills.</p>
            ) : (
              languages.map((language, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {language.name} - {language.fluency}
                  <button
                    type="button"
                    className="ml-1.5 inline-flex flex-shrink-0 h-4 w-4 rounded-full text-blue-400 hover:text-blue-500 focus:outline-none focus:text-blue-500"
                    onClick={() => onRemoveLanguage(language.name)}
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
  );
} 