import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';
import { logger } from './DebugLogger';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  timestamp: string;
}

interface SystemTesterProps {
  onViewChange: (view: string) => void;
  activeView: string;
}

export function SystemTester({ onViewChange, activeView }: SystemTesterProps) {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const testSuites = [
    {
      name: 'Navigation',
      tests: [
        { name: 'Chat Tab', action: () => onViewChange('chat') },
        { name: 'Tasks Tab', action: () => onViewChange('tasks') },
        { name: 'Calendar Tab', action: () => onViewChange('calendar') },
        { name: 'Files Tab', action: () => onViewChange('files') },
        { name: 'AI Tab', action: () => onViewChange('ai') },
      ]
    },
    {
      name: 'API Endpoints',
      tests: [
        { 
          name: 'Messages API', 
          action: async () => {
            const response = await fetch('/api/channels/general/messages');
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            return await response.json();
          }
        },
        { 
          name: 'Tasks API', 
          action: async () => {
            const response = await fetch('/api/tasks?channelId=general');
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            return await response.json();
          }
        },
        { 
          name: 'Files API', 
          action: async () => {
            const response = await fetch('/api/files');
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            return await response.json();
          }
        },
      ]
    },
    {
      name: 'Component Rendering',
      tests: [
        {
          name: 'Task Board Rendering',
          action: () => {
            onViewChange('tasks');
            return new Promise(resolve => {
              setTimeout(() => {
                const taskBoard = document.querySelector('[data-testid="task-board"]');
                if (taskBoard) resolve('Task board rendered');
                else throw new Error('Task board not found');
              }, 1000);
            });
          }
        },
        {
          name: 'Calendar Rendering',
          action: () => {
            onViewChange('calendar');
            return new Promise(resolve => {
              setTimeout(() => {
                const calendar = document.querySelector('[data-testid="calendar"]');
                if (calendar) resolve('Calendar rendered');
                else throw new Error('Calendar not found');
              }, 1000);
            });
          }
        }
      ]
    }
  ];

  const runTest = async (test: any) => {
    const startTime = Date.now();
    try {
      const result = await test.action();
      const testResult: TestResult = {
        name: test.name,
        status: 'pass',
        message: typeof result === 'string' ? result : 'Test passed',
        timestamp: new Date().toISOString()
      };
      
      logger.log('success', 'SystemTester', `Test passed: ${test.name}`, testResult);
      return testResult;
    } catch (error) {
      const testResult: TestResult = {
        name: test.name,
        status: 'fail',
        message: error instanceof Error ? error.message : 'Test failed',
        timestamp: new Date().toISOString()
      };
      
      logger.log('error', 'SystemTester', `Test failed: ${test.name}`, testResult);
      return testResult;
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setTests([]);
    logger.log('info', 'SystemTester', 'Starting comprehensive system test');

    const allResults: TestResult[] = [];

    for (const suite of testSuites) {
      logger.log('info', 'SystemTester', `Running test suite: ${suite.name}`);
      
      for (const test of suite.tests) {
        const result = await runTest(test);
        allResults.push(result);
        setTests([...allResults]);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setRunning(false);
    
    const passed = allResults.filter(t => t.status === 'pass').length;
    const failed = allResults.filter(t => t.status === 'fail').length;
    
    logger.log('info', 'SystemTester', 'Test suite completed', {
      total: allResults.length,
      passed,
      failed,
      success: failed === 0
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'pass': return 'default';
      case 'fail': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Tester</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Comprehensive testing of all application features
            </p>
          </div>
          <Button
            onClick={runAllTests}
            disabled={running}
            className="flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>{running ? 'Running...' : 'Run All Tests'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tests.length === 0 && !running && (
          <p className="text-gray-500 text-center py-8">
            Click "Run All Tests" to start comprehensive system testing
          </p>
        )}

        {running && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Running tests...</p>
          </div>
        )}

        <div className="space-y-2">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.status)}
                <div>
                  <span className="font-medium">{test.name}</span>
                  <p className="text-sm text-gray-500">{test.message}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getBadgeVariant(test.status)}>
                  {test.status}
                </Badge>
                <span className="text-xs text-gray-400">
                  {new Date(test.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {tests.length > 0 && !running && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Test Summary:</span>
              <div className="flex space-x-4">
                <span className="text-green-600">
                  ✓ {tests.filter(t => t.status === 'pass').length} passed
                </span>
                <span className="text-red-600">
                  ✗ {tests.filter(t => t.status === 'fail').length} failed
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}