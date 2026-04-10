import { customFetch } from '../app/actions/api';

const apiClient = {
  get: async (url: string) => {
    const data = await customFetch(url, { method: 'GET' });
    return { data }; // Wrap simulating axios response
  },
  post: async (url: string, body: any, config?: any) => {
    let defaultBody = body;
    let headers: any = {};
    
    if (body instanceof FormData) {
      // Server Actions can struggle with FormData directly over JSON stringification,
      // but next-js handles FormData natively if we pass it directly
      defaultBody = body;
      // Let browser set the multipart boundary automatically
    } else {
      defaultBody = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }

    const data = await customFetch(url, { 
      method: 'POST', 
      body: defaultBody,
      headers: config?.headers ? { ...headers, ...config.headers } : headers
    });
    return { data };
  },
  put: async (url: string, body: any) => {
    const data = await customFetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { data };
  },
  patch: async (url: string, body: any) => {
    const data = await customFetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { data };
  },
  delete: async (url: string) => {
    const data = await customFetch(url, { method: 'DELETE' });
    return { data };
  },
};

export default apiClient;
