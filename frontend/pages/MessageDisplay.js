// components/MessageDisplay.js
import { formatOllamaResponse } from './utils/FormatResponse';

const MessageDisplay = ({ content, role }) => {
  if (role === 'user') {
    return (
      <div className="inline-block p-4 rounded-lg max-w-3xl bg-gray-600 text-white">
        <div className="whitespace-pre-wrap font-sans">
          {content}
        </div>
      </div>
    );
  }

  const formatAssistantMessage = (text) => {
    const cleaned = formatOllamaResponse(text);
    
    // Split into sections and format each part
    const sections = cleaned.split(/\n\n/);
    
    return sections.map((section, index) => {
      section = section.trim();
      if (!section) return null;
      
      // Main headings (## 1. Title)
      if (section.match(/^##\s*\d+\.\s*/)) {
        const title = section.replace(/^##\s*/, '');
        return (
          <h2 key={index} className="text-2xl font-bold mt-6 mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
            {title}
          </h2>
        );
      }
      
      // Bold subheadings (**Title:**)
      if (section.match(/^\*\*[^*]+\*\*:/)) {
        const title = section.replace(/^\*\*/, '').replace(/\*\*:$/, ':');
        return (
          <h3 key={index} className="text-xl font-semibold mt-5 mb-3 text-blue-700">
            {title}
          </h3>
        );
      }
      
      // Bullet points (• **Item:**)
      if (section.match(/^•\s*\*\*[^*]+\*\*:/)) {
        const content = section.replace(/^•\s*\*\*/, '').replace(/\*\*:/, ':');
        const [label, ...descParts] = content.split(/:\s*/);
        const description = descParts.join(': ');
        
        return (
          <div key={index} className="ml-6 mt-4 mb-3">
            <div className="flex">
              <span className="text-blue-600 mr-2">•</span>
              <div>
                <span className="font-semibold text-gray-800">{label}:</span>
                {description && (
                  <span className="ml-1 text-gray-700">{description}</span>
                )}
              </div>
            </div>
          </div>
        );
      }
      
      // Links
      if (section.includes('[') && section.includes('](')) {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = section.split(linkRegex);
        
        return (
          <p key={index} className="mb-3 leading-relaxed text-gray-700">
            {parts.map((part, i) => {
              if (i % 3 === 1) {
                // Link text
                return (
                  <a 
                    key={i} 
                    href={parts[i + 1]} 
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {part}
                  </a>
                );
              } else if (i % 3 === 2) {
                // Link URL (skip)
                return null;
              }
              // Regular text
              return part;
            })}
          </p>
        );
      }
      
      // Regular paragraphs
      if (section.length > 0) {
        return (
          <p key={index} className="mb-3 leading-relaxed text-gray-700 text-base">
            {section}
          </p>
        );
      }
      
      return null;
    }).filter(Boolean);
  };

  return (
    <div className="inline-block p-4 rounded-lg max-w-4xl bg-white border border-gray-200">
      <div className="formatted-content">
        {formatAssistantMessage(content)}
      </div>
    </div>
  );
};

export default MessageDisplay;
