'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import WikiSidebar from './WikiSidebar';
import MarkdownRenderer from './MarkdownRenderer';
import { overviewContent } from '../../wiki/_content/overviewContent';
import { userGuideContent } from '../../wiki/_content/userGuideContent';
import { architectureContent } from '../../wiki/_content/architectureContent';
import { componentsContent } from '../../wiki/_content/componentsContent';
import { stateManagementContent } from '../../wiki/_content/stateManagementContent';
import { apiIntegrationContent } from '../../wiki/_content/apiIntegrationContent';
import { deploymentContent } from '../../wiki/_content/deploymentContent';
import { troubleshootingContent } from '../../wiki/_content/troubleshootingContent';
import FlowDiagram from '../../wiki/_components/FlowDiagram';

export function Wiki() {
  const [activeSection, setActiveSection] = useState('overview');
  const [copied, setCopied] = useState(false);

  const getContent = () => {
    switch (activeSection) {
      case 'overview': return overviewContent;
      case 'user-guide': return userGuideContent;
      case 'architecture': return architectureContent;
      case 'components': return componentsContent;
      case 'state-management': return stateManagementContent;
      case 'api-integration': return apiIntegrationContent;
      case 'deployment': return deploymentContent;
      case 'troubleshooting': return troubleshootingContent;
      default: return overviewContent;
    }
  };

  const handleCopy = async () => {
    const content = getContent();
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <MarkdownRenderer content={overviewContent} />;
      case 'user-guide':
        return (
          <>
            <MarkdownRenderer content={userGuideContent} />
            <div className="px-8 pb-8 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-200 mb-4">System Overview Flow</h3>
                <FlowDiagram type="system-overview" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-200 mb-4">Data Flow Architecture</h3>
                <FlowDiagram type="data-flow" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-200 mb-4">System State Machine</h3>
                <FlowDiagram type="state-machine" />
              </div>
            </div>
          </>
        );
      case 'architecture':
        return <MarkdownRenderer content={architectureContent} />;
      case 'components':
        return <MarkdownRenderer content={componentsContent} />;
      case 'state-management':
        return <MarkdownRenderer content={stateManagementContent} />;
      case 'api-integration':
        return <MarkdownRenderer content={apiIntegrationContent} />;
      case 'deployment':
        return <MarkdownRenderer content={deploymentContent} />;
      case 'troubleshooting':
        return <MarkdownRenderer content={troubleshootingContent} />;
      default:
        return <MarkdownRenderer content={overviewContent} />;
    }
  };

  return (
    <div className="flex h-full bg-background relative">
      <WikiSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="flex-1 overflow-auto">
        {/* Copy Button - Fixed at top right */}
        <div className="sticky top-0 right-0 z-10 flex justify-end p-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200 shadow-sm"
            title="Copy content to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        
        {renderContent()}
      </main>
    </div>
  );
}
