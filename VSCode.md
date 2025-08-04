# VSCode Development Guide for Thirty Challenge

## Table of Contents
1. [Debugging Setup](#debugging-setup)
2. [Error Tracing](#error-tracing)
3. [Development Environments](#development-environments)
4. [VSCode Copilot Usage](#vscode-copilot-usage)
5. [Recommended MCPs](#recommended-mcps)
6. [Performance Analysis](#performance-analysis)
7. [Testing Workflow](#testing-workflow)
8. [Essential Extensions](#essential-extensions)

## Debugging Setup

### 1. Browser Debugger Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome (Vite Dev)",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true,
      "userDataDir": "${workspaceFolder}/.vscode/chrome-debug-profile"
    },
    {
      "name": "Launch Chrome (Netlify Dev)",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:8888",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true,
      "userDataDir": "${workspaceFolder}/.vscode/chrome-debug-profile-netlify"
    },
    {
      "name": "Attach to Chrome",
      "request": "attach",
      "type": "chrome",
      "port": 9222,
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### 2. Node.js Debugging for Netlify Functions

Add to `.vscode/launch.json`:

```json
{
  "name": "Debug Netlify Functions",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/node_modules/.bin/netlify",
  "args": ["functions:serve", "--port", "9999"],
  "env": {
    "NODE_ENV": "development"
  },
  "console": "integratedTerminal",
  "restart": true,
  "protocol": "inspector"
}
```

### 3. React Developer Tools Integration

Install browser extensions:
- React Developer Tools
- Redux DevTools (for state inspection)
- Supabase Debug Tools

## Error Tracing

### 1. Console Debugging Patterns

```typescript
// Enhanced error logging for development
const debugLog = (component: string, action: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.group(`🐛 ${component} - ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.trace('Call stack');
    console.groupEnd();
  }
};

// Usage in components
const MyComponent = () => {
  const handleClick = () => {
    debugLog('MyComponent', 'handleClick', { userId: 123 });
    // ... rest of logic
  };
};
```

### 2. Error Boundary for React

Create `src/components/ErrorBoundary.tsx`:

```typescript
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 React Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    // Send to error reporting service in production
    if (import.meta.env.PROD) {
      // reportError(error, errorInfo);
    }
    
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Something went wrong
            </h2>
            {import.meta.env.DEV && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600">
                  Error Details (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3. Network Request Debugging

Create `src/utils/debugNetworkRequests.ts`:

```typescript
// Monitor all network requests
export const enableNetworkDebugging = () => {
  if (import.meta.env.DEV) {
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || 'GET';
      
      console.group(`🌐 ${method} ${url}`);
      console.log('Request:', { input, init });
      
      try {
        const response = await originalFetch(input, init);
        console.log('Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        console.groupEnd();
        return response;
      } catch (error) {
        console.error('Network Error:', error);
        console.groupEnd();
        throw error;
      }
    };
  }
};

// Call in main.tsx during development
```

## Development Environments

### Npm Run Dev vs Netlify Dev

| Aspect | `npm run dev` (Vite) | `netlify dev` |
|--------|---------------------|---------------|
| **Purpose** | Frontend-only development | Full-stack development with serverless functions |
| **Port** | 5173 (default) | 8888 (public), 5173 (internal) |
| **Serverless Functions** | ❌ Not available | ✅ Available at `/.netlify/functions/` |
| **Environment Variables** | Only `VITE_*` vars | All vars including function secrets |
| **Hot Reload** | ✅ Instant | ✅ Frontend only (functions require restart) |
| **Build Process** | Vite bundling | Vite + Netlify function bundling |
| **Production Similarity** | Partial | High (matches Netlify hosting) |

### When to Use Each

**Use `npm run dev` when:**
- Working on UI components
- Testing React state management
- Rapid frontend iteration
- No serverless function calls needed

**Use `netlify dev` when:**
- Testing Daily.co integration (requires functions)
- Testing Supabase with serverless functions
- Full end-to-end testing
- Debugging environment variable issues

### Setup Instructions

#### 1. Frontend-Only Development

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Open http://localhost:5173
# Fast hot reload, frontend-only features
```

#### 2. Full-Stack Development

```bash
# Ensure .env file exists with all required variables
cp .env.example .env
# Edit .env with your actual API keys

# Terminal 1: Start Netlify dev server
npm run dev:netlify

# Open http://localhost:8888
# Includes serverless functions at /.netlify/functions/
```

## VSCode Copilot Usage

### 1. Effective Prompting Strategies

```typescript
// Good: Specific context with types
// @copilot Generate a React hook for managing Daily.co room state with TypeScript
const useDailyRoom = (roomName: string) => {
  // Copilot will generate appropriate hook logic
};

// Good: Component with clear requirements  
// @copilot Create a bilingual button component that switches between English/Arabic
// Should accept language prop and onClick handler
const LanguageToggle = ({ language, onClick }: Props) => {
  // Copilot generates with proper types and styling
};

// Good: Error handling pattern
// @copilot Add proper error boundaries for async Supabase operations
const handleSupabaseQuery = async () => {
  // Copilot adds try-catch and error handling
};
```

### 2. Copilot Chat Commands

- **`/explain`** - Understand complex code sections
- **`/fix`** - Fix bugs and issues
- **`/tests`** - Generate unit tests
- **`/doc`** - Generate documentation
- **`/review`** - Code review suggestions

### 3. Workspace-Specific Prompts

```typescript
// Use project context for better suggestions
// @copilot Following the Thirty Challenge project patterns, create a new quiz segment
// Should use Jotai atoms for state and follow the segment structure in src/segments/

// @copilot Add Supabase real-time subscription following the project's channel patterns
// Use the existing connection utilities in src/api/supabase.ts
```

## Recommended MCPs

### 1. GitHub MCP
- **Purpose**: Direct repository access, issue tracking, PR management
- **Setup**: Already integrated in your development environment
- **Usage**: Code reviews, commit history analysis, automated testing

### 2. Supabase MCP
- **Purpose**: Database schema management, real-time debugging
- **Benefits**: Direct SQL query execution, table inspection, real-time subscription debugging

### 3. Daily.co MCP (Custom)
- **Purpose**: Room management, video call debugging
- **Potential Features**: Room creation monitoring, participant tracking, call quality metrics

### 4. Bundle Analyzer MCP
- **Purpose**: Automated bundle size monitoring
- **Integration**: Hook into Vite build process
- **Alerts**: Warn when bundle exceeds 200kB limit

### 5. Performance Monitoring MCP
- **Purpose**: Real-time performance metrics
- **Metrics**: Component render times, network request latency, memory usage

## Performance Analysis

### 1. Bundle Size Monitoring

```bash
# Analyze current bundle
npm run analyze

# Check dependency impact
npm run dep:graph

# Monitor in real-time during development
npm run build && npx vite-bundle-analyzer
```

### 2. React Performance Profiling

```typescript
// Enable React Profiler in development
import { Profiler } from 'react';

const onRenderCallback = (id: string, phase: string, actualDuration: number) => {
  if (import.meta.env.DEV) {
    console.log(`🏃‍♂️ Component ${id} (${phase}): ${actualDuration}ms`);
  }
};

// Wrap components to monitor
<Profiler id="GameLobby" onRender={onRenderCallback}>
  <GameLobby />
</Profiler>
```

### 3. Network Request Optimization

```typescript
// Identify redundant API calls
const apiCallTracker = new Map<string, { count: number, lastCalled: number }>();

const trackApiCall = (endpoint: string) => {
  const now = Date.now();
  const existing = apiCallTracker.get(endpoint);
  
  if (existing) {
    existing.count++;
    if (now - existing.lastCalled < 1000) { // Called within 1 second
      console.warn(`⚠️ Potential redundant API call: ${endpoint} (${existing.count} times)`);
    }
    existing.lastCalled = now;
  } else {
    apiCallTracker.set(endpoint, { count: 1, lastCalled: now });
  }
};
```

## Testing Workflow

### 1. Component Testing Setup

Create `.vscode/settings.json`:

```json
{
  "jest.jestCommandLine": "npm test",
  "jest.autoRun": {
    "watch": true,
    "onSave": "test-src-file"
  },
  "jest.showCoverageOnLoad": true,
  "testing.automaticallyOpenPeekView": "never"
}
```

### 2. Test File Templates

```typescript
// Component test template
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageToggle } from '../LanguageToggle';

describe('LanguageToggle', () => {
  it('should toggle between English and Arabic', () => {
    const mockOnClick = jest.fn();
    render(<LanguageToggle language="en" onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledWith('ar');
  });
});

// Integration test template
import { renderHook } from '@testing-library/react';
import { useDailyRoom } from '../hooks/useDailyRoom';

describe('useDailyRoom Integration', () => {
  it('should handle room creation and cleanup', async () => {
    const { result, unmount } = renderHook(() => useDailyRoom('test-room'));
    
    // Test room creation
    expect(result.current.isLoading).toBe(true);
    
    // Wait for room creation
    await waitFor(() => {
      expect(result.current.room).toBeDefined();
    });
    
    // Test cleanup on unmount
    unmount();
    // Verify cleanup calls
  });
});
```

### 3. E2E Testing with Playwright

```typescript
// tests/e2e/gameflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('should complete full game session', async ({ page }) => {
    // Start with lobby
    await page.goto('http://localhost:8888');
    
    // Test language toggle
    await page.click('[data-testid="language-toggle"]');
    await expect(page.locator('h1')).toContainText('قاعة الانتظار');
    
    // Test room creation
    await page.click('[data-testid="create-room"]');
    await expect(page.url()).toContain('/room/');
    
    // Test video integration
    await expect(page.locator('[data-testid="video-container"]')).toBeVisible();
  });
});
```

## Essential Extensions

### 1. Core Development

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "github.copilot",
    "github.copilot-chat"
  ]
}
```

### 2. React & State Management

```json
{
  "recommendations": [
    "ms-vscode.vscode-react-native",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "bradlc.vscode-tailwindcss",
    "jotai-labs.jotai-vscode"
  ]
}
```

### 3. Database & API

```json
{
  "recommendations": [
    "supabase.supabase",
    "humao.rest-client",
    "ms-vscode.vscode-json"
  ]
}
```

### 4. Quality & Performance

```json
{
  "recommendations": [
    "ms-vscode.vscode-jest",
    "ms-playwright.playwright",
    "gruntfuggly.todo-tree",
    "streetsidesoftware.code-spell-checker",
    "yzhang.markdown-all-in-one"
  ]
}
```

## Quick Debugging Checklist

### 🐛 Application Not Loading
1. Check console for JavaScript errors
2. Verify environment variables in `.env`
3. Ensure correct development server (`npm run dev` vs `netlify dev`)
4. Check network tab for failed requests

### 🌐 API Errors
1. Verify function deployment: `netlify functions:list`
2. Check function logs: `netlify dev` terminal output
3. Test function directly: `curl http://localhost:8888/.netlify/functions/function-name`
4. Validate environment variables are accessible in functions

### 🎥 Daily.co Issues
1. Test API key: Check response from create-daily-room function
2. Verify domain configuration in `.env`
3. Check browser permissions for camera/microphone
4. Monitor Daily.co dashboard for room creation

### 📱 Supabase Connection
1. Test connection in browser dev tools: `window.supabase`
2. Check real-time subscriptions in Supabase dashboard
3. Verify row-level security policies
4. Test queries in Supabase SQL editor

### 🎨 UI/Styling Issues
1. Check Tailwind classes are properly purged
2. Verify responsive design in dev tools
3. Test both English/Arabic layouts
4. Check console for hydration errors

## Flow Analysis Commands

```bash
# Generate dependency graph
npm run dep:graph

# Analyze bundle composition
npm run analyze

# Check for circular dependencies
npx madge --circular src

# Performance audit
npx lighthouse http://localhost:8888 --view

# Bundle size tracking
npx vite-bundle-analyzer dist/stats.html
```

This comprehensive guide should help you leverage VSCode effectively for debugging, testing, and optimizing the Thirty Challenge application. The key is to use the right development environment for your current task and leverage the appropriate debugging tools for each layer of the stack.