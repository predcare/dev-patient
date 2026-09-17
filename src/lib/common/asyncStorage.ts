import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@auth_storage',
  FCM_TOKEN: '@fcm_token',
  DEVICE_ID: '@device_id',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS] | string;

export async function setItem(key: StorageKey, value: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`[AsyncStorage] Error setting item for key "${key}":`, error);
    return false;
  }
}

export async function getItem(
  key: StorageKey,
  defaultValue: string | null = null
): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`[AsyncStorage] Error getting item for key "${key}":`, error);
    return defaultValue;
  }
}

export async function setObject<T>(key: StorageKey, value: T): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`[AsyncStorage] Error setting object for key "${key}":`, error);
    return false;
  }
}

export async function getObject<T>(
  key: StorageKey,
  defaultValue: T | null = null
): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue !== null && jsonValue !== undefined && jsonValue !== 'undefined') {
      return JSON.parse(jsonValue) as T;
    }
    return defaultValue;
  } catch (error) {
    console.error(`[AsyncStorage] Error getting object for key "${key}":`, error);
    return defaultValue;
  }
}

export async function removeItem(key: StorageKey): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[AsyncStorage] Error removing item for key "${key}":`, error);
    return false;
  }
}

export async function clearStorage(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    console.log('[AsyncStorage] Storage cleared successfully');
    return true;
  } catch (error) {
    console.error('[AsyncStorage] Error clearing storage:', error);
    return false;
  }
}

export async function clearStorageExcept(
  excludeKeys: (StorageKey | string)[] = [STORAGE_KEYS.FCM_TOKEN, STORAGE_KEYS.DEVICE_ID]
): Promise<boolean> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter(key => !excludeKeys.includes(key));
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
    console.log('[AsyncStorage] Storage cleared except excluded keys:', excludeKeys);
    return true;
  } catch (error) {
    console.error('[AsyncStorage] Error clearing storage except keys:', error);
    return false;
  }
}

export async function getAllKeys(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys];
  } catch (error) {
    console.error('[AsyncStorage] Error getting all keys:', error);
    return [];
  }
}

export async function multiGet(keys: StorageKey[]): Promise<Record<string, string | null>> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, string | null> = {};
    pairs.forEach(([key, value]) => {
      result[key] = value;
    });
    return result;
  } catch (error) {
    console.error('[AsyncStorage] Error executing multiGet:', error);
    return {};
  }
}

export default {
  STORAGE_KEYS,
  setItem,
  getItem,
  setObject,
  getObject,
  removeItem,
  clearStorage,
  clearStorageExcept,
  getAllKeys,
  multiGet,
};
