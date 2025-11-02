import { multiModelOrchestratorService } from '../services/multiModelOrchestrator';

export function createLuxRigTestComponent() {
  const testButton = document.createElement('button');
  testButton.textContent = '🏠 Test LuxRig Connection';
  testButton.className =
    'bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors';

  testButton.onclick = async () => {
    try {
      testButton.textContent = '🔄 Testing...';
      testButton.disabled = true;

      // Test simple message routing
      const response = await multiModelOrchestratorService.orchestrate([
        { role: 'user', content: 'Hello, test LuxRig connection' },
      ]);

      console.log('✅ LuxRig Test Result:', response);

      if (response.model?.includes('luxrig')) {
        testButton.textContent = '🏠✅ LuxRig Connected!';
        testButton.className = 'bg-green-600 text-white px-4 py-2 rounded-lg';
      } else {
        testButton.textContent = '☁️ Using Cloud Fallback';
        testButton.className = 'bg-blue-600 text-white px-4 py-2 rounded-lg';
      }

      setTimeout(() => {
        testButton.textContent = '🏠 Test LuxRig Connection';
        testButton.className =
          'bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors';
        testButton.disabled = false;
      }, 3000);
    } catch (error) {
      console.error('❌ LuxRig Test Failed:', error);
      testButton.textContent = '❌ Connection Failed';
      testButton.className = 'bg-red-600 text-white px-4 py-2 rounded-lg';

      setTimeout(() => {
        testButton.textContent = '🏠 Test LuxRig Connection';
        testButton.className =
          'bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors';
        testButton.disabled = false;
      }, 3000);
    }
  };

  return testButton;
}
