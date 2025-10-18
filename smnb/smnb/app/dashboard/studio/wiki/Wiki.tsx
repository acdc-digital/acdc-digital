'use client';

import React, { useState } from 'react';
import WikiSidebar from './_components/WikiSidebar';
import MarkdownEditor from './_components/MarkdownEditor';
import { wikiContent } from './_content/metricsContent';
import { nasdaqTop100Content } from './_content/nasdaqTop100Content';

export default function Wiki() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    // Show the selected section content
    if (activeSection === 'nasdaq-100') {
      return <MarkdownEditor content={nasdaqTop100Content} editable={true} />;
    }
    const content = wikiContent[activeSection] || wikiContent['overview'];
    return <MarkdownEditor content={content} editable={true} />;
  };

  return (
    <main className="flex-1 flex bg-[#1a1a1a] text-white h-full">
      <WikiSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1 flex flex-col">
        {renderContent()}
      </div>
    </main>
  );
}
