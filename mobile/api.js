import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function deriveBaseUrl() {
  const envUrl = process?.env?.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  const extraUrl = Constants?.expoConfig?.extra?.apiUrl;
  if (extraUrl && extraUrl !== '${EXPO_PUBLIC_API_URL}') return extraUrl;
  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3001`;
  }
  return 'http://localhost:3001';
}

const BASE_URL = deriveBaseUrl();

async function request(path, method = 'GET', body) {
  const token = await AsyncStorage.getItem('academia_pro_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
  return json;
}

export const api = {
  auth: {
    async login(email, password) {
      return request('/api/auth/login', 'POST', { email, password });
    },
    async register(email, password) {
      return request('/api/auth/register', 'POST', { email, password });
    },
    async me() {
      return request('/api/users/me');
    }
  },
  workouts: {
    async get() {
      return request('/api/workouts');
    },
    async saveDay(dayKey, payload) {
  return request(`/api/workouts/${dayKey}`, 'POST', { ...payload, day: dayKey });
    },
    async deleteDay(dayKey) {
      return request(`/api/workouts/${dayKey}`, 'DELETE');
    }
  },
  exercises: {
    async all() {
      const res = await request('/api/exercises');
      // Flatten to a simple array of names
      const data = res?.data || {};
      const names = [];
      Object.keys(data).forEach(group => {
        Object.values(data[group]).forEach(arr => {
          arr.forEach(name => names.push(name));
        })
      });
      return names;
    }
  },
  _config: { BASE_URL },
};
