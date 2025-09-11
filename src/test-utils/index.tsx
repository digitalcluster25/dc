import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock theme provider for testing
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-theme='light'>{children}</div>;
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <MockThemeProvider>{children}</MockThemeProvider>
    ),
    ...options,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test utilities
export const createMockUser = () => ({
  name: 'Test User',
  email: 'test@example.com',
});

export const createMockNavigationItem = () => ({
  name: 'Test Page',
  href: '/test',
});

// Helper to wait for async operations
export const waitFor = (callback: () => void, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      try {
        callback();
        resolve(undefined);
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, 10);
        }
      }
    };

    check();
  });
};
