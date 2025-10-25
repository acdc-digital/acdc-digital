'use client';

import React, { useState, useEffect } from 'react';
import WikiSidebar from './_components/WikiSidebar';
import MarkdownEditor from './_components/MarkdownEditor';
import { nasdaqTop100Content } from './_content/nasdaqTop100Content';
import { sessionManagerContent } from './_content/sessionManagerContent';
import { unifiedScoringContent } from './_content/unifiedScoringContent';
import { agentsContent } from './_content/agentsContent';
import { dataFlowContent } from './_content/dataFlowContent';
import { agentsToolsContent } from './_content/agentsToolsContent';
import { dataFlowChartContent } from './_content/dataFlowChartContent';
import { milestonesContent } from './_content/milestonesContent';
import { gettingStartedContent } from './_content/gettingStartedContent';

// Import chart components
import MetricScoringChart from './_charts/MetricScoringChart';
import SessionWorkflowChart from './_charts/SessionWorkflowChart';
import AgentProfileChart from './_charts/AgentProfileChart';

interface WikiProps {
  isActive?: boolean;
}

export default function Wiki({ isActive = true }: WikiProps) {
  const [activeSection, setActiveSection] = useState('getting-started');

  // Listen for company navigation events from ticker components
  useEffect(() => {
    const handleNavigateToCompany = (event: Event) => {
      const customEvent = event as CustomEvent<{ ticker: string }>;
      const ticker = customEvent.detail.ticker;
      
      console.log(`📋 Wiki received navigateToCompany event for: ${ticker}`);
      
      // Switch to nasdaq-100 section
      console.log(`📂 Switching to nasdaq-100 section`);
      setActiveSection('nasdaq-100');
      
      // After a delay to allow content to render, try to scroll to the ticker
      setTimeout(() => {
        console.log(`🔍 Looking for element with id: ${ticker}`);
        
        // Try multiple selectors
        let element = document.getElementById(ticker);
        
        if (!element) {
          // Try searching for ticker in bold text
          const boldElements = document.querySelectorAll('strong');
          for (const el of boldElements) {
            if (el.textContent?.toUpperCase() === ticker.toUpperCase()) {
              element = el.closest('tr') || el.parentElement;
              console.log(`✅ Found ticker in table cell`);
              break;
            }
          }
        }
        
        if (element) {
          console.log(`✅ Found element, scrolling...`);
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          console.warn(`⚠️ Could not find element for ticker: ${ticker}`);
        }
      }, 300);
    };

    window.addEventListener('navigateToCompany', handleNavigateToCompany);
    
    return () => {
      window.removeEventListener('navigateToCompany', handleNavigateToCompany);
    };
  }, []);

  const renderContent = () => {
    // Show the selected section content
    switch (activeSection) {
      case 'getting-started':
        return <MarkdownEditor content={gettingStartedContent} editable={true} />;
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
      case 'milestones':
        return <MarkdownEditor content={milestonesContent} editable={true} />;
      
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
