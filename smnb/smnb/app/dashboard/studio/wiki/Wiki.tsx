'use client';

import React, { useState } from 'react';
import WikiSidebar from './_components/WikiSidebar';
import MarkdownEditor from './_components/MarkdownEditor';
import { nasdaqTop100Content } from './_content/nasdaqTop100Content';
import { sessionManagerContent } from './_content/sessionManagerContent';
import { unifiedScoringContent } from './_content/unifiedScoringContent';
import { agentsContent } from './_content/agentsContent';
import { dataFlowContent } from './_content/dataFlowContent';
import { agentsToolsContent } from './_content/agentsToolsContent';
import { dataFlowChartContent } from './_content/dataFlowChartContent';

// Import chart components
import MetricScoringChart from './_charts/MetricScoringChart';
import SessionWorkflowChart from './_charts/SessionWorkflowChart';
import AgentProfileChart from './_charts/AgentProfileChart';

export default function Wiki() {
  const [activeSection, setActiveSection] = useState('unified-scoring');

  const renderContent = () => {
    // Show the selected section content
    switch (activeSection) {
      case 'unified-scoring':
        return <MarkdownEditor content={unifiedScoringContent} editable={true} />;
      case 'nasdaq-100':
        return <MarkdownEditor content={nasdaqTop100Content} editable={true} />;
      case 'session-manager':
        return <MarkdownEditor content={sessionManagerContent} editable={true} />;
      case 'agents':
        return <MarkdownEditor content={agentsContent} editable={true} />;
      case 'data-flow':
        return <MarkdownEditor content={dataFlowContent} editable={true} />;
      case 'agents-tools':
        return <MarkdownEditor content={agentsToolsContent} editable={true} />;
      case 'data-flow-chart':
        return <MarkdownEditor content={dataFlowChartContent} editable={true} />;
      
      // Unified Scoring Chart
      case 'unified-scoring-chart':
        return <MetricScoringChart />;
      
      // Session Workflow Chart
      case 'session-workflow-chart':
        return <SessionWorkflowChart />;
      
      // Agent Profile Chart
      case 'agent-profile-chart':
        return <AgentProfileChart />;
      
      default:
        return <MarkdownEditor content={unifiedScoringContent} editable={true} />;
    }
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
