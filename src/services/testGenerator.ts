/**
 * Test Generator - Automatically generates tests for code
 */

interface TestFramework {
  name: 'jest' | 'vitest' | 'mocha' | 'pytest' | 'junit';
  language: string;
  testFileExtension: string;
  setupPattern: string;
}

class TestGenerator {
  private frameworks: Map<string, TestFramework> = new Map([
    ['jest', {
      name: 'jest',
      language: 'javascript',
      testFileExtension: '.test.js',
      setupPattern: 'describe',
    }],
    ['vitest', {
      name: 'vitest',
      language: 'javascript',
      testFileExtension: '.test.js',
      setupPattern: 'describe',
    }],
    ['mocha', {
      name: 'mocha',
      language: 'javascript',
      testFileExtension: '.test.js',
      setupPattern: 'describe',
    }],
    ['pytest', {
      name: 'pytest',
      language: 'python',
      testFileExtension: '_test.py',
      setupPattern: 'def test_',
    }],
    ['junit', {
      name: 'junit',
      language: 'java',
      testFileExtension: 'Test.java',
      setupPattern: '@Test',
    }],
  ]);

  /**
   * Detect test framework from project context
   */
  detectFramework(code: string, fileName?: string, projectContext?: any): TestFramework | null {
    // Check package.json or imports for framework
    if (projectContext?.structure?.packageManager) {
      // Check for Jest
      if (code.includes('jest') || code.includes('@testing-library')) {
        return this.frameworks.get('jest') || null;
      }
      // Check for Vitest
      if (code.includes('vitest') || code.includes('import { describe')) {
        return this.frameworks.get('vitest') || null;
      }
      // Check for Mocha
      if (code.includes('mocha') || code.includes('require(\'mocha\')')) {
        return this.frameworks.get('mocha') || null;
      }
    }

    // Detect from file extension
    if (fileName?.endsWith('.py')) {
      return this.frameworks.get('pytest') || null;
    }
    if (fileName?.endsWith('.java')) {
      return this.frameworks.get('junit') || null;
    }

    // Default to Jest for JavaScript/TypeScript
    if (fileName?.match(/\.(js|ts|jsx|tsx)$/)) {
      return this.frameworks.get('jest') || null;
    }

    return null;
  }

  /**
   * Generate test file name
   */
  generateTestFileName(originalFileName: string, framework: TestFramework): string {
    const extension = originalFileName.split('.').pop();
    const baseName = originalFileName.replace(`.${extension}`, '');

    if (framework.name === 'pytest') {
      return `${baseName}${framework.testFileExtension}`;
    }

    if (framework.name === 'junit') {
      return `${baseName}${framework.testFileExtension}`;
    }

    // JavaScript frameworks
    return `${baseName}${framework.testFileExtension}`;
  }

  /**
   * Extract functions and classes from code
   */
  extractTestableItems(code: string, language: string): Array<{ name: string; type: 'function' | 'class' | 'method'; line: number }> {
    const items: Array<{ name: string; type: 'function' | 'class' | 'method'; line: number }> = [];

    if (language === 'javascript' || language === 'typescript') {
      // Extract functions
      const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\(/g;
      let match;
      let lineNumber = 1;
      const lines = code.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Functions
        if ((match = functionRegex.exec(line)) !== null) {
          const name = match[1] || match[2];
          if (name && name !== 'match') {
            items.push({ name, type: 'function', line: i + 1 });
          }
        }

        // Classes
        if (/^\s*(?:export\s+)?class\s+(\w+)/.test(line)) {
          const classMatch = line.match(/class\s+(\w+)/);
          if (classMatch) {
            items.push({ name: classMatch[1], type: 'class', line: i + 1 });
          }
        }

        // Methods (inside classes)
        if (/^\s+(?:public\s+|private\s+|protected\s+)?(\w+)\s*\(/.test(line)) {
          const methodMatch = line.match(/(\w+)\s*\(/);
          if (methodMatch && methodMatch[1] !== 'constructor') {
            items.push({ name: methodMatch[1], type: 'method', line: i + 1 });
          }
        }
      }
    } else if (language === 'python') {
      // Python functions and classes
      const functionRegex = /^def\s+(\w+)/gm;
      const classRegex = /^class\s+(\w+)/gm;
      let match;

      const lines = code.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if ((match = functionRegex.exec(line)) !== null) {
          items.push({ name: match[1], type: 'function', line: i + 1 });
        }
        if ((match = classRegex.exec(line)) !== null) {
          items.push({ name: match[1], type: 'class', line: i + 1 });
        }
      }
    }

    return items;
  }

  /**
   * Generate test code structure
   */
  generateTestStructure(
    code: string,
    fileName: string,
    framework: TestFramework,
    testableItems: Array<{ name: string; type: 'function' | 'class' | 'method' }>
  ): string {
    const testFileName = this.generateTestFileName(fileName, framework);
    const language = framework.language;

    let testCode = '';

    if (framework.name === 'jest' || framework.name === 'vitest') {
      testCode = `import { describe, it, expect } from '${framework.name}';\n`;
      testCode += `import { ${testableItems.map(item => item.name).join(', ')} } from './${fileName.replace(/\.[^/.]+$/, '')}';\n\n`;

      for (const item of testableItems) {
        testCode += `describe('${item.name}', () => {\n`;
        testCode += `  it('should work correctly', () => {\n`;
        testCode += `    // TODO: Add test cases\n`;
        testCode += `    expect(true).toBe(true);\n`;
        testCode += `  });\n`;
        testCode += `});\n\n`;
      }
    } else if (framework.name === 'mocha') {
      testCode = `const { describe, it } = require('mocha');\n`;
      testCode += `const { expect } = require('chai');\n`;
      testCode += `const { ${testableItems.map(item => item.name).join(', ')} } = require('./${fileName.replace(/\.[^/.]+$/, '')}');\n\n`;

      for (const item of testableItems) {
        testCode += `describe('${item.name}', () => {\n`;
        testCode += `  it('should work correctly', () => {\n`;
        testCode += `    // TODO: Add test cases\n`;
        testCode += `    expect(true).to.be.true;\n`;
        testCode += `  });\n`;
        testCode += `});\n\n`;
      }
    } else if (framework.name === 'pytest') {
      testCode = `import pytest\n`;
      testCode += `from ${fileName.replace(/\.[^/.]+$/, '').replace(/\//g, '.')} import ${testableItems.map(item => item.name).join(', ')}\n\n`;

      for (const item of testableItems) {
        testCode += `def test_${item.name}():\n`;
        testCode += `    """Test ${item.name} function."""\n`;
        testCode += `    # TODO: Add test cases\n`;
        testCode += `    assert True\n\n`;
      }
    } else if (framework.name === 'junit') {
      const className = fileName.replace(/\.[^/.]+$/, '');
      testCode = `import org.junit.Test;\n`;
      testCode += `import static org.junit.Assert.*;\n\n`;
      testCode += `public class ${className}Test {\n\n`;

      for (const item of testableItems) {
        testCode += `    @Test\n`;
        testCode += `    public void test${item.name.charAt(0).toUpperCase() + item.name.slice(1)}() {\n`;
        testCode += `        // TODO: Add test cases\n`;
        testCode += `        assertTrue(true);\n`;
        testCode += `    }\n\n`;
      }

      testCode += `}\n`;
    }

    return testCode;
  }
}

export const testGenerator = new TestGenerator();

