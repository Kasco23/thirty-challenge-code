# VSCode Development Guide for Thirty Challenge

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Debugging Setup](#debugging-setup)
3. [Error Tracing](#error-tracing)
4. [Development Environments](#development-environments)
5. [VSCode Copilot Usage](#vscode-copilot-usage)
6. [Recommended MCPs](#recommended-mcps)
7. [Performance Analysis](#performance-analysis)
8. [Testing Workflow](#testing-workflow)
9. [Essential Extensions](#essential-extensions)

## Prerequisites

### Firefox Setup for Development

**Step 1:** Install Firefox Developer Edition (Recommended)
- Download from [https://www.mozilla.org/en-US/firefox/developer/](https://www.mozilla.org/en-US/firefox/developer/)
- Developer Edition includes enhanced debugging tools and experimental features
- Regular Firefox also works but with fewer developer-specific features

**Step 2:** Configure Firefox for Development
- Open Firefox and navigate to `about:config`
- Search for and set these preferences:
  - `devtools.debugger.remote-enabled` → `true`
  - `devtools.chrome.enabled` → `true`
  - `devtools.debugger.prompt-connection` → `false`

**Step 3:** Install VS Code Firefox Debugger Extension
- Open VS Code Extensions panel (Ctrl+Shift+X)
- Search for "Debugger for Firefox"
- Install the official extension by Mozilla
- Restart VS Code after installation

## Debugging Setup

### 1. Browser Debugger Configuration

**Step 1:** Install the Firefox Debugger extension for VS Code:
- Open VS Code Extensions panel (Ctrl+Shift+X)
- Search for "Debugger for Firefox" 
- Install the official Firefox debugger extension

**Step 2:** Create `.vscode/launch.json` in your project root:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Firefox (Vite Dev)",
      "request": "launch",
      "type": "firefox",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    },
    {
      "name": "Launch Firefox (Netlify Dev)",
      "request": "launch",
      "type": "firefox",
      "url": "http://localhost:8888",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    },
    {
      "name": "Attach to Firefox",
      "request": "attach",
      "type": "firefox",
      "port": 6000,
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

**Step 3:** Start your development server:
- For Vite development: Run `npm run dev` in terminal
- For Netlify development: Run `npm run dev:netlify` in terminal

**Step 4:** Start debugging:
- Open VS Code's Debug panel (Ctrl+Shift+D)
- Select "Launch Firefox (Vite Dev)" or "Launch Firefox (Netlify Dev)" from dropdown
- Click the green play button to start debugging

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

**Step 1:** Install Firefox browser extensions for development:
- Open Firefox and navigate to Firefox Add-ons (Ctrl+Shift+A)
- Search for and install:
  - **React Developer Tools** - Essential for React component debugging
  - **Redux DevTools** - For state inspection and time-travel debugging
  - **Vue.js devtools** - Alternative state management inspection

**Step 2:** Enable Developer Mode in Firefox:
- Open Firefox Developer Tools (F12)
- Navigate to Settings (gear icon)
- Check "Enable browser chrome and add-on debugging toolboxes"
- Check "Enable remote debugging"

**Step 3:** Verify extensions are working:
- Open your React application in Firefox
- Open Developer Tools (F12)
- Look for "React" and "Redux" tabs in the developer tools panel

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

**Step 1:** Ensure Firefox is installed and up to date on your system

**Step 2:** Open terminal and start the Vite development server:
```bash
# Navigate to project directory
cd your-project-directory

# Start Vite dev server  
npm run dev
```

**Step 3:** The server will start on http://localhost:5173

**Step 4:** Launch debugging in VS Code:
- Open VS Code Debug panel (Ctrl+Shift+D)
- Select "Launch Firefox (Vite Dev)" from the dropdown
- Click the green play button
- Firefox will open automatically with debugging enabled

**Benefits:** Fast hot reload, frontend-only features, ideal for UI development

#### 2. Full-Stack Development

**Step 1:** Ensure you have a properly configured `.env` file:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual API keys using your preferred editor
nano .env  # or code .env for VS Code
```

**Step 2:** Start the Netlify development server:
```bash
# Start Netlify dev server (includes serverless functions)
npm run dev:netlify
```

**Step 3:** The server will start on http://localhost:8888

**Step 4:** Launch debugging in VS Code:
- Open VS Code Debug panel (Ctrl+Shift+D)  
- Select "Launch Firefox (Netlify Dev)" from the dropdown
- Click the green play button
- Firefox will open automatically with debugging enabled

**Step 5:** Verify serverless functions are available:
- Functions are accessible at `http://localhost:8888/.netlify/functions/`
- Check the terminal for function compilation status

**Benefits:** Full environment simulation, serverless functions available, environment variables loaded

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
    "firefox-devtools.vscode-firefox-debug",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "github.copilot",
    "github.copilot-chat"
  ]
}
```

**Important:** The Firefox debugger extension (`firefox-devtools.vscode-firefox-debug`) is essential for debugging React applications in Firefox through VS Code.

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
**Step 1:** Open Firefox Developer Tools (F12) and check Console tab for JavaScript errors
**Step 2:** Verify environment variables are properly set in `.env` file:
   - Copy `.env.example` to `.env` if it doesn't exist
   - Ensure all required `VITE_*` variables are defined
**Step 3:** Confirm you're using the correct development server:
   - Use `npm run dev` for frontend-only development (port 5173)
   - Use `npm run dev:netlify` for full-stack development (port 8888)
**Step 4:** Check Network tab in Firefox Developer Tools for failed requests:
   - Look for 404, 500, or CORS errors
   - Verify API endpoints are correct

### 🌐 API Errors
1. Verify function deployment: `netlify functions:list`
2. Check function logs: `netlify dev` terminal output
3. Test function directly: `curl http://localhost:8888/.netlify/functions/function-name`
4. Validate environment variables are accessible in functions

### 🎥 Daily.co Issues
**Step 1:** Test API key by checking the response from create-daily-room function
**Step 2:** Verify domain configuration in `.env` file:
   - Ensure `VITE_DAILY_DOMAIN` is set correctly
   - Check `DAILY_API_KEY` is valid
**Step 3:** Check Firefox permissions for camera/microphone:
   - Click the shield/lock icon in Firefox address bar
   - Ensure Camera and Microphone are set to "Allow"
   - Try refreshing the page after granting permissions
**Step 4:** Monitor Daily.co dashboard for room creation:
   - Log into your Daily.co dashboard
   - Check if rooms are being created successfully

### 📱 Supabase Connection
**Step 1:** Test connection in Firefox Developer Tools:
   - Open Firefox Developer Tools (F12)
   - Navigate to Console tab
   - Type `window.supabase` and press Enter
   - Should return the Supabase client object
**Step 2:** Check real-time subscriptions in Supabase dashboard:
   - Log into your Supabase project dashboard
   - Navigate to Database > Realtime
   - Verify subscriptions are active
**Step 3:** Verify row-level security policies:
   - Open Supabase dashboard > Authentication > Policies
   - Ensure policies allow your operations
**Step 4:** Test queries in Supabase SQL editor:
   - Use the SQL editor to run test queries
   - Verify data structure matches your application expectations

### 🎨 UI/Styling Issues
**Step 1:** Check Tailwind classes are properly applied:
   - Open Firefox Developer Tools (F12)
   - Use Inspector tab to examine elements
   - Verify Tailwind classes are present in the computed styles
**Step 2:** Test responsive design using Firefox's Responsive Design Mode:
   - Press Ctrl+Shift+M to toggle Responsive Design Mode
   - Test different device sizes and orientations
   - Check for layout issues at various breakpoints
**Step 3:** Test both English and Arabic layouts:
   - Use the language toggle feature in your app
   - Check for text overflow, alignment issues, or RTL problems
   - Verify Arabic text displays correctly
**Step 4:** Check console for hydration errors:
   - Open Console tab in Firefox Developer Tools
   - Look for React hydration warnings or errors
   - Check for mismatched server/client rendering

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