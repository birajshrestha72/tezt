const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export default {
  async get<T>(url: string): Promise<{ data: T }> {
    const response = await fetch(`${baseUrl}${url}`, { credentials: 'include' });
    const data = await response.json();
    return { data } as { data: T };
  },

  async post<T>(url: string, body: unknown): Promise<{ data: T }> {
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return { data } as { data: T };
  },

  async put<T>(url: string, body?: unknown): Promise<{ data: T }> {
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    return { data } as { data: T };
  },

  async delete<T>(url: string): Promise<{ data: T }> {
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    return { data } as { data: T };
  },
};
