import { useRef, useState } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import { importFetchedAccounts } from 'flavours/glitch/actions/importer';
import { apiRequest } from 'flavours/glitch/api';
import type { ApiAccountJSON } from 'flavours/glitch/api_types/accounts';
import { useAppDispatch } from 'flavours/glitch/store';

export function useSearchAccounts({
  onSettled,
}: {
  onSettled?: (value: string) => void;
} = {}) {
  const dispatch = useAppDispatch();

  const [accountIds, setAccountIds] = useState<string[]>();
  const [loadingState, setLoadingState] = useState<
    'idle' | 'loading' | 'error'
  >('idle');

  const searchRequestRef = useRef<AbortController | null>(null);

  const searchAccounts = useDebouncedCallback(
    (value: string) => {
      if (searchRequestRef.current) {
        searchRequestRef.current.abort();
      }

      if (value.trim().length === 0) {
        onSettled?.('');
        return;
      }

      setLoadingState('loading');

      searchRequestRef.current = new AbortController();

      void apiRequest<ApiAccountJSON[]>('GET', 'v1/accounts/search', {
        signal: searchRequestRef.current.signal,
        params: {
          q: value,
          resolve: true,
        },
      })
        .then((data) => {
          dispatch(importFetchedAccounts(data));
          setAccountIds(data.map((a) => a.id));
          setLoadingState('idle');
          onSettled?.(value);
        })
        .catch(() => {
          setLoadingState('error');
          onSettled?.(value);
        });
    },
    500,
    { leading: true, trailing: true },
  );

  return {
    searchAccounts,
    accountIds,
    isLoading: loadingState === 'loading',
    isError: loadingState === 'error',
  };
}
