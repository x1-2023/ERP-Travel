// ══════════════════════════════════════════════════════════════════════════════
//                    MSW SETUP - BROWSER & NODE
// ══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// browser.ts - For browser/development use
// Copy to: src/mocks/browser.ts
// ═══════════════════════════════════════════════════════════════════════

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// ═══════════════════════════════════════════════════════════════════════
// server.ts - For Node.js/testing use
// Copy to: src/mocks/server.ts
// ═══════════════════════════════════════════════════════════════════════

// For testing environment (uncomment when needed)
// import { setupServer } from 'msw/node';
// import { handlers } from './handlers';
// export const server = setupServer(...handlers);
