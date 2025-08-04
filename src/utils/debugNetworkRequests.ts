// Monitor all network requests
export const enableNetworkDebugging = () => {
  if (import.meta.env.DEV) {
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      let url: string;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else if (input instanceof URL) {
        url = input.toString();
      } else {
        url = String(input);
      }
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