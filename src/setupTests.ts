import '@testing-library/jest-dom';

// Set up environment variables for tests
process.env.VITE_API_BASE_URL = 'https://api.example.com';

// Suppress React act warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: An update to') ||
       args[0].includes('Warning: `ReactDOMTestUtils.act`'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
