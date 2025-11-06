/**
 * Context Service - Analyzes codebase context for AI suggestions
 */

interface FileContext {
  name: string;
  content: string;
  language: string;
  dependencies?: string[];
  exports?: string[];
  imports?: string[];
}

interface ProjectContext {
  files: FileContext[];
  structure: {
    entryPoints: string[];
    mainFramework?: string;
    packageManager?: string;
  };
  cache: {
    timestamp: number;
    hash: string;
  };
}

class ContextService {
  private cache: Map<string, ProjectContext> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Analyze all open files and extract context
   */
  analyzeContext(files: Array<{ name: string; content: string; language: string }>): ProjectContext {
    const hash = this.generateHash(files);
    const cached = this.cache.get(hash);
    
    if (cached && Date.now() - cached.cache.timestamp < this.CACHE_DURATION) {
      return cached;
    }

    const fileContexts: FileContext[] = files.map(file => ({
      name: file.name,
      content: file.content,
      language: file.language,
      dependencies: this.extractDependencies(file.content, file.language),
      exports: this.extractExports(file.content, file.language),
      imports: this.extractImports(file.content, file.language),
    }));

    const structure = this.analyzeStructure(files);

    const context: ProjectContext = {
      files: fileContexts,
      structure,
      cache: {
        timestamp: Date.now(),
        hash,
      },
    };

    this.cache.set(hash, context);
    return context;
  }

  /**
   * Generate context summary for AI prompts
   */
  generateContextSummary(context: ProjectContext): string {
    const { files, structure } = context;
    
    let summary = `Project Context:\n`;
    summary += `Framework: ${structure.mainFramework || 'Unknown'}\n`;
    summary += `Package Manager: ${structure.packageManager || 'Unknown'}\n`;
    summary += `Entry Points: ${structure.entryPoints.join(', ') || 'None'}\n\n`;

    summary += `Files (${files.length}):\n`;
    files.forEach(file => {
      summary += `- ${file.name} (${file.language})\n`;
      if (file.exports && file.exports.length > 0) {
        summary += `  Exports: ${file.exports.slice(0, 3).join(', ')}${file.exports.length > 3 ? '...' : ''}\n`;
      }
      if (file.imports && file.imports.length > 0) {
        summary += `  Imports: ${file.imports.slice(0, 3).join(', ')}${file.imports.length > 3 ? '...' : ''}\n`;
      }
    });

    return summary;
  }

  /**
   * Get relevant files for a given context (e.g., files that import/exports match)
   */
  getRelevantFiles(context: ProjectContext, currentFile: string, searchTerm?: string): FileContext[] {
    const currentFileContext = context.files.find(f => f.name === currentFile);
    if (!currentFileContext) return [];

    if (searchTerm) {
      return context.files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Find files that import from current file or export what current file imports
    const relevantFiles = context.files.filter(file => {
      if (file.name === currentFile) return false;
      
      // Check if file imports from current file
      const importsFromCurrent = file.imports?.some(imp => 
        currentFileContext.exports?.includes(imp) || 
        currentFileContext.name.includes(imp)
      );

      // Check if file exports what current file imports
      const exportsWhatCurrentImports = currentFileContext.imports?.some(imp =>
        file.exports?.includes(imp)
      );

      return importsFromCurrent || exportsWhatCurrentImports;
    });

    return relevantFiles;
  }

  /**
   * Extract dependencies from file content
   */
  private extractDependencies(content: string, language: string): string[] {
    const deps: string[] = [];

    if (language === 'javascript' || language === 'typescript') {
      // Extract from import statements
      const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        deps.push(match[1]);
      }

      // Extract from require statements
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
      while ((match = requireRegex.exec(content)) !== null) {
        deps.push(match[1]);
      }
    } else if (language === 'python') {
      // Extract from import statements
      const importRegex = /^(?:from\s+([^\s]+)\s+)?import\s+([^\s]+)/gm;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        if (match[1]) deps.push(match[1]);
        if (match[2]) deps.push(match[2]);
      }
    }

    return [...new Set(deps)]; // Remove duplicates
  }

  /**
   * Extract exports from file content
   */
  private extractExports(content: string, language: string): string[] {
    const exports: string[] = [];

    if (language === 'javascript' || language === 'typescript') {
      // Named exports
      const namedExportRegex = /export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
      let match;
      while ((match = namedExportRegex.exec(content)) !== null) {
        exports.push(match[1]);
      }

      // Default export
      if (content.includes('export default')) {
        const defaultExportRegex = /export\s+default\s+(?:function\s+)?(\w+)|export\s+default\s+{[\s\S]*?}/;
        const defaultMatch = content.match(defaultExportRegex);
        if (defaultMatch) {
          exports.push('default');
        }
      }
    } else if (language === 'python') {
      // Python doesn't have explicit exports, but we can check __all__
      const allRegex = /__all__\s*=\s*\[([^\]]+)\]/;
      const match = content.match(allRegex);
      if (match) {
        match[1].split(',').forEach(item => {
          const trimmed = item.trim().replace(/['"]/g, '');
          if (trimmed) exports.push(trimmed);
        });
      }
    }

    return exports;
  }

  /**
   * Extract imports from file content
   */
  private extractImports(content: string, language: string): string[] {
    return this.extractDependencies(content, language); // Same logic
  }

  /**
   * Analyze project structure
   */
  private analyzeStructure(files: Array<{ name: string; content: string; language: string }>): {
    entryPoints: string[];
    mainFramework?: string;
    packageManager?: string;
  } {
    const entryPoints: string[] = [];
    let mainFramework: string | undefined;
    let packageManager: string | undefined;

    // Detect entry points
    files.forEach(file => {
      if (file.name.includes('index.') || file.name.includes('main.') || file.name.includes('app.')) {
        entryPoints.push(file.name);
      }
    });

    // Detect framework
    files.forEach(file => {
      if (file.content.includes('react') || file.content.includes('React')) {
        mainFramework = 'React';
      } else if (file.content.includes('vue')) {
        mainFramework = 'Vue';
      } else if (file.content.includes('angular')) {
        mainFramework = 'Angular';
      } else if (file.content.includes('express')) {
        mainFramework = 'Express';
      }
    });

    // Detect package manager (from file names or content)
    files.forEach(file => {
      if (file.name === 'package.json' || file.content.includes('package.json')) {
        packageManager = 'npm';
      } else if (file.name === 'yarn.lock' || file.content.includes('yarn.lock')) {
        packageManager = 'yarn';
      } else if (file.name === 'pnpm-lock.yaml' || file.content.includes('pnpm-lock.yaml')) {
        packageManager = 'pnpm';
      }
    });

    return { entryPoints, mainFramework, packageManager };
  }

  /**
   * Generate hash for caching
   */
  private generateHash(files: Array<{ name: string; content: string }>): string {
    const content = files.map(f => `${f.name}:${f.content}`).join('|');
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const contextService = new ContextService();

