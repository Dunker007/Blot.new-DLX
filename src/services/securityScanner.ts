/**
 * Security Scanner - Detects common security vulnerabilities in code
 */

export interface SecurityIssue {
  type: 'sql-injection' | 'xss' | 'command-injection' | 'path-traversal' | 'hardcoded-secret' | 'insecure-random' | 'weak-crypto' | 'missing-validation';
  severity: 'high' | 'medium' | 'low';
  line: number;
  column?: number;
  message: string;
  suggestion: string;
  code: string;
}

interface ScanResult {
  issues: SecurityIssue[];
  score: number; // 0-100, higher is better
  hasIssues: boolean;
}

class SecurityScanner {
  private patterns: Array<{
    type: SecurityIssue['type'];
    severity: SecurityIssue['severity'];
    regex: RegExp;
    message: string;
    suggestion: string;
  }> = [
    // SQL Injection
    {
      type: 'sql-injection',
      severity: 'high',
      regex: /['"]\s*\+\s*['"]|['"]\s*\+\s*\$|query\s*\(\s*['"]\s*SELECT|query\s*\(\s*['"]\s*INSERT|query\s*\(\s*['"]\s*UPDATE|query\s*\(\s*['"]\s*DELETE|\.execute\s*\(\s*['"]\s*(SELECT|INSERT|UPDATE|DELETE)/gi,
      message: 'Potential SQL injection vulnerability detected',
      suggestion: 'Use parameterized queries or prepared statements instead of string concatenation',
    },
    // XSS (Cross-Site Scripting)
    {
      type: 'xss',
      severity: 'high',
      regex: /innerHTML\s*=|dangerouslySetInnerHTML|document\.write|eval\s*\(|setTimeout\s*\(['"]|setInterval\s*\(['"]|<script/i,
      message: 'Potential XSS vulnerability detected',
      suggestion: 'Use safe DOM manipulation methods like textContent or sanitize user input',
    },
    // Command Injection
    {
      type: 'command-injection',
      severity: 'high',
      regex: /exec\s*\(|spawn\s*\(|execSync|execFile|child_process|system\s*\(|shell_exec/i,
      message: 'Potential command injection vulnerability detected',
      suggestion: 'Validate and sanitize user input before executing system commands',
    },
    // Path Traversal
    {
      type: 'path-traversal',
      severity: 'medium',
      regex: /\.\.\/|\.\.\\|\.\.\/\.\.|readFile\s*\(|writeFile\s*\(|fs\.readFile|fs\.writeFile|require\s*\(['"](\.\.|\.\.\/)/i,
      message: 'Potential path traversal vulnerability detected',
      suggestion: 'Validate and sanitize file paths, use path.join() and normalize paths',
    },
    // Hardcoded Secrets
    {
      type: 'hardcoded-secret',
      severity: 'high',
      regex: /(?:password|secret|api[_-]?key|token|auth[_-]?key)\s*=\s*['"]([^'"]{8,})['"]|(?:password|secret|api[_-]?key|token|auth[_-]?key)\s*:\s*['"]([^'"]{8,})['"]/i,
      message: 'Hardcoded secret detected',
      suggestion: 'Move secrets to environment variables or secure configuration files',
    },
    // Insecure Random
    {
      type: 'insecure-random',
      severity: 'medium',
      regex: /Math\.random|new Random\(\)|random\(\)/i,
      message: 'Insecure random number generation detected',
      suggestion: 'Use cryptographically secure random number generators (crypto.randomBytes)',
    },
    // Weak Cryptography
    {
      type: 'weak-crypto',
      severity: 'medium',
      regex: /md5|sha1|DES|RC4|RC2/i,
      message: 'Weak cryptographic algorithm detected',
      suggestion: 'Use modern cryptographic algorithms (SHA-256, AES-256, etc.)',
    },
    // Missing Input Validation
    {
      type: 'missing-validation',
      severity: 'low',
      regex: /(?:req\.|request\.|params\.|query\.|body\.)[a-zA-Z]+\s*(?:\.|\[)/i,
      message: 'Potential missing input validation',
      suggestion: 'Add input validation and sanitization for user-provided data',
    },
  ];

  /**
   * Scan code for security issues
   */
  scanCode(code: string, fileName?: string): ScanResult {
    const issues: SecurityIssue[] = [];
    const lines = code.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;

      for (const pattern of this.patterns) {
        const matches = line.matchAll(pattern.regex);
        
        for (const match of matches) {
          // Skip if it's in a comment
          const beforeMatch = line.substring(0, match.index || 0);
          if (this.isInComment(beforeMatch, line)) {
            continue;
          }

          const column = (match.index || 0) + 1;
          
          issues.push({
            type: pattern.type,
            severity: pattern.severity,
            line: lineNumber,
            column,
            message: pattern.message,
            suggestion: pattern.suggestion,
            code: line.trim(),
          });
        }
      }
    }

    // Calculate security score (0-100)
    const score = this.calculateScore(issues);

    return {
      issues,
      score,
      hasIssues: issues.length > 0,
    };
  }

  /**
   * Scan multiple files
   */
  scanFiles(files: Array<{ name: string; content: string }>): Map<string, ScanResult> {
    const results = new Map<string, ScanResult>();

    for (const file of files) {
      const result = this.scanCode(file.content, file.name);
      results.set(file.name, result);
    }

    return results;
  }

  /**
   * Get summary of all issues
   */
  getSummary(results: Map<string, ScanResult>): {
    totalIssues: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
    averageScore: number;
    filesWithIssues: number;
  } {
    let totalIssues = 0;
    let highSeverity = 0;
    let mediumSeverity = 0;
    let lowSeverity = 0;
    let totalScore = 0;
    let filesWithIssues = 0;

    for (const result of results.values()) {
      if (result.hasIssues) {
        filesWithIssues++;
      }
      totalIssues += result.issues.length;
      totalScore += result.score;

      for (const issue of result.issues) {
        if (issue.severity === 'high') highSeverity++;
        else if (issue.severity === 'medium') mediumSeverity++;
        else lowSeverity++;
      }
    }

    const averageScore = results.size > 0 ? totalScore / results.size : 100;

    return {
      totalIssues,
      highSeverity,
      mediumSeverity,
      lowSeverity,
      averageScore: Math.round(averageScore),
      filesWithIssues,
    };
  }

  /**
   * Calculate security score based on issues
   */
  private calculateScore(issues: SecurityIssue[]): number {
    if (issues.length === 0) return 100;

    let penalty = 0;
    for (const issue of issues) {
      switch (issue.severity) {
        case 'high':
          penalty += 15;
          break;
        case 'medium':
          penalty += 8;
          break;
        case 'low':
          penalty += 3;
          break;
      }
    }

    return Math.max(0, 100 - penalty);
  }

  /**
   * Check if position is in a comment
   */
  private isInComment(beforeMatch: string, line: string): boolean {
    // Check for single-line comments
    if (beforeMatch.includes('//')) return true;
    
    // Check for multi-line comments (simple check)
    const commentStart = beforeMatch.lastIndexOf('/*');
    const commentEnd = beforeMatch.lastIndexOf('*/');
    if (commentStart > commentEnd) return true;

    // Check for string literals (don't flag code inside strings)
    const singleQuotes = (beforeMatch.match(/'/g) || []).length;
    const doubleQuotes = (beforeMatch.match(/"/g) || []).length;
    const backticks = (beforeMatch.match(/`/g) || []).length;
    
    // If odd number of quotes, might be inside string
    // This is a simple heuristic
    return false; // For now, don't skip strings - user input in strings is still a concern
  }

  /**
   * Get issue type description
   */
  getIssueTypeDescription(type: SecurityIssue['type']): string {
    const descriptions: Record<SecurityIssue['type'], string> = {
      'sql-injection': 'SQL Injection allows attackers to manipulate database queries',
      'xss': 'Cross-Site Scripting allows attackers to inject malicious scripts',
      'command-injection': 'Command Injection allows attackers to execute system commands',
      'path-traversal': 'Path Traversal allows attackers to access files outside intended directory',
      'hardcoded-secret': 'Hardcoded secrets expose sensitive credentials in source code',
      'insecure-random': 'Insecure random number generation can be predictable',
      'weak-crypto': 'Weak cryptographic algorithms can be easily broken',
      'missing-validation': 'Missing input validation can lead to various vulnerabilities',
    };

    return descriptions[type] || 'Unknown security issue';
  }
}

export const securityScanner = new SecurityScanner();

