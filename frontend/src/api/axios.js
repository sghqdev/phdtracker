import axios from 'axios';

// Create a basic instance without any special configuration
const api = axios.create({
  // Explicitly set baseURL to use the React dev server
  baseURL: 'http://localhost:9001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Single request interceptor with complete logging
api.interceptors.request.use(
  (config) => {
    // Add this detailed URL logging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('📍 Request URL Details:', {
      baseURL: config.baseURL,
      path: config.url,
      fullUrl: fullUrl,
      method: config.method?.toUpperCase()
    });
    
    const requestInfo = {
      fullUrl,
      method: config.method?.toUpperCase(),
      headers: config.headers,
      withCredentials: config.withCredentials,
      params: config.params,
      data: config.data
    };
    
    console.log('🚀 Outgoing Request:', requestInfo);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
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
    console.error('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api; 