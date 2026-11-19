const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const ApiService = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async checkHealth(): Promise<{ status: string; database?: string; uptime?: string } | null> {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Backend not running or unreachable
    }
    return null;
  },

  async fetchPatients(): Promise<any[] | null> {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API fetch patients failed, using local storage fallback');
    }
    return null;
  },

  async createPatient(patientData: any): Promise<any | null> {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API create patient failed, using local storage');
    }
    return null;
  },

  async fetchRules(): Promise<any[] | null> {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/rules`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API fetch rules failed, using local storage');
    }
    return null;
  }
};
