export const SectionHeading = ({ 
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