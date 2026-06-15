import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '@/shared/api/apiConfig';
import { STORAGE_KEYS } from '@/shared/constants/storageKeys';

interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
}

export async function apiRequest<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const { authenticated = false, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set('Accept', 'application/json');

  if (requestOptions.body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (authenticated) {
    const token = await getStoredToken();

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Erro ao comunicar com a API');
  }

  return payload as TResponse;
}

async function getStoredToken() {
  const rawSession = await AsyncStorage.getItem(STORAGE_KEYS.auth);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession)?.token ?? null;
  } catch {
    return null;
  }
}
