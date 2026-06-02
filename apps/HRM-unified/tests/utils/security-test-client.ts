// tests/utils/security-test-client.ts

/**
 * LAC VIET HR - Security Test Client
 * HTTP client wrapper for security testing with utilities
 */

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface ClientOptions {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECURITY TEST CLIENT
// ════════════════════════════════════════════════════════════════════════════════

export class SecurityTestClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;
  private csrfToken: string | null = null;
  private cookies: Map<string, string> = new Map();

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.timeout = options.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'LAC-VIET-HR-Security-Test/1.0',
      ...options.defaultHeaders,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HTTP METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  async get(path: string, options: RequestOptions = {}): Promise<Response> {
    return this.request('GET', path, undefined, options);
  }

  async post(path: string, body?: unknown, options: RequestOptions = {}): Promise<Response> {
    return this.request('POST', path, body, options);
  }

  async put(path: string, body?: unknown, options: RequestOptions = {}): Promise<Response> {
    return this.request('PUT', path, body, options);
  }

  async patch(path: string, body?: unknown, options: RequestOptions = {}): Promise<Response> {
    return this.request('PATCH', path, body, options);
  }

  async delete(path: string, options: RequestOptions = {}): Promise<Response> {
    return this.request('DELETE', path, undefined, options);
  }

  async request(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Add cookies if present
    if (this.cookies.size > 0) {
      headers['Cookie'] = Array.from(this.cookies.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    };

    // Remove Content-Type for FormData
    if (body instanceof FormData) {
      delete (headers as Record<string, string>)['Content-Type'];
    }

    try {
      const response = await fetch(url, fetchOptions);

      // Parse and store cookies
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        this.parseCookies(setCookie);
      }

      return response;
    } catch (error) {
      console.error(`Request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTHENTICATION HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  async login(email = 'test@company.com', password = 'ValidP@ssw0rd123!'): Promise<Response> {
    const response = await this.post('/api/auth/login', { email, password });

    if (response.ok) {
      const data = await response.clone().json();
      this.authToken = data.accessToken || data.token;
    }

    return response;
  }

  async loginAndGetToken(email: string, password: string): Promise<string> {
    const response = await this.post('/api/auth/login', { email, password });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    return data.accessToken || data.token;
  }

  async logout(): Promise<Response> {
    const response = await this.post('/api/auth/logout', {}, {
      headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
    });

    this.authToken = null;
    this.csrfToken = null;
    this.cookies.clear();

    return response;
  }

  async getAuthToken(): Promise<string> {
    if (!this.authToken) {
      await this.login();
    }
    return this.authToken!;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CSRF HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  async getCSRFToken(): Promise<string> {
    if (!this.csrfToken) {
      const response = await this.get('/api/csrf-token');
      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.token || data.csrfToken;
      }
    }
    return this.csrfToken || '';
  }

  async getCSRFTokenForUser(email: string): Promise<string> {
    // Login as different user to get their CSRF token
    const response = await this.post('/api/auth/login', {
      email,
      password: 'ValidP@ssw0rd123!',
    });

    if (response.ok) {
      const csrfResponse = await this.get('/api/csrf-token');
      if (csrfResponse.ok) {
        const data = await csrfResponse.json();
        return data.token || data.csrfToken;
      }
    }

    return '';
  }

  createExpiredCSRFToken(): string {
    // Create a token that appears valid but is expired
    const expiredTimestamp = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    return `expired-csrf-token-${expiredTimestamp}`;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SESSION HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  extractSessionId(response: Response): string {
    const setCookie = response.headers.get('set-cookie') || '';
    const match = setCookie.match(/session=([^;]+)/);
    return match ? match[1] : '';
  }

  async simulateInactivity(ms: number): Promise<void> {
    // In real tests, this would manipulate time or wait
    // For unit tests, we'll mock the session expiry
    await new Promise(resolve => setTimeout(resolve, Math.min(ms, 1000)));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COOKIE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private parseCookies(setCookie: string): void {
    const cookies = setCookie.split(',').map(c => c.trim());

    for (const cookie of cookies) {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      if (name && value) {
        this.cookies.set(name.trim(), value.trim());
      }
    }
  }

  getCookie(name: string): string | undefined {
    return this.cookies.get(name);
  }

  setCookie(name: string, value: string): void {
    this.cookies.set(name, value);
  }

  clearCookies(): void {
    this.cookies.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  async makeRapidRequests(
    count: number,
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<Response[]> {
    const results: Response[] = [];

    for (let i = 0; i < count; i++) {
      const response = await this.request(method, path, body, options);
      results.push(response);

      // Stop if rate limited
      if (response.status === 429) {
        break;
      }
    }

    return results;
  }

  async makeConcurrentRequests(
    count: number,
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<Response[]> {
    const requests = Array(count).fill(null).map(() =>
      this.request(method, path, body, options)
    );

    return Promise.all(requests);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ════════════════════════════════════════════════════════════════════════════════

export function createSecurityTestClient(baseUrl?: string): SecurityTestClient {
  return new SecurityTestClient({
    baseUrl: baseUrl || process.env.TEST_BASE_URL || 'http://localhost:3000',
  });
}

export default SecurityTestClient;
