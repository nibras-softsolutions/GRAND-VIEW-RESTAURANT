import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  API_URL: 'gvr_api_url',
  DELIVERY_TOKEN: 'gvr_delivery_token',
};

// Default backend URL:
// On Android emulator: 10.0.2.2 points to host machine localhost:3000
// On iOS simulator: localhost:3000
// On real physical devices or production: https://grand-view-restaurant.vercel.app
const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000');

// Fallback production URL if local dev server cannot be reached
export const PRODUCTION_API_URL = 'https://grand-view-restaurant.vercel.app';

let cachedApiUrl: string | null = null;
let cachedDeliveryToken: string | null = null;

export async function getApiBaseUrl(): Promise<string> {
  if (cachedApiUrl) return cachedApiUrl;
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
    if (saved) {
      cachedApiUrl = saved;
      return saved;
    }
  } catch (e) {
    console.warn('Could not read API URL from storage', e);
  }
  cachedApiUrl = DEFAULT_API_URL;
  return DEFAULT_API_URL;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  const cleanUrl = url.trim().replace(/\/$/, '');
  cachedApiUrl = cleanUrl;
  await AsyncStorage.setItem(STORAGE_KEYS.API_URL, cleanUrl);
}

export async function getDeliveryToken(): Promise<string | null> {
  if (cachedDeliveryToken) return cachedDeliveryToken;
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.DELIVERY_TOKEN);
    cachedDeliveryToken = token;
    return token;
  } catch {
    return null;
  }
}

export async function setDeliveryToken(token: string | null): Promise<void> {
  cachedDeliveryToken = token;
  if (token) {
    await AsyncStorage.setItem(STORAGE_KEYS.DELIVERY_TOKEN, token);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.DELIVERY_TOKEN);
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  const token = await getDeliveryToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-delivery-session'] = token;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const timeoutMs = options.timeoutMs || 12000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      (err as any).status = response.status;
      (err as any).data = data;
      throw err;
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // If local dev server failed, attempt transparent fallback to production cloud deployment
    if (
      baseUrl !== PRODUCTION_API_URL &&
      (error.name === 'AbortError' || error.message?.includes('Network request failed') || error.code === 'ECONNREFUSED')
    ) {
      console.log(`Local backend unreachable at ${baseUrl}, falling back to ${PRODUCTION_API_URL}`);
      try {
        const fallbackUrl = `${PRODUCTION_API_URL}${cleanPath}`;
        const fallbackRes = await fetch(fallbackUrl, { ...options, headers });
        const fallbackData = await fallbackRes.json().catch(() => ({}));
        if (!fallbackRes.ok) {
          throw new Error(fallbackData?.error || 'Cloud API request failed.');
        }
        return fallbackData as T;
      } catch (fallbackErr) {
        throw new Error('Unable to connect to Grand View Restaurant servers. Please check your internet connection.');
      }
    }

    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your network and try again.');
    }
    throw error;
  }
}
