import { useState } from 'react';

import { CheckCircle, DollarSign, Play, Server, XCircle, Zap } from 'lucide-react';

import { lmStudioService } from '../services/lmStudio';
import { multiModelOrchestratorService } from '../services/multiModelOrchestrator';
import { components, gradients, utils } from '../styles/designSystem';

export default function LuxRigTester() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSavings, setTotalSavings] = useState(0);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setTotalSavings(0);

    // Test 1: Connection
    const connected = await lmStudioService.isAvailable();
    setIsConnected(connected);

    if (!connected) {
      setIsRunning(false);
      return;
    }

    // Test 2: Simple task routing
    const simpleTest = {
      messages: [{ role: 'user' as const, content: 'Hello! Generate a simple greeting.' }],
      expectedRouting: 'local',
    };

    // Test 3: Complex task routing
    const complexTest = {
      messages: [
        {
          role: 'user' as const,
          content:
            'Conduct a comprehensive analysis of quantum computing applications in modern distributed systems architecture, including detailed performance benchmarks and security implications.',
        },
      ],
      expectedRouting: 'cloud',
    };

    const tests = [simpleTest, complexTest];
    const results: any[] = [];
    let savings = 0;

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      try {
        const result = await multiModelOrchestratorService.orchestrate(test.messages);

        const isLocal = result.model?.includes('luxrig');
        const actualRouting = isLocal ? 'local' : 'cloud';
        const complexity = lmStudioService.analyzeComplexity(test.messages[0].content);

        // Estimate savings for local requests
        const estimatedTokens = test.messages[0].content.length * 0.75;
        const estimatedSaving = isLocal ? (estimatedTokens / 1000) * 0.002 : 0;
        savings += estimatedSaving;

        results.push({
          id: i + 1,
          content: test.messages[0].content.substring(0, 50) + '...',
          complexity,
          expectedRouting: test.expectedRouting,
          actualRouting,
          model: result.model,
          tokens: result.tokens,
          savings: estimatedSaving,
          success: true,
          response: result.content.substring(0, 100) + '...',
        });
      } catch (error) {
        results.push({
          id: i + 1,
          content: test.messages[0].content.substring(0, 50) + '...',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    setTestResults(results);
    setTotalSavings(savings);
    setIsRunning(false);
  };

  return (
    <div
      className={`${components.card} bg-gradient-to-br ${gradients.primary}/10 border-purple-500/30 backdrop-blur-xl`}
    >
      <div className={`${utils.spaceBetween} mb-8`}>
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-xl shadow-lg">
            <Server className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">LuxRig Integration Tester</h3>
            <p className="text-white/70 text-lg">Validate cost optimization and routing</p>
          </div>
        </div>

        <button
          onClick={runTests}
          disabled={isRunning}
          className={`${components.buttonPrimary} ${utils.hoverGlow} px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 text-lg font-bold`}
        >
          <Play className="w-6 h-6" />
          <span>{isRunning ? 'Testing...' : 'Run Tests'}</span>
        </button>
      </div>

      {/* Connection Status */}
      {isConnected !== null && (
        <div
          className={`p-6 rounded-xl border mb-8 backdrop-blur-sm ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            ) : (
              <XCircle className="w-7 h-7 text-red-400" />
            )}
            <div>
              <div
                className={`font-bold text-lg ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {isConnected ? 'LM Studio Connected' : 'LM Studio Offline'}
              </div>
              <div className="text-white/70 mt-1">
                {isConnected
                  ? 'Ready for cost-optimized processing'
                  : 'All requests will use cloud APIs'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-6">
          <div className={utils.spaceBetween}>
            <h4 className="text-2xl font-bold text-white">Test Results</h4>
            {totalSavings > 0 && (
              <div className="flex items-center space-x-3 bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30">
                <DollarSign className="w-6 h-6 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-lg">
                  ${totalSavings.toFixed(4)} saved
                </span>
              </div>
            )}
          </div>

          {testResults.map(result => (
            <div
              key={result.id}
              className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-white font-bold text-lg mb-2">
                    Test {result.id}: {result.content}
                  </div>
                  {result.success ? (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-400">
                          Complexity: <span className="text-purple-400">{result.complexity}</span>
                        </span>
                        <span className="text-gray-400">
                          Routed to:{' '}
                          <span
                            className={
                              result.actualRouting === 'local' ? 'text-green-400' : 'text-blue-400'
                            }
                          >
                            {result.actualRouting}
                          </span>
                        </span>
                        <span className="text-gray-400">
                          Model: <span className="text-white">{result.model}</span>
                        </span>
                      </div>
                      {result.savings > 0 && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="text-yellow-400">
                            Cost saved: ${result.savings.toFixed(4)}
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-gray-300 mt-2">Response: {result.response}</div>
                    </div>
                  ) : (
                    <div className="text-red-400 text-sm">Error: {result.error}</div>
                  )}
                </div>
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
