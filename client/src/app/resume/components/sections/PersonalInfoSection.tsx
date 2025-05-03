'use client'

import { SectionHeading } from '../ui/SectionHeading';

interface ContactInfo {
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  address?: string;
}

interface PersonalInfoSectionProps {
  title: string;
  about: string;
  contactInfo: ContactInfo;
  onTitleChange: (title: string) => void;
  onAboutChange: (about: string) => void;
  onContactInfoChange: (field: keyof ContactInfo, value: string) => void;
}

export default function PersonalInfoSection({
  title,
  about,
  contactInfo,
  onTitleChange,
  onAboutChange,
  onContactInfoChange
}: PersonalInfoSectionProps) {
  return (
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
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
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
            value={about}
            onChange={(e) => onAboutChange(e.target.value)}
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
                value={contactInfo?.email || ''}
                onChange={(e) => onContactInfoChange('email', e.target.value)}
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
                value={contactInfo?.phone || ''}
                onChange={(e) => onContactInfoChange('phone', e.target.value)}
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
                value={contactInfo?.linkedin || ''}
                onChange={(e) => onContactInfoChange('linkedin', e.target.value)}
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
                value={contactInfo?.github || ''}
                onChange={(e) => onContactInfoChange('github', e.target.value)}
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
                value={contactInfo?.website || ''}
                onChange={(e) => onContactInfoChange('website', e.target.value)}
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
                value={contactInfo?.address || ''}
                onChange={(e) => onContactInfoChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 