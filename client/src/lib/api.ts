// Centralized API utility functions
// This ensures API calls are properly routed to the backend

const API_BASE = ''; // Use relative URLs for same-origin requests

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', headers = {}, body } = options;
  
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
    credentials: 'include', // Include cookies for session auth
  });

  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Expected JSON response, got ${contentType}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Specific API functions
export const api = {
  // Tasks
  getTasks: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/tasks${query ? `?${query}` : ''}`);
  },
  
  createTask: (task: any) => {
    return apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },
  
  updateTask: (id: string, updates: any) => {
    return apiRequest(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  deleteTask: (id: string) => {
    return apiRequest(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Files
  getFiles: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/files${query ? `?${query}` : ''}`);
  },

  // Messages
  getMessages: (channelId: string) => {
    return apiRequest(`/api/channels/${channelId}/messages`);
  },
  
  sendMessage: (channelId: string, message: any) => {
    return apiRequest(`/api/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },
};