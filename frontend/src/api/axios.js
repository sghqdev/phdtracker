import axios from 'axios';

// Create a basic instance without any special configuration
const api = axios.create({
  // Explicitly set baseURL to use the React dev server
  baseURL: 'http://localhost:9001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Log outgoing requests
    console.log('🚀 Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('✅ Response Success:', {
      url: response.config.url,
      status: response.status,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      length: Array.isArray(response.data) ? response.data.length : null,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error responses
    console.log('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api; 