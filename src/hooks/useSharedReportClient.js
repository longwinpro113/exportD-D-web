import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'report.sharedClient';
let sharedClientValue = '';
const listeners = new Set();

const readStoredClient = () => {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return sharedClientValue || '';
  }
};

const setSharedClientValue = (nextClient) => {
  sharedClientValue = nextClient || '';
  try {
    if (sharedClientValue) window.localStorage.setItem(STORAGE_KEY, sharedClientValue);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures and keep the UI usable.
  }
  listeners.forEach((listener) => listener(sharedClientValue));
};

const useSharedReportClient = () => {
  const [client, setClient] = useState(readStoredClient);

  useEffect(() => {
    sharedClientValue = client || '';
  }, [client]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      const nextClient = event.newValue || '';
      sharedClientValue = nextClient;
      setClient(nextClient);
      listeners.forEach((listener) => listener(nextClient));
    };

    const onSharedClientChange = (nextClient) => {
      setClient(nextClient || '');
    };

    window.addEventListener('storage', onStorage);
    listeners.add(onSharedClientChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      listeners.delete(onSharedClientChange);
    };
  }, []);

  const updateClient = useCallback((nextClient) => {
    setSharedClientValue(nextClient);
  }, []);

  return [client, updateClient];
};

export default useSharedReportClient;
