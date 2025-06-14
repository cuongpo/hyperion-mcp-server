/**
 * Jest setup file for Hyperion MCP Server tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.HYPERION_RPC_URL = 'https://hyperion-testnet.metisdevops.link';
process.env.HYPERION_CHAIN_ID = '133717';
process.env.HYPERION_NETWORK_NAME = 'Hyperion Testnet';
process.env.HYPERION_CURRENCY_SYMBOL = 'tMETIS';
process.env.HYPERION_EXPLORER_URL = 'https://hyperion-testnet-explorer.metisdevops.link';

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console.error and console.warn during tests unless explicitly needed
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(10000);
