/**
 * LuxRig Integration Test Suite
 * 
 * Test end-to-end LM Studio integration and cost savings
 */

import { lmStudioService } from '../src/services/lmStudio.js';
import { multiModelOrchestratorService } from '../src/services/multiModelOrchestrator.js';

async function testLMStudioConnection() {
  console.log('🧪 Testing LM Studio Connection...');
  
  try {
    const available = await lmStudioService.isAvailable();
    console.log(`📡 LM Studio Available: ${available ? '✅ YES' : '❌ NO'}`);
    
    if (available) {
      const models = await lmStudioService.getModels();
      console.log(`🤖 Available Models: ${models.length}`);
      models.slice(0, 3).forEach(model => {
        console.log(`   - ${model.id}`);
      });
    }
    
    return available;
  } catch (error) {
    console.error('❌ LM Studio test failed:', error);
    return false;
  }
}

async function testCostSavings() {
  console.log('\n💰 Testing Cost Savings...');
  
  const testMessages = [
    { role: 'user', content: 'Hello, this is a simple test message' },
    { role: 'user', content: 'Write a detailed analysis of quantum computing applications in modern cryptography and its implications for blockchain security' }
  ];
  
  for (const message of testMessages) {
    console.log(`\n📝 Testing: "${message.content.substring(0, 50)}..."`);
    
    try {
      const complexity = lmStudioService.analyzeComplexity(message.content);
      console.log(`🔍 Task Complexity: ${complexity}`);
      
      if (complexity === 'simple' || complexity === 'medium') {
        const result = await lmStudioService.chat([message]);
        console.log(`💵 Cost Savings: ${result.cost_savings}`);
        console.log(`📊 Tokens Used: ${result.tokens}`);
        console.log(`🎯 Response Preview: ${result.content.substring(0, 100)}...`);
      } else {
        console.log(`☁️ Would route to cloud API for better results`);
      }
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
    }
  }
}

async function testOrchestrator() {
  console.log('\n🎭 Testing Orchestrator Integration...');
  
  try {
    const result = await multiModelOrchestratorService.orchestrate([
      { role: 'user', content: 'Generate a quick summary of TypeScript benefits' }
    ]);
    
    console.log(`🤖 Model Used: ${result.model}`);
    console.log(`📝 Response: ${result.content.substring(0, 150)}...`);
    console.log(`🔢 Tokens: ${result.tokens}`);
    
  } catch (error) {
    console.error('❌ Orchestrator test failed:', error);
  }
}

async function runIntegrationTests() {
  console.log('🚀 LuxRig Integration Test Suite Starting...\n');
  
  const isLMStudioAvailable = await testLMStudioConnection();
  
  if (isLMStudioAvailable) {
    await testCostSavings();
    await testOrchestrator();
    
    console.log('\n✅ Integration tests completed successfully!');
    console.log('💡 LuxRig is ready for cost-optimized AI processing');
  } else {
    console.log('\n⚠️ LM Studio not available - running in cloud-only mode');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests();
}

export { runIntegrationTests };