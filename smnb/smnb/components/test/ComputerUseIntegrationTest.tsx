/**
 * Computer Use Integration Test
 * Tests the computer use service and UI integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ComputerUseAIControls } from '@/lib/components/ComputerUseAIControls';
import { ProducerComputerUseIntegration, useProducerComputerUse } from '@/lib/components/ProducerComputerUseIntegration';
import { useApiKeyStore } from '@/lib/stores/apiKeyStore';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export const ComputerUseIntegrationTest: React.FC = () => {
  const [currentColumn, setCurrentColumn] = useState<'stats' | 'preview' | 'editor'>('stats');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { getValidApiKey } = useApiKeyStore();
  const {
    initializeService,
    interactWithEditor,
    setEditorActive,
    isReady,
    getStatus
  } = useProducerComputerUse();

  // Mock producer content for testing
  const mockProducerContent = {
    content: "This is a test news story about technology advancements in AI. The story discusses recent developments in machine learning and their impact on various industries. It covers both benefits and challenges of AI adoption.",
    metadata: {
      title: "AI Technology Advancements",
      summary: "Recent developments in AI and machine learning",
      tags: ["technology", "ai", "machine-learning"],
      sentiment: "positive"
    }
  };

  const addTestResult = (test: string, status: TestResult['status'], message: string) => {
    setTestResults(prev => [...prev, { test, status, message }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: API Key Check
    addTestResult('API Key', 'pending', 'Checking API key availability...');
    const apiKey = getValidApiKey();
    if (apiKey) {
      addTestResult('API Key', 'success', `API key available: ${apiKey.substring(0, 12)}...`);
    } else {
      addTestResult('API Key', 'error', 'No valid API key found - computer use will not work');
    }

    // Test 2: Service Initialization
    addTestResult('Service Init', 'pending', 'Initializing computer use service...');
    try {
      if (apiKey) {
        const service = initializeService(apiKey);
        service.startMonitoring();
        addTestResult('Service Init', 'success', 'Computer use service initialized successfully');
      } else {
        addTestResult('Service Init', 'error', 'Cannot initialize service without API key');
      }
    } catch (error) {
      addTestResult('Service Init', 'error', `Service initialization failed: ${error}`);
    }

    // Test 3: Column Activation
    addTestResult('Column Activation', 'pending', 'Testing column activation...');
    setCurrentColumn('editor');
    setEditorActive(true);
    
    setTimeout(() => {
      if (isReady()) {
        addTestResult('Column Activation', 'success', 'Editor column activated and service ready');
      } else {
        addTestResult('Column Activation', 'error', 'Service not ready after editor activation');
      }
    }, 1000);

    // Test 4: Status Check
    addTestResult('Status Check', 'pending', 'Checking service status...');
    setTimeout(() => {
      const status = getStatus();
      if (status.ready && status.editorActive && status.monitoring) {
        addTestResult('Status Check', 'success', 'All status indicators are positive');
      } else {
        addTestResult('Status Check', 'error', `Status check failed: ${JSON.stringify(status)}`);
      }
    }, 1500);

    // Test 5: Mock Interaction (placeholder only - will not actually execute)
    addTestResult('Mock Interaction', 'pending', 'Testing computer use interaction...');
    setTimeout(async () => {
      try {
        // This will execute the placeholder methods
        await interactWithEditor({
          action: 'enhance',
          content: mockProducerContent.content,
          context: JSON.stringify(mockProducerContent.metadata)
        });
        addTestResult('Mock Interaction', 'success', 'Computer use interaction completed (placeholder)');
      } catch (error) {
        addTestResult('Mock Interaction', 'error', `Interaction failed: ${error}`);
      } finally {
        setIsRunning(false);
      }
    }, 2000);
  };

  const resetTests = () => {
    setTestResults([]);
    setCurrentColumn('stats');
    setEditorActive(false);
  };

  return (
    <div className="computer-use-test p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">🖥️ Computer Use Integration Test</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the computer use service integration with the producer column panel
        </p>
      </div>

      {/* Test Controls */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={runTests}
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? '🔄 Running Tests...' : '▶️ Run Tests'}
        </Button>
        <Button
          onClick={resetTests}
          variant="outline"
          disabled={isRunning}
        >
          🔄 Reset
        </Button>
      </div>

      {/* Column Selector */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Column Selection Test</h3>
        <div className="flex gap-2">
          {(['stats', 'preview', 'editor'] as const).map((column) => (
            <Button
              key={column}
              onClick={() => setCurrentColumn(column)}
              variant={currentColumn === column ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
            >
              {column}
            </Button>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Current column: <strong>{currentColumn}</strong>
          {currentColumn === 'editor' && ' (Computer use should be active)'}
        </p>
      </div>

      {/* Computer Use Controls Test */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Computer Use Controls</h3>
        <ComputerUseAIControls
          currentColumn={currentColumn}
          producerContent={mockProducerContent}
          apiKey={getValidApiKey() || undefined}
          onInteractionStart={() => console.log('🤖 Test interaction started')}
          onInteractionComplete={() => console.log('✅ Test interaction completed')}
          onError={(error) => console.error('❌ Test interaction error:', error)}
        />
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded ${
                  result.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                  result.status === 'error' ? 'bg-red-100 dark:bg-red-900/20' :
                  'bg-yellow-100 dark:bg-yellow-900/20'
                }`}
              >
                <span className="text-lg">
                  {result.status === 'success' ? '✅' :
                   result.status === 'error' ? '❌' :
                   '⏳'}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{result.test}</div>
                  <div className={`text-sm ${
                    result.status === 'success' ? 'text-green-700 dark:text-green-300' :
                    result.status === 'error' ? 'text-red-700 dark:text-red-300' :
                    'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {result.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Component (Hidden) */}
      <ProducerComputerUseIntegration
        currentColumn={currentColumn}
        apiKey={getValidApiKey() || undefined}
        onInteractionStart={() => console.log('🖥️ Integration test started')}
        onInteractionComplete={() => console.log('✅ Integration test completed')}
        onError={(error) => console.error('❌ Integration test error:', error)}
      />

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 dark:bg-gray-800 border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Debug Information</h3>
          <pre className="text-xs font-mono overflow-auto">
            {JSON.stringify({
              currentColumn,
              hasApiKey: Boolean(getValidApiKey()),
              serviceReady: isReady(),
              status: getStatus(),
              mockContent: mockProducerContent
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};