// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * LAC VIET HR - MSW Mock Server
 * For Node.js environment (Vitest tests)
 */

export const server = setupServer(...handlers);
