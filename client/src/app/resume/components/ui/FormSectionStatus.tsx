'use client'

interface FormData {
  title?: string;
  about?: string;
  contactInfo?: any;
  skills: string[];
  languages: any[];
  experience: any[];
  education: any[];
  projects: any[];
}

export const FormSectionStatus = ({ 
  section, 
  formData 
}: { 
  section: string, 
  formData: FormData 
}) => {
  // Calculate completion percentage for each section
  const getCompletionStatus = () => {
    switch(section) {
      case 'personal':
        const contactFields = formData.contactInfo ? 
          Object.values(formData.contactInfo).filter(Boolean).length : 0;
        const contactTotal = formData.contactInfo ? 
          Object.keys(formData.contactInfo).length : 0;
        const hasAbout = formData.about && formData.about.trim().length > 0 ? 1 : 0;
        const hasTitle = formData.title && formData.title.trim().length > 0 ? 1 : 0;
        return {
          completed: hasTitle + hasAbout + contactFields,
          total: 2 + contactTotal,
          percentage: Math.round(((hasTitle + hasAbout + contactFields) / (2 + contactTotal)) * 100)
        };
      case 'skills':
        const hasSkills = formData.skills.length > 0 ? 1 : 0;
        const hasLanguages = formData.languages.length > 0 ? 1 : 0;
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