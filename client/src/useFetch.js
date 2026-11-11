import { useEffect, useState } from 'react';
import { api } from './api/client.js';

// Fetches `path` whenever it changes. Pass null to skip.
export function useFetch(path) {
  const [state, setState] = useState({ data: null, loading: !!path, error: null });

  useEffect(() => {
    if (!path) return;
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path)
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error: error.message }));
    return () => {
      active = false;
    };
  }, [path]);

  return { ...state, setData: (data) => setState((s) => ({ ...s, data })) };
}
