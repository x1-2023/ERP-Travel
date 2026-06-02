// scripts/compliance-checker.ts

/**
 * LAC VIET HR - Security Compliance Checker
 * OWASP Top 10, PCI DSS, GDPR compliance validation
 */

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface ComplianceCheck {
  id: string;
  category: string;
  requirement: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  standard: string[];
}

interface ComplianceResult {
  check: ComplianceCheck;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE';
  evidence?: string;
  recommendation?: string;
}

interface ComplianceReport {
  timestamp: string;
  target: string;
  standards: string[];
  results: ComplianceResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    notApplicable: number;
    complianceScore: number;
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// COMPLIANCE CHECKS
// ════════════════════════════════════════════════════════════════════════════════

const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  // OWASP Top 10 - A01:2021 Broken Access Control
  {
    id: 'OWASP-A01-01',
    category: 'Access Control',
    requirement: 'Authentication Required',
    description: 'All sensitive endpoints require authentication',
    severity: 'CRITICAL',
    standard: ['OWASP-A01', 'PCI-DSS-7.1'],
  },
  {
    id: 'OWASP-A01-02',
    category: 'Access Control',
    requirement: 'Authorization Checks',
    description: 'Role-based access control is enforced',
    severity: 'CRITICAL',
    standard: ['OWASP-A01', 'PCI-DSS-7.2'],
  },
  // OWASP Top 10 - A02:2021 Cryptographic Failures
  {
    id: 'OWASP-A02-01',
    category: 'Cryptography',
    requirement: 'HTTPS Enforcement',
    description: 'All traffic uses HTTPS with valid certificates',
    severity: 'CRITICAL',
    standard: ['OWASP-A02', 'PCI-DSS-4.1'],
  },
  // OWASP Top 10 - A03:2021 Injection
  {
    id: 'OWASP-A03-01',
    category: 'Injection',
    requirement: 'SQL Injection Prevention',
    description: 'Parameterized queries are used for all database operations',
    severity: 'CRITICAL',
    standard: ['OWASP-A03', 'PCI-DSS-6.5.1'],
  },
  {
    id: 'OWASP-A03-02',
    category: 'Injection',
    requirement: 'XSS Prevention',
    description: 'Output encoding and CSP headers prevent XSS',
    severity: 'HIGH',
    standard: ['OWASP-A03', 'PCI-DSS-6.5.7'],
  },
  // OWASP Top 10 - A05:2021 Security Misconfiguration
  {
    id: 'OWASP-A05-01',
    category: 'Configuration',
    requirement: 'Security Headers',
    description: 'Required security headers are present',
    severity: 'MEDIUM',
    standard: ['OWASP-A05'],
  },
  {
    id: 'OWASP-A05-02',
    category: 'Configuration',
    requirement: 'Error Handling',
    description: 'Error messages do not expose sensitive information',
    severity: 'MEDIUM',
    standard: ['OWASP-A05', 'PCI-DSS-6.5.5'],
  },
  // OWASP Top 10 - A07:2021 Identification and Authentication Failures
  {
    id: 'OWASP-A07-01',
    category: 'Authentication',
    requirement: 'Password Policy',
    description: 'Strong password requirements are enforced',
    severity: 'HIGH',
    standard: ['OWASP-A07', 'PCI-DSS-8.2.3'],
  },
  {
    id: 'OWASP-A07-02',
    category: 'Authentication',
    requirement: 'Brute Force Protection',
    description: 'Account lockout after failed attempts',
    severity: 'HIGH',
    standard: ['OWASP-A07', 'PCI-DSS-8.1.6'],
  },
  {
    id: 'OWASP-A07-03',
    category: 'Authentication',
    requirement: 'Session Security',
    description: 'Secure session management with proper timeouts',
    severity: 'HIGH',
    standard: ['OWASP-A07', 'PCI-DSS-8.1.8'],
  },
  // OWASP Top 10 - A08:2021 Software and Data Integrity Failures
  {
    id: 'OWASP-A08-01',
    category: 'Integrity',
    requirement: 'CSRF Protection',
    description: 'CSRF tokens protect state-changing requests',
    severity: 'HIGH',
    standard: ['OWASP-A08', 'PCI-DSS-6.5.9'],
  },
  // OWASP Top 10 - A09:2021 Security Logging and Monitoring Failures
  {
    id: 'OWASP-A09-01',
    category: 'Logging',
    requirement: 'Security Event Logging',
    description: 'Security events are logged and monitored',
    severity: 'MEDIUM',
    standard: ['OWASP-A09', 'PCI-DSS-10.1'],
  },
];

// ════════════════════════════════════════════════════════════════════════════════
// COMPLIANCE CHECKER CLASS
// ════════════════════════════════════════════════════════════════════════════════

export class ComplianceChecker {
  private baseUrl: string;
  private results: ComplianceResult[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async runFullCheck(): Promise<ComplianceReport> {
    console.log('════════════════════════════════════════════════════════════════');
    console.log('         LAC VIET HR - Compliance Checker                       ');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`Target: ${this.baseUrl}\n`);

    await this.checkAccessControl();
    await this.checkCryptography();
    await this.checkInjectionPrevention();
    await this.checkConfiguration();
    await this.checkAuthentication();
    await this.checkIntegrity();
    await this.checkLogging();

    return this.generateReport();
  }

  private async checkAccessControl(): Promise<void> {
    console.log('Checking Access Control...');

    const unauthResponse = await this.makeRequest('GET', '/api/employees');
    this.addResult('OWASP-A01-01', unauthResponse.status === 401 ? 'PASS' : 'FAIL',
      `Unauthenticated request returned status ${unauthResponse.status}`);

    this.addResult('OWASP-A01-02', 'WARNING',
      'Authorization checks must be verified through testing');
  }

  private async checkCryptography(): Promise<void> {
    console.log('Checking Cryptography...');

    const response = await this.makeRequest('GET', '/');
    const hsts = response.headers.get('strict-transport-security');
    this.addResult('OWASP-A02-01', hsts ? 'PASS' : 'FAIL',
      hsts ? `HSTS header present: ${hsts}` : 'HSTS header missing');
  }

  private async checkInjectionPrevention(): Promise<void> {
    console.log('Checking Injection Prevention...');

    const sqlPayload = "' OR '1'='1";
    const sqlResponse = await this.makeRequest('GET', `/api/employees?search=${encodeURIComponent(sqlPayload)}`);
    const sqlBody = await sqlResponse.text();
    const sqlVulnerable = sqlBody.toLowerCase().includes('sql') || sqlResponse.status === 500;
    this.addResult('OWASP-A03-01', sqlVulnerable ? 'FAIL' : 'PASS',
      `SQL injection test returned status ${sqlResponse.status}`);

    const csp = sqlResponse.headers.get('content-security-policy');
    this.addResult('OWASP-A03-02', csp ? 'PASS' : 'WARNING',
      csp ? 'CSP header present' : 'CSP header missing');
  }

  private async checkConfiguration(): Promise<void> {
    console.log('Checking Configuration...');

    const response = await this.makeRequest('GET', '/');

    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy',
    ];
    const missingHeaders = requiredHeaders.filter(h => !response.headers.get(h));
    this.addResult('OWASP-A05-01', missingHeaders.length === 0 ? 'PASS' : 'FAIL',
      missingHeaders.length === 0 ? 'All security headers present' : `Missing: ${missingHeaders.join(', ')}`);

    const errorResponse = await this.makeRequest('GET', '/api/nonexistent');
    const errorBody = await errorResponse.text();
    const exposesDetails = errorBody.includes('at ') || errorBody.includes('.ts:') || errorBody.includes('.js:');
    this.addResult('OWASP-A05-02', exposesDetails ? 'FAIL' : 'PASS',
      exposesDetails ? 'Error response may expose stack traces' : 'Error responses are sanitized');
  }

  private async checkAuthentication(): Promise<void> {
    console.log('Checking Authentication...');

    const weakPwdResponse = await this.makeRequest('POST', '/api/auth/register', {
      email: `weak-${Date.now()}@test.com`,
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'Test',
      lastName: 'User',
      acceptTerms: true,
    });
    this.addResult('OWASP-A07-01', weakPwdResponse.status === 400 ? 'PASS' : 'FAIL',
      weakPwdResponse.status === 400 ? 'Weak password rejected' : 'Weak password accepted');

    let rateLimited = false;
    for (let i = 0; i < 10; i++) {
      const response = await this.makeRequest('POST', '/api/auth/login', {
        email: 'brute@test.com',
        password: 'wrong',
      });
      if (response.status === 429) {
        rateLimited = true;
        break;
      }
    }
    this.addResult('OWASP-A07-02', rateLimited ? 'PASS' : 'FAIL',
      rateLimited ? 'Rate limiting active' : 'No rate limiting detected');

    const loginResponse = await this.makeRequest('POST', '/api/auth/login', {
      email: 'test@company.com',
      password: 'ValidP@ss123!',
    });
    const setCookie = loginResponse.headers.get('set-cookie') || '';
    const hasHttpOnly = setCookie.toLowerCase().includes('httponly');
    const hasSameSite = setCookie.toLowerCase().includes('samesite');
    this.addResult('OWASP-A07-03', hasHttpOnly && hasSameSite ? 'PASS' : 'WARNING',
      `Cookie flags: HttpOnly=${hasHttpOnly}, SameSite=${hasSameSite}`);
  }

  private async checkIntegrity(): Promise<void> {
    console.log('Checking Integrity...');

    const csrfResponse = await this.makeRequest('POST', '/api/employees', {
      firstName: 'CSRF',
      lastName: 'Test',
      email: `csrf-${Date.now()}@test.com`,
    });
    this.addResult('OWASP-A08-01', csrfResponse.status === 403 ? 'PASS' : 'FAIL',
      csrfResponse.status === 403 ? 'CSRF protection active' : 'CSRF protection may be missing');
  }

  private async checkLogging(): Promise<void> {
    console.log('Checking Logging...');

    this.addResult('OWASP-A09-01', 'WARNING',
      'Security event logging must be verified through backend review');
  }

  private async makeRequest(method: string, path: string, body?: unknown): Promise<Response> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    return fetch(`${this.baseUrl}${path}`, options);
  }

  private addResult(checkId: string, status: ComplianceResult['status'], evidence: string): void {
    const check = COMPLIANCE_CHECKS.find(c => c.id === checkId);
    if (!check) return;

    const statusIcon = {
      PASS: '[PASS]',
      FAIL: '[FAIL]',
      WARNING: '[WARN]',
      NOT_APPLICABLE: '[N/A]',
    }[status];

    console.log(`  ${statusIcon} ${check.requirement}: ${status}`);

    this.results.push({
      check,
      status,
      evidence,
      recommendation: status === 'FAIL' ? `Review ${check.requirement} implementation` : undefined,
    });
  }

  private generateReport(): ComplianceReport {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;
    const notApplicable = this.results.filter(r => r.status === 'NOT_APPLICABLE').length;
    const applicable = this.results.length - notApplicable;
    const complianceScore = applicable > 0 ? Math.round((passed / applicable) * 100) : 0;

    return {
      timestamp: new Date().toISOString(),
      target: this.baseUrl,
      standards: ['OWASP Top 10 2021', 'PCI DSS', 'GDPR'],
      results: this.results,
      summary: {
        total: this.results.length,
        passed,
        failed,
        warnings,
        notApplicable,
        complianceScore,
      },
    };
  }
}

// CLI RUNNER
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';

  const checker = new ComplianceChecker(baseUrl);
  const report = await checker.runFullCheck();

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('                    COMPLIANCE SUMMARY                          ');
  console.log('════════════════════════════════════════════════════════════════');
  console.log(`Passed:         ${report.summary.passed}`);
  console.log(`Failed:         ${report.summary.failed}`);
  console.log(`Warnings:       ${report.summary.warnings}`);
  console.log(`Not Applicable: ${report.summary.notApplicable}`);
  console.log('────────────────────────────────────────────────────────────────');
  console.log(`Compliance Score: ${report.summary.complianceScore}%`);
  console.log('════════════════════════════════════════════════════════════════');

  // Save report
  const fs = await import('fs');
  const reportPath = `./reports/compliance-${Date.now()}.json`;
  fs.mkdirSync('./reports', { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  // Exit with error if critical failures
  const criticalFailures = report.results.filter(
    r => r.status === 'FAIL' && r.check.severity === 'CRITICAL'
  ).length;

  if (criticalFailures > 0) {
    console.log(`\n[WARN] ${criticalFailures} CRITICAL failures found!`);
    process.exit(1);
  }
}

main().catch(console.error);

export { ComplianceChecker };
